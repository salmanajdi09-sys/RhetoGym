import { argumentChallenges } from "@/data/argumentChallenges";
import { speakingChallenges } from "@/data/speakingChallenges";
import { reactionChallenges } from "@/data/reactionChallenges";
import selectPrompt from "@/data/promptSelection";

// RhetoGym prompt library — bilingual (EN/FR), categorized, leveled.
// French is written as natural, conversational copy — not translated word-for-word.
// Each prompt carries a `level`: "easy" | "intermediate" | "challenge".
// Think Fast prompts also carry a `type` describing the kind of spontaneous challenge.

export const categories = [
  { id: "everyday", accent: "sky", en: "Everyday Life", fr: "La vie de tous les jours", enDesc: "Opinions, situations, decisions, habits.", frDesc: "Opinions, situations, décisions, habitudes." },
  { id: "people", accent: "lavender", en: "People & Relationships", fr: "Les gens et les relations", enDesc: "Friendship, communication, trust, boundaries.", frDesc: "Amitié, communication, confiance, limites." },
  { id: "culture", accent: "coral", en: "Culture & Entertainment", fr: "La culture et le divertissement", enDesc: "Movies, music, books, trends, fandoms.", frDesc: "Films, musique, livres, tendances, fans." },
  { id: "work", accent: "butter", en: "Work & Ambition", fr: "Le travail et l'ambition", enDesc: "Careers, success, money, goals.", frDesc: "Carrière, réussite, argent, objectifs." },
  { id: "tech", accent: "sky", en: "Technology & the Future", fr: "La techno et le futur", enDesc: "AI, social media, digital life, futures.", frDesc: "IA, réseaux sociaux, vie numérique, futurs." },
  { id: "society", accent: "sage", en: "Society", fr: "La société", enDesc: "Rules, fairness, education, freedom.", frDesc: "Règles, justice, éducation, liberté." },
  { id: "big", accent: "lavender", en: "Big Questions", fr: "Les grandes questions", enDesc: "Truth, happiness, morality, meaning.", frDesc: "Vérité, bonheur, morale, sens." },
  { id: "hottakes", accent: "coral", en: "Hot Takes", fr: "Les opinions tranchées", enDesc: "Strong but accessible opinions.", frDesc: "Opinions nettes mais accessibles." },
  { id: "wildcard", accent: "lavender", en: "Wildcard", fr: "L'imprévu", enDesc: "Unexpected, strange, funny prompts.", frDesc: "Sujets inattendus, étranges, drôles." },
  { id: "surprise", accent: "sky", en: "Surprise Me", fr: "Surprends-moi", enDesc: "Random from the whole library.", frDesc: "Au hasard dans toute la bibliothèque." },
];

export const levels = [
  { id: "easy", accent: "sage", en: "Easy", fr: "Facile", enDesc: "Familiar situations and straightforward choices.", frDesc: "Situations familières et choix simples." },
  { id: "intermediate", accent: "sky", en: "Intermediate", fr: "Intermédiaire", enDesc: "Explain, compare, and develop an idea.", frDesc: "Expliquer, comparer et développer une idée." },
  { id: "challenge", accent: "coral", en: "Hard", fr: "Difficile", enDesc: "Constraints, competing values, and new perspectives.", frDesc: "Contraintes, valeurs en tension et nouveaux points de vue." },
];

// Think Fast challenge types — each gives the round a different shape.
export const thinkfastTypes = [
  { id: "instant", accent: "sage" },
  { id: "pickone", accent: "sky" },
  { id: "complete", accent: "lavender" },
  { id: "defendit", accent: "coral" },
  { id: "reverse", accent: "butter" },
  { id: "whatwouldyoudo", accent: "sky" },
  { id: "wildcard", accent: "lavender" },
];

// Each mode has its own curated library: 54 challenges, two per category/level.
export const debatePrompts = argumentChallenges;
export const soapboxPrompts = speakingChallenges;
export const thinkfastPrompts = reactionChallenges;

// ---------- helpers ----------
export function promptText(p, lang) {
  return p[lang] || p.en;
}

// Difficulty always changes the pool: filter by level first, then narrow by
// category when possible. If a (category, level) cell is empty, we stay on the
// level pool so the difficulty still means something.
export function randomPrompt(list, lang, category, level) {
  return selectPrompt(list, category, level);
}

export function categoryLabel(cat, lang) {
  return cat[lang] || cat.en;
}

export function categoryDesc(cat, lang) {
  return lang === "fr" ? cat.frDesc : cat.enDesc;
}

export function levelLabel(level, lang) {
  const meta = levels.find((l) => l.id === level);
  if (!meta) return "";
  return lang === "fr" ? meta.fr : meta.en;
}

export const floatingWords = ["CLASH", "COUNTER", "WEIGH", "SPEAK", "THINK", "ARGUE", "VOICE"];
