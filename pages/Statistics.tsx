import React, { useState, useMemo, useCallback } from 'react';
import PlayerBanner from '../components/PlayerBanner';
import StatCard from '../components/StatCard';
import MapModal from '../components/MapModal';
import RecentMatchesBanner from '../components/RecentMatchesBanner';
import LazyImage from '../components/LazyImage';
import { SkullIcon, UserDownIcon, HeartPlusIcon, CrosshairIcon } from '../components/icons';
import { MAP_BANNERS, MAP_NAME_TO_CODE } from '../constants';
import type { PlayerProfile, MapStats } from '../types';
import { Target, Skull, Heart, Award, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCachedData } from '../utils/cache';

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

// Función para cargar datos del jugador desde data_player.json
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

// Función para cargar todos los datos de jugadores (cacheada)
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
    const { t } = useLanguage();

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

    const handleMapClick = useCallback((map: string) => {
        const newMap = selectedMap === map ? null : map;
        setSelectedMap(newMap);
        setIsMapModalOpen(newMap !== null);
    }, [selectedMap]);


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

            {/* Layout principal: Mapas a la izquierda, estadísticas a la derecha */}
            <div className="relative z-20 px-2 sm:px-4 md:px-8 pt-4 sm:pt-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {/* Sección de Mapas (2/3 del ancho) */}
                        <div className="xl:col-span-2">
                            {/* Sección de Mapas con diseño premium */}
                            <div className="relative bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-2xl border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl transition-colors duration-300">
                                <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-purple-500/30 rounded-full scale-150"></div>
                                            <TrendingUp className="relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-400" />
                                        </div>
                                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 bg-clip-text text-transparent">
                                        {t('stats.mapPerformance')}
                                    </h2>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="flex items-center gap-1.5 sm:gap-2 bg-green-500/10 border border-green-500/30 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full">
                                            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-xs sm:text-sm font-bold text-green-400 uppercase tracking-wider">{t('stats.live')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
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

                                        return (
                                            <div key={map} className="group relative bg-gradient-to-br from-white/70 to-slate-50/70 dark:from-slate-800/70 dark:to-slate-900/70 backdrop-blur-xl border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl sm:rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-lg cursor-pointer transition-all duration-300" onClick={() => handleMapClick(map)}>
                                                {/* Banner del mapa con overlay mejorado */}
                                                <div className="relative h-28 sm:h-32 md:h-36 overflow-hidden">
                                                    <LazyImage
                                                        src={mapBanner}
                                                        alt={`${MAP_DISPLAY_NAMES[map]} banner`}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                    {/* Información principal sobre la imagen */}
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

                                                {/* Estadísticas detalladas con iconos */}
                                                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                                                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                                                        <div className="relative bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center group/stat hover:border-red-500/40 transition-all">
                                                            <Target className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 mx-auto mb-0.5 sm:mb-1" />
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">{t('stats.kills')}</p>
                                                            <p className="text-base sm:text-lg md:text-xl font-black text-red-500 dark:text-red-400">{mapStats.totalKills}</p>
                                                        </div>
                                                        <div className="relative bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center group/stat hover:border-yellow-500/40 transition-all">
                                                            <Skull className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 mx-auto mb-0.5 sm:mb-1" />
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">{t('stats.headshots')}</p>
                                                            <p className="text-base sm:text-lg md:text-xl font-black text-yellow-600 dark:text-yellow-400">{mapStats.totalHeadshots}</p>
                                                        </div>
                                                        <div className="relative bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center group/stat hover:border-green-500/40 transition-all">
                                                            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mx-auto mb-0.5 sm:mb-1" />
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">{t('stats.revives')}</p>
                                                            <p className="text-base sm:text-lg md:text-xl font-black text-green-600 dark:text-green-400">{mapStats.totalRevives}</p>
                                                        </div>
                                                        <div className="relative bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center group/stat hover:border-orange-500/40 transition-all">
                                                            <UserDownIcon className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 mx-auto mb-0.5 sm:mb-1" />
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">{t('stats.downs')}</p>
                                                            <p className="text-base sm:text-lg md:text-xl font-black text-orange-600 dark:text-orange-400">{mapStats.totalDowns}</p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg sm:rounded-xl p-2 sm:p-3">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                                                                <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">{t('stats.score')}</span>
                                                            </div>
                                                            <span className="text-blue-600 dark:text-blue-400 font-black text-sm sm:text-base md:text-lg">{mapStats.totalScore.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Banner de partidas recientes - debajo de Map Performance */}
                            <div className="mt-6 sm:mt-8">
                                <div className="relative bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-2xl border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl transition-colors duration-300">
                                    <RecentMatchesBanner playerGuid={player.guid} />
                                </div>
                            </div>

                        </div>

                        {/* Panel lateral derecho con avatar y estadísticas */}
                        <div className="xl:col-span-1">
                            <div className="xl:sticky xl:top-8 space-y-4 sm:space-y-6">
                                {/* Avatar del jugador mejorado responsive */}
                                <div className="relative bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-2xl border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden group transition-colors duration-300">
                                    {/* Background glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    
                                    <div className="relative">
                                        <div className="relative inline-block mb-4 sm:mb-5">
                                        <LazyImage
                                            src={player.avatarUrl || 'https://forum.plutonium.pw/assets/uploads/system/avatar-default.png'}
                                            alt="Player Avatar"
                                                className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-2 border-slate-300/50 dark:border-slate-600/50 object-cover shadow-lg"
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-white rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">{player.username}</h3>
                                        <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-purple-500/10 border border-purple-500/20 px-2.5 sm:px-3 py-1 rounded-full">
                                            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-purple-400 rounded-full"></div>
                                            <span className="text-xs font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider">{t('stats.online')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Estadísticas principales premium responsive */}
                                <div className="relative bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-2xl border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl transition-colors duration-300">
                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 justify-center">
                                        <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                                        <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">{t('stats.overallStats')}</h3>
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="group relative bg-gradient-to-br from-red-500/10 to-red-600/5 border-2 border-red-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-red-500/40 transition-all duration-300">
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

                                        <div className="group relative bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-2 border-orange-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-orange-500/40 transition-all duration-300">
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

                                        <div className="group relative bg-gradient-to-br from-green-500/10 to-green-600/5 border-2 border-green-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-green-500/40 transition-all duration-300">
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

                                        <div className="group relative bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-blue-500/40 transition-all duration-300">
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
                                {/* Sección de Banco Premium responsive */}
                                <div className="relative bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-2xl border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden transition-colors duration-300">
                                    
                                    <div className="relative">
                                        <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 justify-center">
                                            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                                            <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">{t('stats.bankAccount')}</h3>
                                        </div>
                                        
                                        {/* Balance principal */}
                                        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                                            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2">
                                                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 dark:text-yellow-400" />
                                                <p className="text-slate-700 dark:text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-wider">{t('stats.currentBalance')}</p>
                                            </div>
                                            <p className="text-3xl sm:text-4xl md:text-5xl font-black text-center bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 dark:from-yellow-400 dark:via-orange-400 dark:to-yellow-500 bg-clip-text text-transparent">
                                            ${(playerData?.economy?.balance || 0).toLocaleString()}
                                        </p>
                                    </div>

                                        {/* Transacciones recientes */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                                                <h4 className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">{t('stats.recentActivity')}</h4>
                                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                                            </div>
                                            {(playerData?.economy?.transactions || []).slice(-3).map((tx: any, index: number) => (
                                                <div key={index} className="flex justify-between items-center bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 hover:border-slate-400/50 dark:hover:border-slate-600/50 transition-all">
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
        </div>
    );
};

export default Statistics;