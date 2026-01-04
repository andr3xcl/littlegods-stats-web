import React, { useRef, useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Trophy, Swords, Shield, Box, Zap, Map as MapIcon, Grip, Activity, Target, Skull, Heart, Award } from 'lucide-react';
import { useGSAP } from '../../../utils/gsap';
import { useTheme } from '../../../contexts/ThemeContext';
import { useUISounds } from '../../../hooks/useUISounds';
import type { MatchData } from '../../../types';


const sumRecords = (records: (Record<string, number> | undefined)[]) => {
    const result: Record<string, number> = {};
    records.forEach(record => {
        if (!record) return;
        Object.entries(record).forEach(([key, value]) => {
            result[key] = (result[key] || 0) + value;
        });
    });
    return result;
};

interface OverallStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    matches: MatchData[];
    t: (key: string) => string;
}

const StatGrid: React.FC<{ title: string, icon: React.ReactNode, data: Record<string, number>, color: string, t: (key: string) => string }> = ({ title, icon, data, color, t }) => {
    if (!data || Object.keys(data).length === 0) return null;

    
    const entries = Object.entries(data).filter(([_, val]) => val !== 0).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return null;

    const getLabel = (key: string) => {
        const translationKey = `stats.${key}`;
        const translated = t(translationKey);
        if (translated !== translationKey && translated) return translated;
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
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
                            {value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const OverallStatsModal: React.FC<OverallStatsModalProps> = ({ isOpen, onClose, matches, t }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const gsap = useGSAP();
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();
    const { playExit } = useUISounds();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen && modalRef.current) {
            gsap.animateModalIn(modalRef.current);
        }
    }, [isOpen, gsap]);

    const handleClose = () => {
        playExit();
        if (modalRef.current) {
            gsap.animateModalOut(modalRef.current, onClose);
        } else {
            onClose();
        }
    };

    const aggregatedStats = useMemo(() => {
        if (!matches.length) return null;

        const baseStats = {
            kills: 0,
            headshots: 0,
            revives: 0,
            downs: 0,
            score: 0,
            gamesPlayed: matches.length
        };

        const collections = {
            combat: [] as Record<string, number>[],
            survival: [] as Record<string, number>[],
            magicBox: [] as Record<string, number>[],
            powerups: [] as Record<string, number>[],
            equipment: [] as Record<string, number>[],
            mapSpecific: [] as Record<string, number>[],
            persistentUpgrades: [] as Record<string, number>[],
            mobOfTheDead: [] as Record<string, number>[],
            buried: [] as Record<string, number>[],
            origins: [] as Record<string, number>[],
        };

        matches.forEach(m => {
            baseStats.kills += m.kills;
            baseStats.headshots += m.headshots;
            baseStats.revives += m.revives;
            baseStats.downs += m.downs;
            baseStats.score += m.score;

            if (m.combat) collections.combat.push(m.combat);
            if (m.survival) collections.survival.push(m.survival);
            if (m.magicBox) collections.magicBox.push(m.magicBox);
            if (m.powerups) collections.powerups.push(m.powerups);
            if (m.equipment) collections.equipment.push(m.equipment);
            if (m.mapSpecific) collections.mapSpecific.push(m.mapSpecific);
            if (m.persistentUpgrades) collections.persistentUpgrades.push(m.persistentUpgrades);
            if (m.mobOfTheDead) collections.mobOfTheDead.push(m.mobOfTheDead);
            if (m.buried) collections.buried.push(m.buried);
            if (m.origins) collections.origins.push(m.origins);
        });

        return {
            base: baseStats,
            combat: sumRecords(collections.combat),
            survival: sumRecords(collections.survival),
            magicBox: sumRecords(collections.magicBox),
            powerups: sumRecords(collections.powerups),
            equipment: sumRecords(collections.equipment),
            mapSpecific: sumRecords(collections.mapSpecific),
            persistentUpgrades: sumRecords(collections.persistentUpgrades),
            mobOfTheDead: sumRecords(collections.mobOfTheDead),
            buried: sumRecords(collections.buried),
            origins: sumRecords(collections.origins),
        };
    }, [matches]);

    if (!mounted || !isOpen || !aggregatedStats) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-black/95 backdrop-blur-xl' : 'bg-black/85 backdrop-blur-xl'}`}
            onClick={handleClose}
        >
            <div
                ref={modalRef}
                className={`w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col border ${theme === 'dark' ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-700/60' : 'bg-white border-slate-300/60'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {}
                <div className="relative p-6 sm:p-8 border-b border-slate-200/10 shrink-0 bg-slate-100/50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30">
                                <Trophy className="w-8 h-8 text-purple-500" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {t('stats.overallStats')}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                    {t('matches.total')} {aggregatedStats.base.gamesPlayed} {t('stats.matchesLabel')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-slate-50 dark:bg-slate-950/50">

                    {}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
                            <Target className="w-5 h-5 text-red-500 mx-auto mb-2" />
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('stats.kills')}</p>
                            <p className="text-2xl font-black text-red-500 dark:text-red-400">{aggregatedStats.base.kills.toLocaleString()}</p>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-center">
                            <Skull className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('stats.headshots')}</p>
                            <p className="text-2xl font-black text-yellow-600 dark:text-yellow-400">{aggregatedStats.base.headshots.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center">
                            <Heart className="w-5 h-5 text-green-500 mx-auto mb-2" />
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('stats.revives')}</p>
                            <p className="text-2xl font-black text-green-600 dark:text-green-400">{aggregatedStats.base.revives.toLocaleString()}</p>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-center">
                            <Award className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('stats.downs')}</p>
                            <p className="text-2xl font-black text-orange-500 dark:text-orange-400">{aggregatedStats.base.downs.toLocaleString()}</p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-center sm:col-span-3 lg:col-span-1">
                            <Trophy className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t('stats.score')}</p>
                            <p className="text-xl font-black text-blue-600 dark:text-blue-400">{aggregatedStats.base.score.toLocaleString()}</p>
                        </div>
                    </div>

                    {}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatGrid title={t('stats.combat')} icon={<Swords className="w-5 h-5" />} data={aggregatedStats.combat} color="bg-red-500" t={t} />
                        <StatGrid title={t('stats.survivalMode')} icon={<Shield className="w-5 h-5" />} data={aggregatedStats.survival} color="bg-emerald-500" t={t} />
                        <StatGrid title={t('stats.magicBox')} icon={<Box className="w-5 h-5" />} data={aggregatedStats.magicBox} color="bg-purple-500" t={t} />
                        <StatGrid title={t('stats.powerups')} icon={<Zap className="w-5 h-5" />} data={aggregatedStats.powerups} color="bg-yellow-500" t={t} />
                        <StatGrid title="Map Specific" icon={<MapIcon className="w-5 h-5" />} data={aggregatedStats.mapSpecific} color="bg-indigo-500" t={t} />
                        <StatGrid title="Equipment" icon={<Grip className="w-5 h-5" />} data={aggregatedStats.equipment} color="bg-stone-500" t={t} />
                        <StatGrid title="Persistent Upgrades" icon={<Activity className="w-5 h-5" />} data={aggregatedStats.persistentUpgrades} color="bg-cyan-500" t={t} />

                        <StatGrid title={t('map.mobOfTheDead')} icon={<MapIcon className="w-5 h-5" />} data={aggregatedStats.mobOfTheDead} color="bg-orange-600" t={t} />
                        <StatGrid title={t('map.buried')} icon={<MapIcon className="w-5 h-5" />} data={aggregatedStats.buried} color="bg-amber-700" t={t} />
                        <StatGrid title={t('map.origins')} icon={<MapIcon className="w-5 h-5" />} data={aggregatedStats.origins} color="bg-blue-600" t={t} />
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OverallStatsModal;
