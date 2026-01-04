import React, { memo, useEffect, useState } from 'react';
import { Award, Target, Heart, Skull, Wallet, DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, Clock, Map as MapIcon, Trophy, Timer } from 'lucide-react';
import { UserDownIcon } from '../common/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import LazyImage from '../common/LazyImage';
import type { PlayerProfile, MatchData } from '../../types';
import { loadRecentMatches } from '../../constants';
import { MAP_NAMES, WEAPON_IMAGES, getWeaponBaseName, MAP_IMAGES, getMapImage } from '../../constants/gameData';
import { useSettings } from '../../contexts/SettingsContext';
import { formatSecondsToDuration } from '../../utils/formatTime';

import { useUISounds } from '../../hooks/useUISounds';
import StatsListModal from '../common/StatsListModal';
import OverallStatsModal from '../features/stats/OverallStatsModal';

interface UnifiedProfileSidebarProps {
    player: PlayerProfile;
    onProfileClick: () => void;
}

interface DisplayTransaction {
    id: string;
    map: string;
    time: string;
    type: 'deposit' | 'withdraw';
    amount: number;
    timestamp: number;
}

interface WeaponStat {
    name: string;
    displayName: string;
    kills: number;
    headshots: number;
}

interface MapStat {
    map: string;
    count: number;
}

