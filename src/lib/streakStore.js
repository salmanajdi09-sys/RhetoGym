export function completeRoundAndTriggerStreak(customMessage) {
  const result = recordPracticeSession();
  
  // Dispatch custom event to notify badge to update count + display popup message
  window.dispatchEvent(
    new CustomEvent("rhetogym_streak_updated", {
      detail: { message: customMessage }
    })
  );

  return result;
}
