import React, { useState, useMemo, useCallback, useRef, useEffect, useLayoutEffect, memo } from 'react';
import PlayerBanner from '../components/features/profile/PlayerBanner';
import PlayerSidebar from '../components/layout/PlayerSidebar';
import UnifiedProfileSidebar from '../components/layout/UnifiedProfileSidebar';
import StatCard from '../components/features/stats/StatCard';
import MapModal from '../components/features/maps/MapModal';
import MapPerformanceCard from '../components/features/stats/MapPerformanceCard';
import ProfileModal from '../components/features/profile/ProfileModal';
import RecentMatchesBanner from '../components/features/matches/RecentMatchesBanner';
import LazyImage from '../components/common/LazyImage';
import { SkullIcon, UserDownIcon, HeartPlusIcon, CrosshairIcon } from '../components/common/icons';
import { MAP_BANNERS, MAP_NAME_TO_CODE } from '../constants';
import type { PlayerProfile, MapStats } from '../types';
import { Target, Skull, Heart, Award, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Wallet, BarChart3, Gamepad2, RefreshCw, ExternalLink, Activity, Trophy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSound } from '../contexts/SoundContext';
import { useUISounds } from '../hooks/useUISounds';
import damnedMusic from '../data/sounds/web_music/Damned.ogg';

import { useGSAP } from '../utils/gsap';

interface StatisticsProps {
    player: PlayerProfile;
    players: PlayerProfile[];
    onSelectPlayer: (player: PlayerProfile) => void;
}

const MAPS = [
    'tranzit', 'town', 'prison', 'tomb', 'farm', 'nuked', 'processing', 'rooftop'
];

const SURVIVAL_MAPS = [
    'busdepot', 'town', 'farm'
];

const CLASSIC_MAPS = [
    'tranzit', 'prison', 'tomb', 'nuked', 'processing', 'rooftop'
];

const MAP_DISPLAY_NAMES: { [key: string]: string } = {
    'tranzit': 'TranZit',
    'town': 'Town',
    'prison': 'Prison',
    'tomb': 'Tomb',
    'farm': 'Farm',
    'nuked': 'Nuketown',
    'processing': 'Buried',
    'rooftop': 'Rooftop',
    'busdepot': 'Bus Depot',
    
    
    
    'diner bonus': 'Diner Bonus',
    'power bonus': 'Power Bonus',
    'cornfield bonus': 'Cornfield Bonus',
    'tunnel bonus': 'Tunnel Bonus',
    'house bonus': 'House Bonus',
    'town bonus': 'Town Bonus',
    'farm bonus': 'Farm Bonus',
    'busdepot bonus': 'Bus Depot Bonus',
    'nuketown bonus': 'Nuketown Bonus',
    'docks bonus': 'Docks Bonus',
    'showers bonus': 'Showers Bonus',
    'cellblock bonus': 'Cellblock Bonus',
    'rooftop bonus': 'Rooftop Bonus',
    'building1top bonus': 'Building Bonus',
    'maze bonus': 'Maze Bonus',
    'trenches bonus': 'Trenches Bonus',
    'crazyplace bonus': 'CrazyPlace Bonus'
};

const BONUS_MAPS = [
    
    
    'diner bonus', 'power bonus', 'cornfield bonus', 'tunnel bonus',
    'house bonus', 'town bonus', 'farm bonus', 'busdepot bonus',
    'nuketown bonus', 'docks bonus', 'showers bonus', 'cellblock bonus', 'rooftop bonus',
    'building1top bonus', 'maze bonus', 'trenches bonus', 'crazyplace bonus'
];



