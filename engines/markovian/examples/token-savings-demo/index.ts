/**
 * Side-by-side token-cost comparison.
 *
 * Same goal, same per-step output size. Two strategies:
 *   Markovian — bounded carryover
 *   Naive     — append-history (every step ships all prior outputs)
 */

const F = 400;  // framing
const G = 200;  // goal
const S = 300;  // step input
const O = 1200; // average per-step output
const C = 800;  // carryover

function markovianRun(N: number) {
  // Matches the symbolic model in docs/efficiency-model.md:
  // markovian_total = N * (F + G + C + S). C is budgeted every step
  // (a simplification — chunk 1 has no real carryover; the model keeps
  // the constant-per-step shape so the worked examples stay reproducible).
  let total = 0;
  const perStep: number[] = [];
  for (let i = 0; i < N; i++) {
    const tokensIn = F + G + C + S;
    perStep.push(tokensIn);
    total += tokensIn;
  }
  return { perStep, total };
}

function naiveRun(N: number) {
  let total = 0;
  const perStep: number[] = [];
  for (let i = 0; i < N; i++) {
    const tokensIn = F + G + i * O + S;
    perStep.push(tokensIn);
    total += tokensIn;
  }
  return { perStep, total };
}

const checkpoints = [5, 10, 20, 50, 100];

console.log(`Per-step constants: F=${F} G=${G} S=${S} O=${O} C=${C}\n`);
console.log("steps  markovian_total   naive_total   savings    efficiency");
console.log("─────  ───────────────   ───────────   ───────    ──────────");

for (const N of checkpoints) {
  const m = markovianRun(N);
  const n = naiveRun(N);
  const savings = n.total - m.total;
  const eff = ((savings / n.total) * 100).toFixed(1);
  console.log(
    `${String(N).padStart(5)}  ${String(m.total).padStart(15)}   ${String(n.total).padStart(11)}   ${String(savings).padStart(7)}   ${eff.padStart(6)}%`,
  );
}

console.log("\nAt 50 steps, naive would have shipped ~", naiveRun(50).total, "input tokens.");
console.log("At 50 steps, Markovian ships ~", markovianRun(50).total, "input tokens.");
console.log("\nMarkovian wins from chunk ~3 onwards (breakeven: N > 1 + 2C/O).");
