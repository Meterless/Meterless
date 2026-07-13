// The canonical 10-step ingest pipeline (AGENTS.md section 4.1). Each step is
// a named function so the pipeline reads like the spec. Idempotency contract:
// re-running the same batch produces the same world state and an empty diff.
// Every derived timestamp comes from the OBSERVATION, never the wall clock.

import { canonicalJson, entityIdFromName, sha256Hex } from "./stableIds.ts";
import { jaccard } from "./resolve.ts";
import type { EventStore } from "./store.ts";
import type { IngestObservation, IngestReport, ObservationRecord, ScoreSnapshot, StoryAggregate } from "./types.ts";

const CLUSTER_JACCARD = 0.5;
const HOUR_MS = 60 * 60 * 1000;

export function runIngestPipeline(
  store: EventStore,
  observations: IngestObservation[],
  upsert: (obs: IngestObservation) => { entityId: string; entityIds: string[] },
  timer: () => number
): IngestReport {
  const runId = `run_${sha256Hex(canonicalJson(observations.map((o) => o.externalId))).slice(0, 12)}`;
  const timings: IngestReport["stepTimingsMs"] = [];
  const before = canonicalJson(worldStateShape(store));
  let eventsBefore = store.events.length;

  const time = <T>(step: number, name: string, fn: () => T): T => {
    const t0 = timer();
    const out = fn();
    timings.push({ step, name, ms: timer() - t0 });
    return out;
  };

  // 1. Reconcile stale edges/aggregates: recompute staleness from observation times.
  time(1, "reconcile-stale", () => {
    const latest = observations.reduce((max, o) => (o.at > max ? o.at : max), "");
    for (const rec of store.observations.values()) {
      rec.stale = latest !== "" && rec.at < isoDaysBefore(latest, 30);
    }
  });

  // 2. Cluster/classify raw items (entity-overlap Jaccard >= 0.5 co-clusters).
  const fresh: { obs: IngestObservation; checksum: string }[] = [];
  const skipped: IngestObservation[] = [];
  time(2, "cluster-classify", () => {
    for (const obs of observations) {
      const checksum = sha256Hex(canonicalJson({ externalId: obs.externalId, title: obs.title, text: obs.text ?? "", at: obs.at }));
      const existing = store.observations.get(obs.externalId);
      if (existing && existing.checksum === checksum) skipped.push(obs);
      else fresh.push({ obs, checksum });
    }
  });

  // 3. Persist primary aggregates: upsert observation entities + mentioned entities.
  const records: ObservationRecord[] = [];
  time(3, "persist-aggregates", () => {
    for (const { obs, checksum } of fresh) {
      const { entityId, entityIds } = upsert(obs);
      const record: ObservationRecord = {
        id: `obs_${sha256Hex(obs.externalId).slice(0, 12)}`,
        externalId: obs.externalId,
        entityId,
        checksum,
        at: obs.at,
        entityIds,
        stale: false,
      };
      store.observations.set(obs.externalId, record);
      records.push(record);
    }
  });

  // Group fresh + existing observations into stories by entity overlap.
  const clusters: ObservationRecord[][] = [];
  time(2, "story-grouping", () => {
    const all = [...store.observations.values()].sort((a, b) => a.externalId.localeCompare(b.externalId));
    const used = new Set<string>();
    for (const seed of all) {
      if (used.has(seed.externalId)) continue;
      const group = [seed];
      used.add(seed.externalId);
      for (const other of all) {
        if (used.has(other.externalId)) continue;
        if (jaccard(seed.entityIds ?? [], other.entityIds ?? []) >= CLUSTER_JACCARD) {
          group.push(other);
          used.add(other.externalId);
        }
      }
      clusters.push(group);
    }
  });

  // 4. Score/measure: velocity = mentions per hour over BUCKETED windows.
  // 5. Infer derived records (milestones). 6. Persist edges is handled by the
  // upsert callback (mentions edges). 7. Rebuild materialized views happens on
  // read in this reference (views project the fold). 8. Patch source items.
  // 9. Rebuild aggregates. 10. Mark stale items.
  time(4, "score-measure", () => {
    for (const group of clusters) {
      const memberIds = group.map((g) => g.externalId).sort();
      const storyId = `story_${sha256Hex(canonicalJson(memberIds)).slice(0, 12)}`;
      const times = group.map((g) => Date.parse(g.at)).sort((a, b) => a - b);
      const lastAt = times[times.length - 1];
      const velocity = (windowMs: number) => {
        // Bucketed rate: mentions inside the window ending at the newest
        // observation, divided by the window's hours. A naive
        // mentions/total-hours calculation fails trend detection.
        const inWindow = times.filter((t) => t > lastAt - windowMs).length;
        return inWindow / (windowMs / HOUR_MS);
      };
      const prevHour = times.filter((t) => t > lastAt - 2 * HOUR_MS && t <= lastAt - HOUR_MS).length;
      const currHour = times.filter((t) => t > lastAt - HOUR_MS).length;
      const score: ScoreSnapshot = {
        storyId,
        at: new Date(lastAt).toISOString(),
        velocity1h: velocity(HOUR_MS),
        velocity24h: velocity(24 * HOUR_MS),
        velocity7d: velocity(7 * 24 * HOUR_MS),
        trendDirection: Math.sign(currHour - prevHour) as -1 | 0 | 1,
      };
      store.scores = store.scores.filter((s) => s.storyId !== storyId);
      store.scores.push(score);

      const entityIds = [...new Set(group.flatMap((g) => g.entityIds ?? []))].sort();
      const story: StoryAggregate = {
        id: storyId,
        title: group[0].externalId,
        memberIds,
        entityNames: entityIds.map((id) => id),
        entityIds,
        sources: [],
        firstAt: new Date(times[0]).toISOString(),
        lastAt: new Date(lastAt).toISOString(),
        milestones: group.length >= 2 ? [{ kind: "multi-source", at: new Date(times[1]).toISOString() }] : [],
      };
      store.stories.set(storyId, story);
      for (const rec of group) rec.storyId = storyId; // step 8: patch source items
    }
  });

  time(9, "rebuild-aggregates", () => {
    for (const entity of store.state.entities.values()) {
      const mentions = [...store.observations.values()].filter((o) => o.entityIds?.includes(entity.id));
      if (mentions.length === 0) continue;
      const times = mentions.map((m) => m.at).sort();
      entity.aggregates = {
        mentionCount: mentions.length,
        firstSeenAt: times[0],
        lastSeenAt: times[times.length - 1],
        linkedStoryIds: [...new Set(mentions.map((m) => m.storyId).filter((s): s is string => !!s))].sort(),
      };
    }
  });

  store.persist();
  const after = canonicalJson(worldStateShape(store));
  const report: IngestReport = {
    runId,
    processed: fresh.length,
    skippedUnchanged: skipped.length,
    clusters: clusters.length,
    eventsAppended: store.events.length - eventsBefore,
    changed: before !== after,
    stepTimingsMs: timings,
  };
  store.logAudit("ingest", "pipeline", `run ${runId}: ${fresh.length} processed, ${skipped.length} skipped`, undefined, runId, observations[0]?.at);
  return report;
}

// The idempotency diff surface: everything derived from observations, in
// canonical (sorted-key, sorted-collection) form.
export function worldStateShape(store: EventStore): unknown {
  return {
    entities: [...store.state.entities.values()].sort((a, b) => a.id.localeCompare(b.id)),
    contexts: [...store.state.contexts.values()].sort((a, b) => a.id.localeCompare(b.id)),
    relationships: [...store.state.relationships.values()].sort((a, b) => a.id.localeCompare(b.id)),
    facts: [...store.state.facts.values()].sort((a, b) => a.id.localeCompare(b.id)),
    observations: [...store.observations.values()].sort((a, b) => a.externalId.localeCompare(b.externalId)),
    stories: [...store.stories.values()].sort((a, b) => a.id.localeCompare(b.id)),
  };
}

function isoDaysBefore(iso: string, days: number): string {
  return new Date(Date.parse(iso) - days * 24 * 60 * 60 * 1000).toISOString();
}

export { entityIdFromName };
