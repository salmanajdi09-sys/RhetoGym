export const resilienceMessages = [
  "Rhetoric is muscle memory. Excellent discipline today.",
  "Consistency built. Another solid session in the bank.",
  "Your delivery is sharpening. Smooth reps.",
  "Stage presence isn't luck—it's continuous practice.",
  "Strong finish. Your momentum is building.",
  "Clear mind, solid cadence. Keep pushing."
];

export function getRandomResilienceMessage() {
  return resilienceMessages[Math.floor(Math.random() * resilienceMessages.length)];
}
