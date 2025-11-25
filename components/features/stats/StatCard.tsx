import React, { useMemo, useRef } from 'react';
import { useGSAP } from '../../../utils/gsap';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactElement<{ className?: string }>;
}

const StatCard: React.FC<StatCardProps> = React.memo(({ label, value, icon }) => {
  const formattedValue = useMemo(() =>
    typeof value === 'number' ? value.toLocaleString() : value,
    [value]
  );

  // GSAP hooks y referencias
  const gsap = useGSAP();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      gsap.animateHoverIn(cardRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      gsap.animateHoverOut(cardRef.current);
    }
  };

  return (
    <div
      ref={cardRef}
      className="bg-slate-800 border border-slate-700 border-t-4 border-t-indigo-500 rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:bg-slate-700/50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="text-indigo-400">
        {React.cloneElement(icon, { className: 'w-8 h-8' })}
      </div>
      <span className="text-4xl font-black text-slate-100 tracking-tighter">
        {formattedValue}
      </span>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
});

export default StatCard;