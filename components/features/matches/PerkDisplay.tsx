import React from 'react';
import { PERK_IMAGES } from '../../../constants/gameData';
import type { PerkData } from '../../../types';

interface PerkDisplayProps {
    perks: Record<string, PerkData>;
    onViewAll: (e: React.MouseEvent) => void;
    t: (key: string) => string;
}

const PerkDisplay: React.FC<PerkDisplayProps & { showAll?: boolean }> = ({ perks, onViewAll, t, showAll }) => {
    const perkList = Object.values(perks);

    if (perkList.length === 0) return null;

    const displayedPerks = showAll ? perkList : perkList.slice(0, 6);

    return (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 hover:bg-purple-500/15 transition-colors">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{t('stats.perks')}</p>
            <div className="flex flex-wrap gap-2">
                {displayedPerks.map((perk, index) => (
                    <div key={index} className="relative w-8 h-8 flex-shrink-0 group/perk" title={`${perk.displayName} (${perk.uses} uso${perk.uses !== 1 ? 's' : ''})`}>
                        <img
                            src={PERK_IMAGES[perk.displayName] || './data/images/Nuketown_menu_selection_BO2.jpg'}
                            alt={perk.displayName}
                            className="w-full h-full object-contain group-hover/perk:scale-110 transition-transform"
                        />
                        {perk.uses > 1 && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-[8px] font-bold text-white">{perk.uses}</span>
                            </div>
                        )}
                    </div>
                ))}
                {!showAll && perkList.length > 6 && (
                    <button
                        onClick={onViewAll}
                        className="w-8 h-8 bg-purple-500/20 hover:bg-purple-500/30 rounded flex items-center justify-center text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                        title={t('stats.viewAllPerks')}
                    >
                        +
                    </button>
                )}
            </div>
        </div>
    );
};

export default PerkDisplay;
