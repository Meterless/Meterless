// Control-plane app: wires the five operator panels to the real reference
// implementation (exposed as the MeterlessWorldModel global by the inline
// bundle). Plain script, no modules, so file:// works everywhere.
(async function main() {
  const { WorldModel } = MeterlessWorldModel;
  const world = new WorldModel({ storage: "memory", namespace: "live" });
  const at = (s) => ({ kind: "manual", by: "seed", at: s });

  // Seed: externally keyed entities, contexts, relationships, facts, and one
  // name-keyed near-duplicate pair inside the [0.82, 0.85) review band so the
  // merge queue is non-empty on load.
  await world.upsertEntity({ type: "player", externalKey: { system: "gridiron", id: "tommie-frazier-iii" }, attrs: { name: "Tommie Frazier III", position: "QB", tier: "legendary" }, source: at("2026-05-01T10:00:00.000Z") });
  await world.upsertEntity({ type: "team", externalKey: { system: "gridiron", id: "bengals" }, attrs: { name: "Bengals", city: "Cincinnati" }, source: at("2026-05-01T10:01:00.000Z") });
  await world.upsertContext({ type: "season", externalKey: { system: "gridiron", id: "145" }, attrs: { year: 145 }, source: at("2026-05-01T10:02:00.000Z") });
  await world.relate({ from: "player:gridiron:tommie-frazier-iii", type: "plays-for", to: "team:gridiron:bengals", context: "season:gridiron:145", source: at("2026-05-01T10:03:00.000Z") });
  await world.assertFact({ about: "team:gridiron:bengals", predicate: "head-coach", value: "R. Calloway", confidence: 0.9, source: { kind: "api", at: "2026-05-02T09:00:00.000Z" } });
  await world.upsertEntity({ type: "person", name: "Jerome Powell abc", source: at("2026-05-03T08:00:00.000Z") });
  await world.upsertEntity({ type: "person", name: "Jerome Powell x", source: at("2026-05-03T08:05:00.000Z") });

  const content = document.getElementById("content");
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

  const panels = {
    inspect() {
      const entities = world.view("graph").query({});
      return `
        <h2>Inspect</h2>
        <p class="lede">Live entities from the reference store, with provenance.</p>
        ${entities.map((e) => `
          <div class="panel">
            <h3>${esc(e.id)}</h3>
            <pre>${esc(JSON.stringify(e.attrs, null, 2))}</pre>
            <p class="muted">Source: ${esc(e.source.kind)} at ${esc(e.source.at)} | state: ${esc(e.state)}</p>
          </div>`).join("")}
      `;
    },
    merge() {
      const queue = world.mergeQueue();
      const pending = queue.filter((p) => p.status === "pending");
      return `
        <h2>Merge</h2>
        <p class="lede">Real resolver output. Similarity in [0.82, 0.85) queues here; approval commits an alias event.</p>
        ${pending.length === 0 ? '<div class="empty">Queue drained. Approvals and rejections land in the audit log.</div>' : ""}
        ${pending.map((p) => `
          <div class="panel">
            <h3>${esc(p.leftName)} ~ ${esc(p.rightName)}</h3>
            <pre>similarity ${p.similarity.toFixed(3)} | ${esc(p.reason)}</pre>
            <div style="margin-top:8px">
              <button class="btn" data-approve="${esc(p.id)}">Approve merge</button>
              <button class="btn ghost" data-reject="${esc(p.id)}">Keep separate</button>
            </div>
          </div>`).join("")}
        ${queue.filter((p) => p.status !== "pending").map((p) => `
          <div class="panel"><h3>${esc(p.leftName)} ~ ${esc(p.rightName)}</h3><pre>${esc(p.status)} by ${esc(p.resolvedBy ?? "-")}</pre></div>`).join("")}
      `;
    },
    edit() {
      const entities = world.view("graph").query({});
      return `
        <h2>Edit</h2>
        <p class="lede">Correct a fact. The edit is a new event with operator provenance; the original is preserved and superseded.</p>
        <div class="panel">
          <select id="edit-entity">${entities.map((e) => `<option value="${esc(e.id)}">${esc(e.id)}</option>`).join("")}</select>
          <input id="edit-predicate" placeholder="predicate (e.g. tier)" />
          <input id="edit-value" placeholder="value" />
          <button class="btn" id="edit-apply">Assert fact</button>
          <p class="muted">Applied facts appear in Inspect and in the Audit log immediately.</p>
        </div>
      `;
    },
    rebuild() {
      return `
        <h2>Rebuild</h2>
        <p class="lede">Re-project a derived view from the event log. Canonical store untouched.</p>
        <div class="panel">
          <button class="btn" data-rebuild="graph">graph</button>
          <button class="btn" data-rebuild="facts">facts</button>
          <button class="btn" data-rebuild="timeline">timeline</button>
          <div id="rebuild-result" class="muted">Pick a view. Timing and replayed-event count appear here.</div>
        </div>
      `;
    },
    repair() {
      return `
        <h2>Repair</h2>
        <p class="lede">Replay ingest from the top: unchanged observations skip (idempotency), edits supersede.</p>
        <div class="panel">
          <button class="btn" id="repair-run">Replay seed ingest</button>
          <div id="repair-result" class="muted">The report shows processed vs skipped counts from the real pipeline.</div>
        </div>
      `;
    },
    audit() {
      const log = [...world.audit()].reverse();
      return `
        <h2>Audit log</h2>
        <p class="lede">Every mutation, in order, from the live store.</p>
        ${log.map((a) => `
          <div class="panel"><h3>#${a.seq} ${esc(a.kind)}</h3><pre>${esc(a.summary)}\nactor: ${esc(a.actor)} | at: ${esc(a.at)}</pre></div>`).join("")}
      `;
    },
  };

  function render(name) {
    content.innerHTML = panels[name]();
    document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("active", b.dataset.panel === name));
    wire(name);
  }

  function wire(name) {
    if (name === "merge") {
      content.querySelectorAll("[data-approve]").forEach((b) =>
        b.addEventListener("click", async () => { await world.approveMerge(b.dataset.approve, "operator"); render("merge"); }));
      content.querySelectorAll("[data-reject]").forEach((b) =>
        b.addEventListener("click", async () => { await world.rejectMerge(b.dataset.reject, "operator"); render("merge"); }));
    }
    if (name === "edit") {
      content.querySelector("#edit-apply").addEventListener("click", async () => {
        const about = content.querySelector("#edit-entity").value;
        const predicate = content.querySelector("#edit-predicate").value.trim();
        const value = content.querySelector("#edit-value").value.trim();
        if (!predicate || !value) return;
        await world.assertFact({ about, predicate, value, confidence: 0.99, source: { kind: "manual", by: "operator", at: new Date().toISOString() } });
        render("audit");
      });
    }
    if (name === "rebuild") {
      content.querySelectorAll("[data-rebuild]").forEach((b) =>
        b.addEventListener("click", () => {
          const t0 = performance.now();
          const view = world.view(b.dataset.rebuild);
          const result = b.dataset.rebuild === "facts" ? view.about("team:gridiron:bengals") : b.dataset.rebuild === "timeline" ? view.get() : view.query({});
          const ms = (performance.now() - t0).toFixed(2);
          content.querySelector("#rebuild-result").textContent =
            `rebuilt "${b.dataset.rebuild}" in ${ms}ms over ${world.events().length} events (${Array.isArray(result) ? result.length : 1} records)`;
        }));
    }
    if (name === "repair") {
      content.querySelector("#repair-run").addEventListener("click", async () => {
        const report = await world.ingest([
          { externalId: "seed-1", title: "Frazier signs extension", at: "2026-05-04T12:00:00.000Z", source: { kind: "rss", at: "2026-05-04T12:00:00.000Z" }, entities: [{ type: "person", name: "Tommie Frazier III" }] },
          { externalId: "seed-2", title: "Bengals announce staff", at: "2026-05-04T15:00:00.000Z", source: { kind: "rss", at: "2026-05-04T15:00:00.000Z" }, entities: [{ type: "person", name: "Tommie Frazier III" }] },
        ]);
        content.querySelector("#repair-result").textContent =
          `run ${report.runId}: processed=${report.processed} skipped=${report.skippedUnchanged} clusters=${report.clusters} changed=${report.changed} (click again: everything skips)`;
      });
    }
  }

  document.querySelectorAll("nav button").forEach((b) => b.addEventListener("click", () => render(b.dataset.panel)));
  render("inspect");
})();
