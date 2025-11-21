import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import PlayerBanner from '../components/PlayerBanner';
import StatCard from '../components/StatCard';
import MapModal from '../components/MapModal';
import ProfileModal from '../components/ProfileModal';
import RecentMatchesBanner from '../components/RecentMatchesBanner';
import LazyImage from '../components/LazyImage';
import { SkullIcon, UserDownIcon, HeartPlusIcon, CrosshairIcon } from '../components/icons';
import { MAP_BANNERS, MAP_NAME_TO_CODE } from '../constants';
import type { PlayerProfile, MapStats } from '../types';
import { Target, Skull, Heart, Award, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Wallet, BarChart3, Gamepad2, RefreshCw, ExternalLink, Activity, Trophy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCachedData } from '../utils/cache';
import { useGSAP } from '../utils/gsap';

interface StatisticsProps {
    player: PlayerProfile;
}

const MAPS = [
    'transit', 'town', 'prison', 'tomb', 'farm', 'nuked', 'processing', 'rooftop'
];

const MAP_DISPLAY_NAMES: { [key: string]: string } = {
    'transit': 'Transit',
    'town': 'Town',
    'prison': 'Prison',
    'tomb': 'Tomb',
    'farm': 'Farm',
    'nuked': 'Nuketown',
    'processing': 'Processing',
    'rooftop': 'Rooftop'
};

const loadPlayerData = async (playerGuid: string) => {
    try {
        const response = await fetch('./data/data_player.json');
        if (response.ok) {
            const allData = await response.json();
            return allData[playerGuid] || null;
        }
    } catch (error) {
        console.warn('No se pudieron cargar datos del jugador:', error);
    }
    return null;
};

const loadAllPlayerData = async () => {
    const response = await fetch('./data/data_player.json');
    if (response.ok) {
        return await response.json();
    }
    throw new Error('No se pudieron cargar datos de jugadores');
};

