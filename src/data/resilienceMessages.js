export const resilienceMessages = [
  // Angle 1: Rhetoric as a physical muscle
  "Rhetoric is muscle memory—and you just put in the work.",

  // Angle 2: Gym discipline & consistency
  "Showing up on low-energy days is where the real progress happens.",

  // Angle 3: Direct progress / On the right path
  "You're building something solid here, one round at a time.",

  // Angle 4: Simple, crisp nod
  "Sharp reps today. You're right on track.",

  // Angle 5: Overcoming hesitation / Speaking confidence
  "The stage gets less intimidating every single time you hit record.",

  // Angle 6: Rhetorical growth
  "Clearer thoughts, smoother delivery. The practice is working."
];

export function getRandomResilienceMessage() {
  return resilienceMessages[Math.floor(Math.random() * resilienceMessages.length)];
}
