// Speaking lengths offered before every round.
export const durations = [
  { value: 40, label: { en: "40 sec", fr: "40 s" } },
  { value: 60, label: { en: "1 min", fr: "1 min" } },
  { value: 90, label: { en: "1 min 30", fr: "1 min 30" } },
  { value: 120, label: { en: "2 min", fr: "2 min" } },
  { value: 180, label: { en: "3 min", fr: "3 min" } },
];

export const durationLabel = (value, lang) => {
  const found = durations.find((d) => d.value === value);
  return found ? found.label[lang] || found.label.en : "";
};
