import React, { memo, useEffect, useState } from 'react';
import { Award, Target, Heart, Skull, Wallet, DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, Clock, Map as MapIcon } from 'lucide-react';
import { UserDownIcon } from '../common/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import LazyImage from '../common/LazyImage';
import type { PlayerProfile, MatchData } from '../../types';
import { loadRecentMatches } from '../../constants';
import { MAP_NAMES } from '../../constants/gameData';

import { useUISounds } from '../../hooks/useUISounds';

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

const UnifiedProfileSidebar: React.FC<UnifiedProfileSidebarProps> = memo(({ player, onProfileClick }) => {
    const { t } = useLanguage();
    const [recentTransactions, setRecentTransactions] = useState<DisplayTransaction[]>([]);
    const { playHover, playSelect } = useUISounds();

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!player?.username) return;
            try {
                const matches = (await loadRecentMatches(player.username)) as unknown as MatchData[];
                const allTransactions: DisplayTransaction[] = [];

                matches.forEach(match => {
                    if (match.transactions && match.transactions.length > 0) {
                        match.transactions.forEach((tx, idx) => {
                            allTransactions.push({
                                id: `${match.fileName}-${idx}`,
                                map: match.map,
                                time: tx.time,
                                type: tx.type,
                                amount: tx.amount,
                                timestamp: match.timestamp // Use match timestamp for sorting
                            });
                        });
                    }
                });

                // Sort by timestamp descending (newest first)
                allTransactions.sort((a, b) => b.timestamp - a.timestamp);
                setRecentTransactions(allTransactions.slice(0, 5));
            } catch (error) {
                console.error("Error loading transactions for sidebar:", error);
            }
        };

        fetchTransactions();
    }, [player?.username]);

    return (
        <div className="lg:sticky lg:top-20 space-y-6">
            {/* Unified Premium Card */}
            <div className="relative bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-md border-2 border-slate-200/50 dark:border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden group">

                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-10 dark:opacity-20"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute top-20 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>

                {/* Profile Header Section */}
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

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mx-6"></div>

                {/* Stats Grid Section */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('stats.overallStats')}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Kills */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 hover:border-red-500/30 transition-colors group/stat">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-red-500" />
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('stats.kills')}</span>
                            </div>
                            <span className="text-xl font-black text-slate-800 dark:text-slate-200 group-hover/stat:text-red-500 transition-colors">
                                {player.stats.kills.toLocaleString()}
                            </span>
                        </div>

                        {/* Downs */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 hover:border-orange-500/30 transition-colors group/stat">
                            <div className="flex items-center gap-2 mb-1">
                                <UserDownIcon className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('stats.downs')}</span>
                            </div>
                            <span className="text-xl font-black text-slate-800 dark:text-slate-200 group-hover/stat:text-orange-500 transition-colors">
                                {player.stats.downs.toLocaleString()}
                            </span>
                        </div>

                        {/* Revives */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 hover:border-green-500/30 transition-colors group/stat">
                            <div className="flex items-center gap-2 mb-1">
                                <Heart className="w-4 h-4 text-green-500" />
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('stats.revives')}</span>
                            </div>
                            <span className="text-xl font-black text-slate-800 dark:text-slate-200 group-hover/stat:text-green-500 transition-colors">
                                {player.stats.revives.toLocaleString()}
                            </span>
                        </div>

                        {/* Headshots */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 hover:border-blue-500/30 transition-colors group/stat">
                            <div className="flex items-center gap-2 mb-1">
                                <Skull className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('stats.headshots')}</span>
                            </div>
                            <span className="text-xl font-black text-slate-800 dark:text-slate-200 group-hover/stat:text-blue-500 transition-colors">
                                {player.stats.headshots.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mx-6"></div>

                {/* Economy Section */}
                <div className="p-6 bg-slate-50/30 dark:bg-slate-800/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-yellow-500" />
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('stats.bankAccount')}</h3>
                        </div>

                    </div>

                    {/* Balance Card */}
                    <div className="relative overflow-hidden bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 rounded-2xl p-5 mb-4 shadow-lg group/card border border-slate-200 dark:border-slate-700">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <DollarSign className="w-24 h-24 text-slate-900 dark:text-white transform rotate-12 translate-x-4 -translate-y-4" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{t('stats.currentBalance')}</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">
                            ${(player.economy?.balance || 0).toLocaleString()}
                        </p>

                    </div>

                    {/* Recent Transactions Mini-List */}
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
