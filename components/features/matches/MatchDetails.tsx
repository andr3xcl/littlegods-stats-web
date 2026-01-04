import React, { useState } from 'react';
import { Target, Skull, Heart, Award, Shield, Box, Zap, Map as MapIcon, Grip, Sword, Activity } from 'lucide-react';
import type { MatchData } from '../../../types';
import WeaponDisplay from './WeaponDisplay';
import PerkDisplay from './PerkDisplay';


interface ExtendedMatchData extends MatchData {
    general?: Record<string, number>;
    combat?: Record<string, number>;
    survival?: Record<string, number>;
    magicBox?: Record<string, number>;
    powerups?: Record<string, number>;
    equipment?: Record<string, number>;
    mapSpecific?: Record<string, number>;
    persistentUpgrades?: Record<string, number>;
    other?: Record<string, number>;
    mobOfTheDead?: Record<string, number>;
    buried?: Record<string, number>;
    origins?: Record<string, number>;
    cheats?: Record<string, number>;
}

interface MatchDetailsProps {
    match: MatchData;
    onViewWeapons: (match: MatchData) => void;
    t: (key: string) => string;
}

const StatGrid: React.FC<{ title: string, icon: React.ReactNode, data: Record<string, number>, color: string, t: (key: string) => string }> = ({ title, icon, data, color, t }) => {
    if (!data || Object.keys(data).length === 0) return null;

    
    const entries = Object.entries(data).filter(([_, val]) => val !== 0);
    if (entries.length === 0) return null;

    const getLabel = (key: string) => {
        const translationKey = `stats.${key}`;
        const translated = t(translationKey);
        
        
        
        if (translated !== translationKey && translated) return translated;

        
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-16 h-16 ${color} opacity-10 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110`}></div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
                <span className={`${color.replace('bg-', 'text-')}`}>{icon}</span>
                <h4 className="font-bold text-slate-700 dark:text-slate-200">{title}</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 relative z-10">
                {entries.map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                        <span className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate" title={getLabel(key)}>
                            {getLabel(key)}
                        </span>
                        <span className="text-lg font-mono font-bold text-slate-800 dark:text-slate-200">
                            {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MatchDetails: React.FC<MatchDetailsProps> = ({ match: rawMatch, onViewWeapons, t }) => {
    const match = rawMatch as ExtendedMatchData;

    return (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
            {}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center hover:bg-red-500/15 transition-colors group">
                    <Target className="w-5 h-5 text-red-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('stats.kills')}</p>
                    <p className="text-2xl font-black text-red-500 dark:text-red-400">{match.kills}</p>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-center hover:bg-yellow-500/15 transition-colors group">
                    <Skull className="w-5 h-5 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('stats.headshots')}</p>
                    <p className="text-2xl font-black text-yellow-600 dark:text-yellow-400">{match.headshots}</p>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center hover:bg-green-500/15 transition-colors group">
                    <Heart className="w-5 h-5 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('stats.revives')}</p>
                    <p className="text-2xl font-black text-green-600 dark:text-green-400">{match.revives}</p>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-center hover:bg-orange-500/15 transition-colors group">
                    <Award className="w-5 h-5 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('stats.downs')}</p>
                    <p className="text-2xl font-black text-orange-500 dark:text-orange-400">{match.downs}</p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-center hover:bg-blue-500/15 transition-colors group sm:col-span-3 lg:col-span-1">
                    <Award className="w-5 h-5 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('stats.score')}</p>
                    <p className="text-xl font-black text-blue-600 dark:text-blue-400">{match.score?.toLocaleString()}</p>
                </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {match.combat && <StatGrid title={t('stats.combat')} icon={<Sword className="w-5 h-5" />} data={match.combat} color="bg-red-500" t={t} />}
                {match.survival && <StatGrid title={t('stats.survivalMode')} icon={<Shield className="w-5 h-5" />} data={match.survival} color="bg-emerald-500" t={t} />}
                {match.magicBox && <StatGrid title={t('stats.magicBox')} icon={<Box className="w-5 h-5" />} data={match.magicBox} color="bg-purple-500" t={t} />}
                {match.powerups && <StatGrid title={t('stats.powerups')} icon={<Zap className="w-5 h-5" />} data={match.powerups} color="bg-yellow-500" t={t} />}
                {match.mapSpecific && <StatGrid title="Map Specific" icon={<MapIcon className="w-5 h-5" />} data={match.mapSpecific} color="bg-indigo-500" t={t} />}
                {match.equipment && <StatGrid title="Equipment" icon={<Grip className="w-5 h-5" />} data={match.equipment} color="bg-stone-500" t={t} />}
                {match.persistentUpgrades && <StatGrid title="Persistent Upgrades" icon={<Activity className="w-5 h-5" />} data={match.persistentUpgrades} color="bg-cyan-500" t={t} />}

                {match.mobOfTheDead && <StatGrid title={t('map.mobOfTheDead')} icon={<MapIcon className="w-5 h-5" />} data={match.mobOfTheDead} color="bg-orange-600" t={t} />}
                {match.buried && <StatGrid title={t('map.buried')} icon={<MapIcon className="w-5 h-5" />} data={match.buried} color="bg-amber-700" t={t} />}
                {match.origins && <StatGrid title={t('map.origins')} icon={<MapIcon className="w-5 h-5" />} data={match.origins} color="bg-blue-600" t={t} />}
                {match.cheats && <StatGrid title="Anti-Cheat Detection" icon={<Shield className="w-5 h-5" />} data={match.cheats} color="bg-red-600" t={t} />}
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WeaponDisplay
                    bestWeapon={match.bestWeapon}
                    weapons={match.weapons}
                    onViewAll={(e) => {
                        e.stopPropagation();
                        onViewWeapons(match);
                    }}
                    t={t}
                    showAll={true}
                />

                <PerkDisplay
                    perks={match.perks}
                    onViewAll={(e) => {
                        e.stopPropagation();
                        onViewWeapons(match);
                    }}
                    t={t}
                    showAll={true}
                />
            </div>

            {}
            {match.transactions && match.transactions.length > 0 && (
                <div className="col-span-full animate-in slide-in-from-bottom-2 duration-500 delay-200">
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </span>
                        {t('stats.bankTransactions')}
                    </h3>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4">{t('common.time')}</th>
                                        <th className="px-6 py-4">{t('common.type')}</th>
                                        <th className="px-6 py-4 text-right">{t('common.amount')}</th>
                                        <th className="px-6 py-4 text-right">{t('stats.balance')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {match.transactions.map((txn, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">{txn.time}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${txn.type === 'deposit'
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                                    }`}>
                                                    {txn.type === 'deposit' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m7 7 10 10" /><path d="M17 7v10H7" /></svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m7 7 10 10" /><path d="M17 17V7H7" /></svg>
                                                    )}
                                                    {txn.type === 'deposit' ? 'DEPOSIT' : 'WITHDRAW'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-200">
                                                {txn.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-500 dark:text-slate-400">
                                                {txn.balanceAfter.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatchDetails;