const Statistics: React.FC<StatisticsProps> = memo(({ player, players, onSelectPlayer }) => {
    const [selectedMap, setSelectedMap] = useState<string | null>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [expandedMaps, setExpandedMaps] = useState<Set<string>>(new Set());
    const { t } = useLanguage();


    if (!player) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="relative z-20 px-4 sm:px-6 md:px-8 pt-8 sm:pt-12 md:pt-16">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center py-16 sm:py-20 md:py-24">
                            <div className="relative inline-block mb-8">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-full scale-150 blur-2xl"></div>
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full flex items-center justify-center shadow-2xl">
                                    <UserDownIcon className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-blue-400" />
                                </div>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6">
                                {t('stats.selectPlayerTitle')}
                            </h1>

                            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
                                {t('stats.selectPlayerSubtitle')}
                            </p>

                            <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl">
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


    const gsap = useGSAP();
    const mapsRef = useRef<HTMLDivElement>(null);
    const { playStats } = useUISounds();
    const { musicEnabled, musicTiming } = useSound();
    const musicRef = useRef<HTMLAudioElement | null>(null);
    const [statsSoundFinished, setStatsSoundFinished] = useState(false);

    useEffect(() => {
        
        const audio = playStats();

        if (audio) {
            audio.onended = () => setStatsSoundFinished(true);
        } else {
            setStatsSoundFinished(true);
        }

        
        if (musicTiming === 'instant') {
            setStatsSoundFinished(true);
        }

        return () => {
            if (audio) {
                audio.pause();
                audio.onended = null;
            }
        };
    }, [musicTiming]);

    useEffect(() => {
        
        if (musicEnabled && statsSoundFinished) {
            if (!musicRef.current) {
                const music = new Audio(damnedMusic);
                music.volume = 0.3;
                music.loop = true;
                music.play().catch(console.warn);
                musicRef.current = music;
            } else if (musicRef.current.paused) {
                musicRef.current.play().catch(console.warn);
            }
        } else {
            if (musicRef.current) {
                musicRef.current.pause();
            }
        }

        return () => {
            if (musicRef.current) {
                musicRef.current.pause();
                musicRef.current = null;
            }
        };
    }, [musicEnabled, statsSoundFinished]);


    const playerData = useMemo(() => {
        return player;
    }, [player]);


    useLayoutEffect(() => {
        if (mapsRef.current && playerData && !hasAnimated) {
            const ctx = gsap.context(() => {
                const mapCards = mapsRef.current?.querySelectorAll('.map-card');
                if (mapCards && mapCards.length > 0) {
                    gsap.set(mapCards, { opacity: 0, y: 20 });
                    gsap.to(mapCards, {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        stagger: 0.05,
                        ease: "power2.out",
                        clearProps: "all"
                    });
                }
            }, mapsRef);

            setHasAnimated(true);
            return () => ctx.revert();
        }
    }, [playerData, hasAnimated, gsap]);

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

    const handleCloseMapModal = useCallback(() => {
        setIsMapModalOpen(false);
        setSelectedMap(null);
    }, []);

    const handleProfileClick = useCallback(() => {
        setIsProfileModalOpen(true);
    }, []);

    const handleCloseProfileModal = useCallback(() => {
        setIsProfileModalOpen(false);
    }, []);



    if (!playerData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="relative z-20 px-4 sm:px-6 md:px-8 pt-8 sm:pt-12 md:pt-16">
                    <div className="max-w-4xl mx-auto">
                        { }
                        <div className="text-center py-16 sm:py-20 md:py-24">
                            { }
                            <div className="relative inline-block mb-8">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full scale-150 blur-2xl"></div>
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full flex items-center justify-center shadow-2xl">
                                    <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-indigo-400" />
                                </div>
                            </div>

                            { }
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent mb-4 sm:mb-6">
                                {t('stats.noStatsTitle')}
                            </h1>

                            { }
                            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
                                {t('stats.noStatsSubtitle')}
                            </p>

                            { }
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16">
                                { }
                                <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
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

                                { }
                                <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
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

                                { }
                                <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 md:col-span-2 lg:col-span-1">
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

                            { }
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

            { }
            <div className="relative z-20 px-2 sm:px-4 md:px-8 pt-24 sm:pt-28">
                <div className="max-w-[1600px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">

                        { }
                        <div className="lg:col-span-1">
                            <PlayerSidebar
                                players={players}
                                selectedPlayer={player}
                                onSelectPlayer={onSelectPlayer}
                            />
                        </div>

                        { }
                        <div className="lg:col-span-2">
                            { }
                            <div className="relative bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-md border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 shadow-2xl ">
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

                                <div ref={mapsRef} className="space-y-8">
                                    { }
                                    <div>
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                            <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                                            {t('stats.survivalMode') || 'Supervivencia'}
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                                            {SURVIVAL_MAPS.map((map) => {
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

                                                return (
                                                    <div key={map} className="map-card will-change-transform">
                                                        <MapPerformanceCard
                                                            mapId={map}
                                                            mapName={MAP_DISPLAY_NAMES[map]}
                                                            stats={mapStats}
                                                            onOpenModal={() => handleMapClick(map)}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    { }
                                    <div>
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                                            {t('stats.classicMode') || 'Classic'}
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                                            {CLASSIC_MAPS.map((map) => {
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

                                                return (
                                                    <div key={map} className="map-card will-change-transform">
                                                        <MapPerformanceCard
                                                            mapId={map}
                                                            mapName={MAP_DISPLAY_NAMES[map]}
                                                            stats={mapStats}
                                                            onOpenModal={() => handleMapClick(map)}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {}
                                {(() => {
                                    const visibleBonusMaps = BONUS_MAPS.filter(map => {
                                        const mapStats = playerData?.maps?.[map];
                                        return mapStats && (mapStats.gamesPlayed > 0 || mapStats.totalKills > 0 || mapStats.totalScore > 0);
                                    });

                                    if (visibleBonusMaps.length === 0) return null;

                                    return (
                                        <div>
                                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                                <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                                                Bonus Maps
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                                                {visibleBonusMaps.map((map) => {
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

                                                    return (
                                                        <div key={map} className="map-card will-change-transform">
                                                            <MapPerformanceCard
                                                                mapId={map}
                                                                
                                                                mapName={MAP_DISPLAY_NAMES[map] || map}
                                                                stats={mapStats}
                                                                onOpenModal={() => handleMapClick(map)}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            { }
                            <div className="mt-6 sm:mt-8">
                                <div className="relative bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-md border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl ">
                                    <RecentMatchesBanner playerIdentifier={player.username || player.guid} />
                                </div>
                            </div>

                        </div>

                        { }
                        <div className="lg:col-span-1">
                            <UnifiedProfileSidebar
                                player={player}
                                onProfileClick={handleProfileClick}
                            />
                        </div>
                    </div>
                </div>
            </div>

            { }
            <footer className="text-center mt-8 sm:mt-12 pb-6 text-slate-400 dark:text-slate-500 text-xs sm:text-sm px-4">
                <p>{t('footer.text')}</p>
            </footer>

            <MapModal
                isOpen={isMapModalOpen}
                onClose={handleCloseMapModal}
                selectedMap={selectedMap}
                mapDisplayNames={MAP_DISPLAY_NAMES}
                playerData={playerData}
            />

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={handleCloseProfileModal}
                player={player}
            />
        </div>
    );
});

export default Statistics;