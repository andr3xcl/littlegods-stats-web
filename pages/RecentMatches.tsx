import React, { useRef, useEffect } from 'react';
import type { RecentMatch } from '../types';
import { useGSAP } from '../utils/gsap';

interface RecentMatchesProps {
  matches: RecentMatch[];
}

const MatchCard: React.FC<{
  match: RecentMatch;
  isExpanded: boolean;
  onToggleExpansion: () => void;
}> = ({ match, isExpanded, onToggleExpansion }) => {
  // GSAP hooks
  const gsap = useGSAP();
  const { t } = useLanguage();

  const handleCardHover = React.useCallback((element: HTMLElement, isHover: boolean) => {
    gsap.animateButtonHover(element, isHover);
  }, [gsap]);

  return (
    <div
      className="bg-slate-800 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-200"
      onMouseEnter={(e) => handleCardHover(e.currentTarget, true)}
      onMouseLeave={(e) => handleCardHover(e.currentTarget, false)}
    >
      {/* Header de la partida */}
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
          {/* Botón de expandir/colapsar */}
          <button
            onClick={onToggleExpansion}
            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors p-1"
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
      </div>

      {/* Estadísticas detalladas - se muestran cuando está expandido */}
      {isExpanded && (
        <div className="border-t border-slate-700/50 pt-3">
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

          {/* Fila adicional para Revives y Score */}
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
      )}
    </div>
  );
};

const RecentMatches: React.FC<RecentMatchesProps> = ({ matches }) => {
  // GSAP hooks y referencias
  const gsap = useGSAP();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [expandedMatches, setExpandedMatches] = React.useState<Set<string>>(new Set());
  const { t } = useLanguage();

  // Función para toggle de expansión
  const toggleMatchExpansion = React.useCallback((matchId: string) => {
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

  // Animaciones de scroll
  useEffect(() => {
    if (titleRef.current) {
      gsap.animateFadeInOnScroll(titleRef.current, 0, "top 90%");
    }
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.match-card');
      gsap.animateStaggerOnScroll(cards, 0.1, "top 85%");
    }
  }, [gsap]);

  return (
    <div>
      <h2 ref={titleRef} className="text-3xl font-bold text-slate-100 mb-6 border-b-2 border-slate-700 pb-2">Partidas Recientes</h2>
      <div ref={cardsRef} className="space-y-4">
        {matches.map(match => (
          <div key={match.id} className="match-card">
            <MatchCard
              match={match}
              isExpanded={expandedMatches.has(match.id)}
              onToggleExpansion={() => toggleMatchExpansion(match.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentMatches;