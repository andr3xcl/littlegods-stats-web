import React, { useState } from 'react';
import { Map as MapIcon, Target, Skull, Heart, Play } from 'lucide-react';
import { UserDownIcon } from '../../common/icons';
import { MAP_NAMES, MAP_IMAGES } from '../../../constants/gameData';
import type { MatchData } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useUISounds } from '../../../hooks/useUISounds';

interface MatchBannerItemProps {
    match: MatchData;
    onClick: () => void;
}

const MatchBannerItem: React.FC<MatchBannerItemProps> = ({ match, onClick }) => {
    const { t } = useLanguage();
    const [isHovered, setIsHovered] = useState(false);
    const { playHover, playSelect } = useUISounds();

    return (
        <div
            className="match-banner w-full group cursor-pointer will-change-transform"
            onClick={() => {
                playSelect();
                onClick();
            }}
            onMouseEnter={() => {
                setIsHovered(true);
                playHover();
            }}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-orange-500/20 hover:border-orange-500/50 transition-all duration-300 aspect-[3/4]">

                {}
                <div className="absolute inset-0">
                    <img
                        src={MAP_IMAGES[match.map] || './data/images/Nuketown_menu_selection_BO2.jpg'}
                        alt={MAP_NAMES[match.map]}
                        className="w-full h-full object-cover object-center transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
                </div>

                {}
                <div className="relative h-full p-5 z-10">

                    {}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-2 items-start">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full border border-orange-500/30">
                                    <MapIcon className="w-3 h-3 text-orange-400" />
                                    <span className="text-[10px] text-orange-400 font-bold uppercase">{t('stats.zombies')}</span>
                                </div>
                                {match.duration && (
                                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full border border-blue-500/30">
                                        <Play className="w-3 h-3 text-blue-400" />
                                        <span className="text-[10px] text-blue-400 font-bold uppercase">{match.duration}</span>
                                    </div>
                                )}
                            </div>
                            <h4 className="text-2xl font-black text-white drop-shadow-lg truncate max-w-[200px]">
                                {MAP_NAMES[match.map]}
                            </h4>
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-0.5 rounded-full font-black text-[10px] shadow-lg border border-orange-400/20">
                                {t('matches.round')} {match.round}
                            </div>
                        </div>
                    </div>

                    {}
                    <div className={`absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-12 transform transition-all duration-500 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-[20%] opacity-0 pointer-events-none'}`}>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <Target className="w-3 h-3 text-red-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('stats.kills')}</span>
                                    </div>
                                    <span className="text-sm font-black text-white">{match.kills}</span>
                                </div>

                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <Skull className="w-3 h-3 text-yellow-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">HS</span>
                                    </div>
                                    <span className="text-sm font-black text-white">{match.headshots}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <Heart className="w-3 h-3 text-green-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('stats.revives')}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-200">{match.revives}</span>
                                </div>

                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <UserDownIcon className="w-3 h-3 text-orange-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('stats.downs')}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-200">{match.downs}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchBannerItem;
