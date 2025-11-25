import React, { memo, useState } from 'react';
import { Target, Crosshair, Heart, Trophy, ChevronDown, Play } from 'lucide-react';
import { UserDownIcon } from '../../common/icons';
import { useLanguage } from '../../../contexts/LanguageContext';
import LazyImage from '../../common/LazyImage';
import { MAP_BANNERS, MAP_NAME_TO_CODE } from '../../../constants';
import type { MapStats } from '../../../types';

import { useUISounds } from '../../../hooks/useUISounds';

interface MapPerformanceCardProps {
    mapId: string;
    mapName: string;
    stats: MapStats;
    onOpenModal: () => void;
}

const MapPerformanceCard: React.FC<MapPerformanceCardProps> = memo(({ mapId, mapName, stats, onOpenModal }) => {
    const { t } = useLanguage();
    const [isHovered, setIsHovered] = useState(false);
    const { playHover, playSelect } = useUISounds();

    const mapCode = MAP_NAME_TO_CODE[mapId] || mapId;
    const mapBanner = MAP_BANNERS[mapCode] || 'https://picsum.photos/seed/map/400/200';

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
            {}
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                <LazyImage
                    src={mapBanner}
                    alt={`${mapName} banner`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>
            </div>

            {}
            <div className="relative h-full p-6 z-10">

                {}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-lg mb-1">
                            {mapName}
                        </h3>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-slate-200">
                            <Trophy className="w-3 h-3 text-yellow-400" />
                            <span>{t('stats.round')} {stats.topRound}</span>
                        </div>
                    </div>


                </div>

                {}
                <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-12 transform transition-all duration-500 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-[20%] opacity-0 pointer-events-none'}`}>
                    <div className="space-y-3">
                        {}
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

                        {}
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
