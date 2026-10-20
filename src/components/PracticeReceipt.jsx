return (
    <div className="relative mx-auto max-w-3xl px-5 sm:px-8 py-10">
      {showReceipt && round && (
        <PracticeReceipt 
          round={round} 
          onClose={() => setShowReceipt(false)} 
        />
      )}
      {!showReceipt && (
        <ReviewPanel 
          key={round?.id || prompt?.id} 
          record={round || { category: prompt?.cats[0], difficulty: prompt?.level, promptId: prompt?.id, challengeType: prompt?.type, targetDuration: SPEAK }} 
          audioUrl={rec.audioUrl} 
          transcript={rec.transcript} 
          metrics={metrics} 
          accent={ACCENT} 
          motion={txt} 
          position="SPEAK" 
          drillName="Think Fast" 
          onRetry={retry} 
          showSelfCheck={false} 
        />
      )}
    </div>
  );
}