const Statistics: React.FC<StatisticsProps> = ({ player }) => {
    const [selectedMap, setSelectedMap] = useState<string | null>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [expandedMaps, setExpandedMaps] = useState<Set<string>>(new Set());
    const { t } = useLanguage();

    // Si no hay jugador seleccionado, mostrar página de selección
    if (!player) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="relative z-20 px-4 sm:px-6 md:px-8 pt-8 sm:pt-12 md:pt-16">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center py-16 sm:py-20 md:py-24">
                            <div className="relative inline-block mb-8">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-full scale-150 blur-2xl"></div>
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-full flex items-center justify-center shadow-2xl">
                                    <UserDownIcon className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-blue-400" />
                                </div>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6">
                                {t('stats.selectPlayerTitle')}
                            </h1>

                            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
                                {t('stats.selectPlayerSubtitle')}
                            </p>

                            <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl">
                                <p className="text-slate-600 dark:text-slate-400 text-center">
                                    {t('stats.selectPlayerInstructions')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // GSAP hooks y referencias
    const gsap = useGSAP();
    const mapsRef = useRef<HTMLDivElement>(null);

    // Cargar todos los datos de jugadores una sola vez y cachearlos
    const { data: allPlayerData, loading: loadingPlayerData } = useCachedData(
        'all-player-data',
        loadAllPlayerData
    );

    // Obtener datos del jugador actual usando useMemo para evitar cálculos innecesarios
    const playerData = useMemo(() => {
        if (!allPlayerData || !player.guid) return null;
        return allPlayerData[player.guid] || null;
    }, [allPlayerData, player.guid]);

    // Animaciones de scroll para las tarjetas de mapas - solo una vez al entrar a estadísticas
    useEffect(() => {
      if (mapsRef.current && playerData && !hasAnimated) {
        // Animar las tarjetas de mapas con stagger al hacer scroll
        const mapCards = mapsRef.current.querySelectorAll('.map-card');
        gsap.animateStaggerOnScroll(mapCards, 0.15, "top 85%");
        setHasAnimated(true); // Marcar que ya se ejecutó la animación
      }
    }, [playerData, hasAnimated, gsap]); // Se ejecuta cuando playerData cambia y no se ha animado

    const handleMapClick = useCallback((map: string) => {
        const newMap = selectedMap === map ? null : map;
        setSelectedMap(newMap);
        setIsMapModalOpen(newMap !== null);
    }, [selectedMap]);

    const toggleMapExpansion = useCallback((map: string) => {
        setExpandedMaps(prev => {
            const newSet = new Set(prev);
            if (newSet.has(map)) {
                newSet.delete(map);
            } else {
                newSet.add(map);
            }
            return newSet;
        });
    }, []);

    // Si no hay datos del jugador, mostrar página de feedback
    if (!playerData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="relative z-20 px-4 sm:px-6 md:px-8 pt-8 sm:pt-12 md:pt-16">
                    <div className="max-w-4xl mx-auto">
                        {}
                        <div className="text-center py-16 sm:py-20 md:py-24">
                            {}
                            <div className="relative inline-block mb-8">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full scale-150 blur-2xl"></div>
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-full flex items-center justify-center shadow-2xl">
                                    <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-indigo-400" />
                                </div>
                            </div>

                            {}
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6">
                                {t('stats.noStatsTitle')}
                            </h1>

                            {}
                            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
                                {t('stats.noStatsSubtitle')}
                            </p>

                            {}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16">
                                {}
                                <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                        <Gamepad2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3">
                                        {t('stats.playGamesTitle')}
                                    </h3>
                                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                                        {t('stats.playGamesDesc')}
                                    </p>
                                </div>

                                {}
                                <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                        <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3">
                                        {t('stats.checkLiveTitle')}
                                    </h3>
                                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                                        {t('stats.checkLiveDesc')}
                                    </p>
                                </div>

                                {}
                                <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 md:col-span-2 lg:col-span-1">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                        <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3">
                                        {t('stats.trackProgressTitle')}
                                    </h3>
                                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                                        {t('stats.trackProgressDesc')}
                                    </p>
                                </div>
                            </div>

                            {}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 flex items-center gap-3"
                                >
                                    <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-180 transition-transform duration-300" />
                                    <span className="text-sm sm:text-base">{t('stats.refreshData')}</span>
                                </button>
                                <button
                                    onClick={() => window.open('https://plutonium.pw/', '_blank')}
                                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3"
                                >
                                    <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6" />
                                    <span className="text-sm sm:text-base">{t('stats.launchGame')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

            {}
            <div className="relative z-20 px-2 sm:px-4 md:px-8 pt-4 sm:pt-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {}
                        <div className="xl:col-span-2">
                            {}
                            <div className="relative bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-2xl border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 shadow-2xl ">
                                <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-purple-500/30 rounded-full scale-150"></div>
                                                <TrendingUp className="relative w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-400" />
                                            </div>
                                            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 bg-clip-text text-transparent">
                                        {t('stats.mapPerformance')}
                                    </h2>
                                        </div>
                                </div>

                                <div ref={mapsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                                    {MAPS.map((map) => {
                                        const mapStats = playerData?.maps?.[map] || {
                                            topRound: 0,
                                            totalKills: 0,
                                            totalHeadshots: 0,
                                            totalRevives: 0,
                                            totalDowns: 0,
                                            totalScore: 0,
                                            gamesPlayed: 0,
                                            lastPlayed: 'N/A'
                                        };

                                        const mapCode = MAP_NAME_TO_CODE[map] || map;
                                        const mapBanner = MAP_BANNERS[mapCode] || 'https://picsum.photos/seed/map/400/200';

                                        const isExpanded = expandedMaps.has(map);

                                        return (
                                            <div key={map} className="map-card group relative bg-gradient-to-br from-white/70 to-slate-50/70 dark:from-slate-800/70 dark:to-slate-900/70 backdrop-blur-xl border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl sm:rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-lg">
                                                {}
                                                <div className="cursor-pointer" onClick={() => handleMapClick(map)}>
                                                {}
                                                <div className="relative h-28 sm:h-32 md:h-36 overflow-hidden">
                                                    <LazyImage
                                                        src={mapBanner}
                                                        alt={`${MAP_DISPLAY_NAMES[map]} banner`}
                                                        className="w-full h-full object-cover group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100"></div>

                                                    {}
                                                    <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                                                        <h3 className="text-base sm:text-lg md:text-xl font-black text-white drop-shadow-2xl mb-1.5 sm:mb-2">{MAP_DISPLAY_NAMES[map]}</h3>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-black text-xs sm:text-sm shadow-lg">
                                                                {t('stats.round')} {mapStats.topRound}
                                                            </div>
                                                            <span className="bg-black/40 backdrop-blur-sm text-slate-200 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-xs font-bold border border-white/10">
                                                                {mapStats.gamesPlayed} {t('stats.matches')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                </div>
                                                {}

                                                {}
                                                <div className="p-3 sm:p-4">
                                                    {}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                                                            {t('stats.performanceStats')}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleMapExpansion(map);
                                                            }}
                                                            className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                                                        >
                                                            {isExpanded ? t('stats.collapse') : t('stats.expand')}
                                                            <svg
                                                                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {}
                                                    {isExpanded && (
                                                        <div className="space-y-2">
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {}
                                                                <div className="relative bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg p-2 text-center group/stat hover:border-red-500/40">
                                                                    <Target className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 mx-auto mb-0.5 sm:mb-1" />
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">{t('stats.kills')}</p>
                                                                    <p className="text-base sm:text-lg md:text-xl font-black text-red-500 dark:text-red-400">{mapStats.totalKills}</p>
                                                                </div>

                                                                {}
                                                                <div className="relative bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-2 text-center group/stat hover:border-orange-500/40">
                                                                    <CrosshairIcon className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 mx-auto mb-0.5 sm:mb-1" />
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">{t('stats.headshots')}</p>
                                                                    <p className="text-base sm:text-lg md:text-xl font-black text-orange-500 dark:text-orange-400">{mapStats.totalHeadshots}</p>
                                                                </div>

                                                                {}
                                                                <div className="relative bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-2 text-center group/stat hover:border-green-500/40">
                                                                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mx-auto mb-0.5 sm:mb-1" />
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">{t('stats.revives')}</p>
                                                                    <p className="text-base sm:text-lg md:text-xl font-black text-green-500 dark:text-green-400">{mapStats.totalRevives}</p>
                                                                </div>

                                                                {}
                                                                <div className="relative bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-2 text-center group/stat hover:border-blue-500/40">
                                                                    <UserDownIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mx-auto mb-0.5 sm:mb-1" />
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">{t('stats.downs')}</p>
                                                                    <p className="text-base sm:text-lg md:text-xl font-black text-blue-500 dark:text-blue-400">{mapStats.totalDowns}</p>
                                                                </div>
                                                            </div>

                                                            {}
                                                            <div className="relative bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-3 text-center group/stat hover:border-purple-500/40">
                                                                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mx-auto mb-1" />
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('stats.totalScore')}</p>
                                                                <p className="text-lg sm:text-xl md:text-2xl font-black text-purple-500 dark:text-purple-400">{mapStats.totalScore.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {}
                                                    {!isExpanded && (
                                                        <div className="text-center">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('stats.clickForDetails')}</p>
                                                            <p className="text-xs text-slate-400 dark:text-slate-500">{t('stats.detailedStats')}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {}
                            <div className="mt-6 sm:mt-8">
                                <div className="relative bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-2xl border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl ">
                                    <RecentMatchesBanner playerGuid={player.guid} />
                                </div>
                            </div>

                        </div>

                        {}
                        <div className="xl:col-span-1">
                            <div className="xl:sticky xl:top-8 space-y-4 sm:space-y-6">
                                {}
                                <div
                                    className="relative bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-2xl border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-all duration-300"
                                    onClick={() => setIsProfileModalOpen(true)}
                                >
                                    {}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100"></div>
                                    
                                    <div className="relative">
                                        <div className="relative inline-block mb-4 sm:mb-5">
                                        <LazyImage
                                            src={player.avatarUrl || 'https://forum.plutonium.pw/assets/uploads/system/avatar-default.png'}
                                            alt="Player Avatar"
                                                className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-2 border-slate-300/50 dark:border-slate-600/50 object-cover shadow-lg"
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-white rounded-full"></div>
                                            </div>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">{player.username}</h3>
                                    </div>
                                </div>

                                {}
                                <div className="relative bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-2xl border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl ">
                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 justify-center">
                                        <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                                        <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">{t('stats.overallStats')}</h3>
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="group relative bg-gradient-to-br from-red-500/10 to-red-600/5 border-2 border-red-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-red-500/40 ">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                                                        <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                                    </div>
                                                    <span className="text-slate-700 dark:text-slate-200 text-sm sm:text-base font-bold">{t('stats.kills')}</span>
                                                </div>
                                                <span className="text-2xl sm:text-3xl font-black text-red-500 dark:text-red-400">{player.stats.kills.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="group relative bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-2 border-orange-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-orange-500/40 ">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                                                        <UserDownIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                                    </div>
                                                    <span className="text-slate-700 dark:text-slate-200 text-sm sm:text-base font-bold">{t('stats.downs')}</span>
                                                </div>
                                                <span className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">{player.stats.downs.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="group relative bg-gradient-to-br from-green-500/10 to-green-600/5 border-2 border-green-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-green-500/40 ">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                                                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                                    </div>
                                                    <span className="text-slate-700 dark:text-slate-200 text-sm sm:text-base font-bold">{t('stats.revives')}</span>
                                                </div>
                                                <span className="text-2xl sm:text-3xl font-black text-green-600 dark:text-green-400">{player.stats.revives.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="group relative bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-blue-500/40 ">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                                                        <Skull className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                                    </div>
                                                    <span className="text-slate-700 dark:text-slate-200 text-sm sm:text-base font-bold">{t('stats.headshots')}</span>
                                                </div>
                                                <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">{player.stats.headshots.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {}
                                <div className="relative bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-2xl border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden ">
                                    
                                    <div className="relative">
                                        <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 justify-center">
                                            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                                            <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">{t('stats.bankAccount')}</h3>
                                        </div>
                                        
                                        {}
                                        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                                            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2">
                                                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 dark:text-yellow-400" />
                                                <p className="text-slate-700 dark:text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-wider">{t('stats.currentBalance')}</p>
                                            </div>
                                            <p className="text-3xl sm:text-4xl md:text-5xl font-black text-center bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 dark:from-yellow-400 dark:via-orange-400 dark:to-yellow-500 bg-clip-text text-transparent">
                                            ${(playerData?.economy?.balance || 0).toLocaleString()}
                                        </p>
                                    </div>

                                        {}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                                                <h4 className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">{t('stats.recentActivity')}</h4>
                                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                                            </div>
                                            {(playerData?.economy?.transactions || []).slice(-3).map((tx: any, index: number) => (
                                                <div key={index} className="flex justify-between items-center bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 hover:border-slate-400/50 dark:hover:border-slate-600/50">
                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                        {tx.amount > 0 ? (
                                                            <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 dark:text-green-400" />
                                                        ) : (
                                                            <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 dark:text-red-400" />
                                                        )}
                                                        <p className="text-slate-700 dark:text-slate-300 text-xs font-medium truncate max-w-[120px] sm:max-w-none">{tx.description}</p>
                                                    </div>
                                                    <p className={`font-black text-sm ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} whitespace-nowrap`}>
                                                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                                                    </p>
                                            </div>
                                        ))}
                                            {(playerData?.economy?.transactions?.length === 0 || !playerData?.economy?.transactions) && (
                                                <div className="text-center py-4 sm:py-6">
                                                    <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                                                    <p className="text-slate-600 dark:text-slate-500 text-xs">{t('stats.noTransactions')}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <MapModal
                isOpen={isMapModalOpen}
                onClose={() => {
                    setIsMapModalOpen(false);
                    setSelectedMap(null);
                }}
                selectedMap={selectedMap}
                mapDisplayNames={MAP_DISPLAY_NAMES}
                playerData={playerData}
            />

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                player={player}
            />
        </div>
    );
};

export default Statistics;