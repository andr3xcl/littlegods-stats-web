import React from 'react';
import { WEAPON_IMAGES, getWeaponBaseName } from '../../../constants/gameData';
import type { WeaponData } from '../../../types';

interface WeaponDisplayProps {
    bestWeapon?: {
        name: string;
        displayName: string;
        kills: number;
    };
    weapons: Record<string, WeaponData>;
    onViewAll: (e: React.MouseEvent) => void;
    t: (key: string) => string;
}

const WeaponDisplay: React.FC<WeaponDisplayProps & { showAll?: boolean }> = ({ bestWeapon, weapons, onViewAll, t, showAll }) => {
    if (!bestWeapon) return null;

    if (showAll) {
        return (
            <div className="space-y-4">
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{t('stats.weapons')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.values(weapons).sort((a, b) => b.kills - a.kills).map((weapon) => (
                            <div key={weapon.name} className="flex items-center gap-3 bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                                <div className="relative w-10 h-10 flex-shrink-0">
                                    <img
                                        src={WEAPON_IMAGES[getWeaponBaseName(weapon.displayName)] || './data/images/Nuketown_menu_selection_BO2.jpg'}
                                        alt={weapon.displayName}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                                        {weapon.displayName}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-orange-500 dark:text-orange-400 font-medium">{weapon.kills} kills</span>
                                        {weapon.headshots > 0 && (
                                            <span className="text-yellow-500 dark:text-yellow-400">{weapon.headshots} HS</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 hover:bg-orange-500/15 transition-colors">
            <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex-shrink-0">
                    <img
                        src={WEAPON_IMAGES[getWeaponBaseName(bestWeapon.displayName)] || './data/images/Nuketown_menu_selection_BO2.jpg'}
                        alt={bestWeapon.displayName}
                        className="w-full h-full object-contain"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-600 dark:text-slate-400">{t('stats.bestWeapon')}</p>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400 truncate">
                        {bestWeapon.displayName}
                    </p>
                    <p className="text-xs text-orange-500 dark:text-orange-300">
                        {bestWeapon.kills} kills
                    </p>
                </div>
                {Object.keys(weapons).length > 1 && (
                    <button
                        onClick={onViewAll}
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-xs font-medium underline hover:no-underline transition-all"
                    >
                        {t('stats.viewAll')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default WeaponDisplay;
