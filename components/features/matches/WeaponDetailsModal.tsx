import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, Target } from 'lucide-react';
import type { WeaponData } from '../../../types';
import { WEAPON_IMAGES, getWeaponBaseName } from '../../../constants/gameData';
import { useUISounds } from '../../../hooks/useUISounds';

interface WeaponDetailsModalProps {
    weapon: WeaponData;
    onClose: () => void;
    t: (key: string) => string;
}

const WeaponDetailsModal: React.FC<WeaponDetailsModalProps> = ({ weapon, onClose, t }) => {
    const { playHover, playExit, playSelect } = useUISounds();

    useEffect(() => {
        playSelect();
    }, [playSelect]);

    const handleClose = () => {
        playExit();
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleClose}>
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {}
                <div className="relative h-32 bg-gradient-to-br from-orange-500/20 to-orange-600/5 dark:from-orange-500/10 dark:to-orange-900/10 flex items-center justify-center p-6">
                    <button
                        onClick={handleClose}
                        onMouseEnter={() => playHover()}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-slate-400"
                    >
                        <X size={20} />
                    </button>

                    <div className="w-full max-w-[200px] h-24 relative">
                        <img
                            src={WEAPON_IMAGES[getWeaponBaseName(weapon.displayName)] || './data/images/Nuketown_menu_selection_BO2.jpg'}
                            alt={weapon.displayName}
                            className="w-full h-full object-contain drop-shadow-lg"
                        />
                    </div>
                </div>

                {}
                <div className="p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wide">
                            {weapon.displayName}
                        </h2>
                        <div className="flex items-center justify-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-bold bg-orange-500/10 px-3 py-1 rounded-full">
                                <Target size={14} />
                                {weapon.kills} Kills
                            </span>
                            {weapon.headshots > 0 && (
                                <span className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400 font-bold bg-yellow-500/10 px-3 py-1 rounded-full">
                                    <Target size={14} />
                                    {weapon.headshots} HS
                                </span>
                            )}
                        </div>
                    </div>

                    {}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                            {t('stats.killTimeline') || "Kill Timeline"}
                        </h3>

                        <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                            {weapon.killTimes && weapon.killTimes.length > 0 ? (
                                weapon.killTimes.map((kill, index) => {
                                    const time = typeof kill === 'string' ? kill : kill.time;
                                    const isHeadshot = typeof kill === 'object' && kill.isHeadshot;
                                    const round = typeof kill === 'object' && kill.round ? kill.round : undefined;

                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                                            onMouseEnter={() => playHover()}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${isHeadshot
                                                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white'
                                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 group-hover:bg-orange-500 group-hover:text-white'
                                                    }`}>
                                                    {index + 1}
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                                        Kill #{index + 1}
                                                        {isHeadshot && (
                                                            <Target size={12} className="text-yellow-500" />
                                                        )}
                                                    </span>
                                                    {round && (
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                                            Round {round}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm font-mono text-slate-500 dark:text-slate-400">
                                                <Clock size={14} />
                                                {time}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-slate-400 dark:text-slate-500 italic text-sm">
                                    No detailed kill times available for this weapon.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default WeaponDetailsModal;
