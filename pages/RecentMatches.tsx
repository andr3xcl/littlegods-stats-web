import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import type { RecentMatch } from '../types';
import { useGSAP } from '../utils/gsap';
import { Award, Target, CrosshairIcon, UserDownIcon, Heart, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface RecentMatchesProps {
  matches: RecentMatch[];
}

const MatchCard: React.FC<{
  match: RecentMatch;
  isExpanded: boolean;
  onToggleExpansion: (id: string) => void;
}> = React.memo(({ match, isExpanded, onToggleExpansion }) => {
  const { t } = useLanguage();

  return (
    <div
      className="bg-slate-800 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold text-slate-100">{match.map}</h3>
          <p className="text-sm text-slate-400 font-semibold">{match.mode}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-slate-300">
              Kills: <span className="text-white font-bold">{match.kills}</span>
            </p>
            <p className="text-xs text-slate-500">{match.date}</p>
          </div>
          {/* Expand Button */}
          <button
            onClick={() => onToggleExpansion(match.id)}
            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors p-1"
          >
            {isExpanded ? t('stats.collapse') : t('stats.expand')}
            <svg
              className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Stats */}
      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-3 border-t border-slate-700/50 pt-3' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
        <div className="overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Round */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 rounded-lg p-3 text-center">
              <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-1">
                <Award className="w-3 h-3 text-white" />
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Round</p>
              <p className="text-lg font-black text-indigo-400">{match.round}</p>
            </div>

            {/* Kills */}
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg p-3 text-center">
              <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-1">
                <Target className="w-3 h-3 text-white" />
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('stats.kills')}</p>
              <p className="text-lg font-black text-red-400">{match.kills}</p>
            </div>

            {/* Headshots */}
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-3 text-center">
              <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-1">
                <CrosshairIcon className="w-3 h-3 text-white" />
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('stats.headshots')}</p>
              <p className="text-lg font-black text-orange-400">{match.headshots}</p>
            </div>

            {/* Downs */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-3 text-center">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-1">
                <UserDownIcon className="w-3 h-3 text-white" />
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('stats.downs')}</p>
              <p className="text-lg font-black text-blue-400">{match.downs}</p>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            {/* Revives */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-3 text-center">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-1">
                <Heart className="w-3 h-3 text-white" />
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('stats.revives')}</p>
              <p className="text-lg font-black text-green-400">{match.revives}</p>
            </div>

            {/* Score */}
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-3 text-center">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-1">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('stats.score')}</p>
              <p className="text-lg font-black text-purple-400">{match.score.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const RecentMatches: React.FC<RecentMatchesProps> = ({ matches }) => {
  // GSAP hooks y referencias
  const gsap = useGSAP();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [expandedMatches, setExpandedMatches] = React.useState<Set<string>>(new Set());
  const { t } = useLanguage();

  // Función para toggle de expansión - Memoized
  const toggleMatchExpansion = useCallback((matchId: string) => {
    setExpandedMatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(matchId)) {
        newSet.delete(matchId);
      } else {
        newSet.add(matchId);
      }
      return newSet;
    });
  }, []);

  // Animaciones de scroll - Only run once on mount
  useEffect(() => {
    if (titleRef.current) {
      gsap.animateFadeInOnScroll(titleRef.current, 0, "top 90%");
    }
    if (cardsRef.current) {
      // Use a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (cardsRef.current) {
          const cards = cardsRef.current.querySelectorAll('.match-card');
          if (cards.length > 0) {
            gsap.animateStaggerOnScroll(cards, 0.05, "top 95%"); // Reduced stagger time for snappier feel
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [gsap]); // Removed matches dependency to prevent re-animating on every update

  return (
    <div>
      <h2 ref={titleRef} className="text-3xl font-bold text-slate-100 mb-6 border-b-2 border-slate-700 pb-2">Partidas Recientes</h2>
      <div ref={cardsRef} className="space-y-4">
        {matches.map(match => (
          <div key={match.id} className="match-card">
            <MatchCard
              match={match}
              isExpanded={expandedMatches.has(match.id)}
              onToggleExpansion={toggleMatchExpansion}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentMatches;