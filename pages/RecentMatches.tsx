import React from 'react';
import type { RecentMatch } from '../types';

interface RecentMatchesProps {
  matches: RecentMatch[];
}

const MatchCard: React.FC<{ match: RecentMatch }> = ({ match }) => {
  return (
    <div className="bg-slate-800 border border-slate-700/50 rounded-lg p-4 transition-all duration-300 hover:bg-slate-700/50">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold text-slate-100">{match.map}</h3>
          <p className="text-sm text-slate-400 font-semibold">{match.mode}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-300">
            Kills: <span className="text-white font-bold">{match.kills}</span>
          </p>
          <p className="text-xs text-slate-500">{match.date}</p>
        </div>
      </div>
    </div>
  );
};

const RecentMatches: React.FC<RecentMatchesProps> = ({ matches }) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-100 mb-6 border-b-2 border-slate-700 pb-2">Partidas Recientes</h2>
      <div className="space-y-4">
        {matches.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
};

export default RecentMatches;