import React, { useState, useEffect, useRef } from 'react';
import { Clock, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useGSAP } from '../../../utils/gsap';
import type { MatchData } from '../../../types';
import MatchBannerItem from './MatchBannerItem';
import MatchDetailsModal from './MatchDetailsModal';

import { loadRecentMatches } from '../../../constants';

interface RecentMatchesBannerProps {
  playerIdentifier: string;
}

export default function RecentMatchesBanner({ playerIdentifier }: RecentMatchesBannerProps) {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userTriggeredChange, setUserTriggeredChange] = useState(false);
  const { t } = useLanguage();
  const { theme } = useTheme();

  // GSAP hooks
  const gsap = useGSAP();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMatches = async (isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);
        const newMatches = (await loadRecentMatches(playerIdentifier)) as unknown as MatchData[];
        if (isMounted) {
          setMatches(newMatches);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error cargando partidas recientes:', error);
        if (isMounted) setLoading(false);
      }
    };

    loadMatches();
    const interval = setInterval(() => loadMatches(true), 30000); // Background refresh every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [playerIdentifier]);

  useEffect(() => {
    setCurrentIndex(0);
    setUserTriggeredChange(false);
  }, [playerIdentifier]);

  useEffect(() => {
    if (userTriggeredChange && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.match-banner',
          { opacity: 0, x: 50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            clearProps: "all"
          }
        );
      }, containerRef);

      setUserTriggeredChange(false);
      return () => ctx.revert();
    }
  }, [currentIndex, userTriggeredChange, gsap]);

  const ITEMS_TO_SHOW = 3;

  const handlePrevious = () => {
    setUserTriggeredChange(true);
    setCurrentIndex((prev) => Math.max(0, prev - ITEMS_TO_SHOW));
  };

  const handleNext = () => {
    setUserTriggeredChange(true);
    setCurrentIndex((prev) => Math.min(matches.length - ITEMS_TO_SHOW, prev + ITEMS_TO_SHOW));
  };

  const openMatchDetails = (match: MatchData) => {
    setSelectedMatch(match);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (matches.length === 0) return null;

  return (
    <div className="relative">
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <Clock className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('matches.title')}</h2>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>{t('matches.last30Days')}</span>
              <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
              <span>{matches.length} {t('matches.total')}</span>
            </div>
          </div>
        </div>

        {/* Custom Navigation */}
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-orange-500 dark:hover:text-orange-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= matches.length - ITEMS_TO_SHOW}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-orange-500 dark:hover:text-orange-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Matches Timeline/Grid */}
      <div className="relative" ref={containerRef}>
        {/* Timeline Line (Visual only) */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent -z-10 hidden md:block"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {matches
            .slice(currentIndex, currentIndex + ITEMS_TO_SHOW)
            .map((match, index) => {
              const globalIndex = currentIndex + index;

              return (
                <div key={`${match.fileName}-${globalIndex}`} className="match-banner">
                  <MatchBannerItem
                    match={match}
                    onClick={() => openMatchDetails(match)}
                  />
                </div>
              );
            })}
        </div>
      </div>

      {/* Match Details Modal */}
      <MatchDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        match={selectedMatch}
        t={t}
      />
    </div>
  );
}
