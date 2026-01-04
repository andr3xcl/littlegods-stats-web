import React, { useState, useEffect } from 'react';
import { loadRecentMatches } from '../constants';
import type { RecentMatch } from '../types';
import MatchDetails from '../components/features/matches/MatchDetails';
import { useLanguage } from '../contexts/LanguageContext';
import WeaponDetailsModal from '../components/features/matches/WeaponDetailsModal';

const RecentMatches: React.FC = () => {
    const [matches, setMatches] = useState<RecentMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatchForWeapons, setSelectedMatchForWeapons] = useState<RecentMatch | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                
                
                
                
                
                
                
                
                
                
                
                
                const data = await loadRecentMatches();
                setMatches(data);
            } catch (error) {
                console.error("Failed to load matches", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                    {t('menu.recentMatches') || 'Partidas Recientes'}
                </h2>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-slate-500 animate-pulse">{t('general.loading')}</p>
                </div>
            ) : matches.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">{t('modal.noDataAvailable')}</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {matches.map((match, index) => (
                        <div key={index} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white map-name">
                                        {match.map}
                                    </h3>
                                    <span className="text-xs text-slate-500 font-mono">
                                        {new Date(match.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-indigo-500">R{match.round}</span>
                                </div>
                            </div>
                            <MatchDetails
                                match={match}
                                t={t}
                                onViewWeapons={(m) => setSelectedMatchForWeapons(m)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {selectedMatchForWeapons && (
                <WeaponDetailsModal
                    isOpen={!!selectedMatchForWeapons}
                    onClose={() => setSelectedMatchForWeapons(null)}
                    match={selectedMatchForWeapons}
                    weaponImages={{}} 
                />
            )}
        </div>
    );
};

export default RecentMatches;
