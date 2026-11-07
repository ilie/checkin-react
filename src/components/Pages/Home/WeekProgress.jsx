// The bar for this week's hours against the contract, full at the contract's hours.
function WeekProgress({ seconds, hoursOnContract, className = "" }) {
  const progress = hoursOnContract ? Math.min(100, (seconds / (hoursOnContract * 3600)) * 100) : 0;

  return (
    <div aria-hidden="true" className={`h-1.5 overflow-hidden rounded-full bg-fill ${className}`}>
      <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }}></div>
    </div>
  );
}

export default WeekProgress;