const UnifiedProfileSidebar: React.FC<UnifiedProfileSidebarProps> = memo(({ player, onProfileClick }) => {
    const { t } = useLanguage();
    const { mapImagePreference } = useSettings();
    const [recentTransactions, setRecentTransactions] = useState<DisplayTransaction[]>([]);
    const [topWeapons, setTopWeapons] = useState<WeaponStat[]>([]);
    const [topMaps, setTopMaps] = useState<MapStat[]>([]);
    
    const [allLoadedMatches, setAllLoadedMatches] = useState<MatchData[]>([]);
    const [activeModal, setActiveModal] = useState<'none' | 'weapons' | 'maps' | 'overall'>('none');
    const { playHover, playSelect } = useUISounds();

    useEffect(() => {
        const fetchStats = async () => {
            if (!player?.username) return;
            try {
                const matches = (await loadRecentMatches(player.username)) as unknown as MatchData[];
                setAllLoadedMatches(matches); 

                
                const allTransactions: DisplayTransaction[] = [];
                matches.forEach(match => {
                    if (match.transactions && match.transactions.length > 0) {
                        match.transactions.forEach((tx, idx) => {
                            allTransactions.push({
                                id: `${match.fileName}-${idx}`,
                                map: match.map,
                                time: tx.time,
                                type: tx.type as any,
                                amount: tx.amount,
                                timestamp: match.timestamp
                            });
                        });
                    }
                });
                allTransactions.sort((a, b) => b.timestamp - a.timestamp);
                setRecentTransactions(allTransactions.slice(0, 5));

                
                const weaponStats: Record<string, WeaponStat> = {};
                matches.forEach(match => {
                    if (match.weapons) {
                        (Object.values(match.weapons) as any[]).forEach(w => {
                            const displayName = w.displayName || w.name;
                            if (!weaponStats[displayName]) {
                                weaponStats[displayName] = {
                                    name: w.name,
                                    displayName: displayName,
                                    kills: 0,
                                    headshots: 0
                                };
                            }
                            weaponStats[displayName].kills += w.kills;
                            weaponStats[displayName].headshots += (w.headshots || 0);
                        });
                    }
                });
                const sortedWeapons = Object.values(weaponStats)
                    .sort((a, b) => b.kills - a.kills)
                    .slice(0, 3);
                setTopWeapons(sortedWeapons);

                
                const mapStats: Record<string, number> = {};
                matches.forEach(match => {
                    if (match.map) {
                        mapStats[match.map] = (mapStats[match.map] || 0) + 1;
                    }
                });
                const sortedMaps = Object.entries(mapStats)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([map, count]) => ({ map, count }));
                setTopMaps(sortedMaps);

            } catch (error) {
                console.error("Error loading stats for sidebar:", error);
            }
        };

        fetchStats();
    }, [player?.username]);

    return (
        <div className="lg:sticky lg:top-20 space-y-6">
            {}
            <div className="relative bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-md border-2 border-slate-200/50 dark:border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden group">

                {}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-10 dark:opacity-20"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute top-20 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>

                {}
                <div
                    className="relative pt-8 px-6 pb-6 text-center cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                    onClick={() => {
                        playSelect();
                        onProfileClick();
                    }}
                    onMouseEnter={playHover}
                >
                    <div className="relative inline-block mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                        <LazyImage
                            src={player.avatarUrl || 'https://forum.plutonium.pw/assets/uploads/system/avatar-default.png'}
                            alt="Player Avatar"
                            className="relative w-28 h-28 rounded-full border-4 border-white dark:border-slate-800 shadow-xl object-cover z-10"
                        />
                        <div className="absolute bottom-1 right-1 z-20 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-lg" title="Online">
                            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{player.username}</h2>

                </div>

                {}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mx-6"></div>

                {}
                <div className="p-6">
                    <div
                        className="relative overflow-hidden rounded-2xl group cursor-pointer transition-transform duration-300 hover:scale-[1.02] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-xl"
                        onClick={() => {
                            playSelect();
                            setActiveModal('overall');
                        }}
                    >
                        {}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-400/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10 group-hover:bg-indigo-500/10 dark:group-hover:bg-indigo-400/20 transition-colors duration-500"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/5 dark:bg-pink-400/10 rounded-full blur-2xl transform -translate-x-5 translate-y-5 group-hover:bg-pink-500/10 dark:group-hover:bg-pink-400/20 transition-colors duration-500"></div>

                        {}
                        <div className="relative p-5 flex items-center justify-between z-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-500/10 dark:bg-indigo-400/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                        <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {t('stats.overallStats')}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-[150px] pl-1">
                                    {t('stats.viewDetailedStats')}
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 mb-2 transition-colors">
                                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="relative bg-slate-50/50 dark:bg-slate-700/30 backdrop-blur-sm p-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-2">
                                <Timer className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('stats.timePlayed')}</span>
                            </div>
                            <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                                {player.stats.totalTimePlayed ? formatSecondsToDuration(player.stats.totalTimePlayed) : '0m'}
                            </span>
                        </div>
                    </div>
                </div>

                {}
                <div className="p-6 pt-0 grid grid-cols-2 gap-3">
                    {topWeapons.length > 0 && (
                        <button
                            onClick={() => {
                                playSelect();
                                setActiveModal('weapons');
                            }}
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:scale-[1.02] transition-all group"
                        >
                            <Trophy className="w-6 h-6 text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {t('stats.topWeapons')}
                            </span>
                        </button>
                    )}

                    {topMaps.length > 0 && (
                        <button
                            onClick={() => {
                                playSelect();
                                setActiveModal('maps');
                            }}
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:scale-[1.02] transition-all group"
                        >
                            <MapIcon className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {t('stats.topMaps')}
                            </span>
                        </button>
                    )}
                </div>

                { }
                <StatsListModal
                    isOpen={activeModal === 'weapons'}
                    onClose={() => setActiveModal('none')}
                    title={t('stats.topWeapons')}
                    icon={<Trophy className="w-6 h-6 text-yellow-500" />}
                    items={topWeapons.map((w, i) => ({
                        id: w.name,
                        rank: i + 1,
                        label: w.displayName,
                        subLabel: t('stats.killsLabel'),
                        count: w.kills,
                        image: WEAPON_IMAGES[getWeaponBaseName(w.displayName)] || './data/images/Nuketown_menu_selection_BO2.jpg'
                    }))}
                />

                <StatsListModal
                    isOpen={activeModal === 'maps'}
                    onClose={() => setActiveModal('none')}
                    title={t('stats.topMaps')}
                    icon={<MapIcon className="w-6 h-6 text-blue-500" />}
                    items={topMaps.map((m, i) => ({
                        id: m.map,
                        rank: i + 1,
                        label: MAP_NAMES[m.map] || m.map,
                        subLabel: t('stats.matchesLabel'),
                        count: m.count,
                        image: getMapImage(m.map, mapImagePreference)
                    }))}
                />

                <OverallStatsModal
                    isOpen={activeModal === 'overall'}
                    onClose={() => setActiveModal('none')}
                    matches={allLoadedMatches}
                    t={t}
                />


                { }
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mx-6"></div>

                { }
                <div className="p-6 bg-slate-50/30 dark:bg-slate-800/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-yellow-500" />
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('stats.bankAccount')}</h3>
                        </div>

                    </div>

                    { }
                    <div className="relative overflow-hidden bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 rounded-2xl p-5 mb-4 shadow-lg group/card border border-slate-200 dark:border-slate-700">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <DollarSign className="w-24 h-24 text-slate-900 dark:text-white transform rotate-12 translate-x-4 -translate-y-4" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{t('stats.currentBalance')}</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">
                            ${(player.economy?.balance || 0).toLocaleString()}
                        </p>

                    </div>

                    { }
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t('stats.recentActivity')}</h4>
                        {recentTransactions.length > 0 ? (
                            recentTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <MapIcon className="w-3 h-3 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                {MAP_NAMES[tx.map] || tx.map}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                            <Clock className="w-3 h-3" />
                                            <span>{tx.time}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className={`flex items-center gap-1 font-black text-xs ${tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                                            {tx.type === 'deposit' ? (
                                                <ArrowUpRight className="w-3 h-3" />
                                            ) : (
                                                <ArrowDownRight className="w-3 h-3" />
                                            )}
                                            <span>${tx.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-2">
                                {t('stats.noTransactions')}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default UnifiedProfileSidebar;
