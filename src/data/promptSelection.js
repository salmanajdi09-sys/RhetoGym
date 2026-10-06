const memory = {};

// Keep constraints exact; avoid repetition within the chosen category and level.
export default function selectPrompt(list, category, level) {
  const mode = list[0]?.id.split("-")[0] || "training";
  let recent = memory[mode] || [];
  try { recent = JSON.parse(sessionStorage.getItem(`rhetogym-variety-${mode}`) || "null") || recent; } catch { /* Variety still works in memory when storage is blocked. */ }
  let pool = list.filter((p) => (!level || level === "any" || p.level === level) && (!category || category === "surprise" || p.cats.includes(category)));
  if (!pool.length) throw new Error("No challenges match this selection.");
  const last = recent.at(-1);
  const avoid = (predicate) => { const options = pool.filter(predicate); if (options.length) pool = options; };
  if (last) {
    avoid((p) => p.id !== last.id);
    if (last.side) avoid((p) => p.side !== last.side);
    avoid((p) => (p.structure || p.type) !== last.structure);
    if (!category || category === "surprise") avoid((p) => p.cats[0] !== last.category);
    if (!level || level === "any") avoid((p) => p.level !== last.level);
  }
  const score = (p) => recent.reduce((n, old, i) => n + (old.id === p.id ? (i + 1) * 10 : 0) + (old.structure === (p.structure || p.type) ? i + 1 : 0), 0);
  const best = Math.min(...pool.map(score));
  const candidates = pool.filter((p) => score(p) === best);
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  recent = [...recent, { id: chosen.id, side: chosen.side, structure: chosen.structure || chosen.type, category: chosen.cats[0], level: chosen.level }].slice(-12);
  memory[mode] = recent;
  try { sessionStorage.setItem(`rhetogym-variety-${mode}`, JSON.stringify(recent)); } catch { /* Only randomness history is optional, never saved reviews. */ }
  return chosen;
}
