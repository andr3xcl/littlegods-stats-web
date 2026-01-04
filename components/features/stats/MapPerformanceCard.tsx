import React, { memo, useState } from 'react';
import { Target, Crosshair, Heart, Trophy, ChevronDown, Play, Clock, Timer } from 'lucide-react';
import { UserDownIcon } from '../../common/icons';
import { useLanguage } from '../../../contexts/LanguageContext';
import LazyImage from '../../common/LazyImage';
import { MAP_BANNERS, MAP_NAME_TO_CODE } from '../../../constants';
import { getMapImage } from '../../../constants/gameData';
import { useSettings } from '../../../contexts/SettingsContext';
import type { MapStats } from '../../../types';
import { formatSecondsToDuration } from '../../../utils/formatTime';

import { useUISounds } from '../../../hooks/useUISounds';

interface MapPerformanceCardProps {
    mapId: string;
    mapName: string;
    stats: MapStats;
    onOpenModal: () => void;
}

const MapPerformanceCard: React.FC<MapPerformanceCardProps> = memo(({ mapId, mapName, stats, onOpenModal }) => {
    const { t } = useLanguage();
    const { mapImagePreference } = useSettings();
    const [isHovered, setIsHovered] = useState(false);
    const { playHover, playSelect } = useUISounds();

    const mapBanner = getMapImage(mapId, mapImagePreference);

    return (
        <div
            className="group relative aspect-[16/10] rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20"
            onMouseEnter={() => {
                setIsHovered(true);
                playHover();
            }}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
                playSelect();
                onOpenModal();
            }}
        >
            { }
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                <LazyImage
                    src={mapBanner}
                    alt={`${mapName} banner`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>
            </div>

            { }
            <div className="relative h-full p-6 z-10">



                { }
                <div className="flex flex-col">
                    <h3 className="text-xl font-black text-white tracking-tight drop-shadow-lg mb-2">
                        {mapName}
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-0.5 rounded-full font-black text-[10px] shadow-lg border border-orange-400/20">
                            {t('stats.round')} {stats.topRound}
                        </div>
                        {stats.totalTimePlayed !== undefined && stats.totalTimePlayed > 0 && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-500/20 backdrop-blur-md border border-blue-500/20 text-[10px] font-bold text-blue-200">
                                <Timer className="w-3 h-3 text-blue-400" />
                                <span>
                                    {formatSecondsToDuration(stats.totalTimePlayed)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                { }
                <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-12 transform transition-all duration-500 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-[20%] opacity-0 pointer-events-none'}`}>
                    <div className="space-y-3">
                        { }
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <Target className="w-3.5 h-3.5 text-red-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('stats.kills')}</span>
                                </div>
                                <span className="text-lg font-black text-white">{stats.totalKills.toLocaleString()}</span>
                            </div>

                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <Crosshair className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('stats.headshots')}</span>
                                </div>
                                <span className="text-lg font-black text-white">{stats.totalHeadshots.toLocaleString()}</span>
                            </div>
                        </div>

                        { }
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <Heart className="w-3.5 h-3.5 text-green-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('stats.revives')}</span>
                                </div>
                                <span className="text-base font-bold text-slate-200">{stats.totalRevives.toLocaleString()}</span>
                            </div>

                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <UserDownIcon className="w-3.5 h-3.5 text-orange-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('stats.downs')}</span>
                                </div>
                                <span className="text-base font-bold text-slate-200">{stats.totalDowns.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default MapPerformanceCard;
