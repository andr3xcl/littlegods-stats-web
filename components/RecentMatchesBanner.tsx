import React, { useState, useEffect } from 'react';
import { Target, Skull, Heart, Award, Map as MapIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MatchData {
  playerName: string;
  guid: string;
  map: string;
  round: number;
  kills: number;
  headshots: number;
  revives: number;
  downs: number;
  score: number;
  timestamp: number;
  fileName: string;
}

interface RecentMatchesBannerProps {
  playerGuid: string;
}

const MAP_NAMES: Record<string, string> = {
  'nuked': 'Nuketown Zombies',
  'transit': 'TranZit',
  'farm': 'Farm',
  'town': 'Town',
  'prison': 'Mob of the Dead',
  'tomb': 'Origins',
  'buried': 'Buried',
  'die_rise': 'Die Rise',
  'rooftop': 'Die Rise',
  'processing': 'Buried'
};

const MAP_IMAGES: Record<string, string> = {
  'nuked': './data/images/Nuketown_menu_selection_BO2.jpg',
  'transit': './data/images/TranZit_lobby_BOII.jpg',
  'farm': './data/images/TranZit_lobby_BOII.jpg',
  'town': './data/images/TranZit_lobby_BOII.jpg',
  'prison': './data/images/Mob_of_the_Dead_menu_selection_BO2.jpg',
  'tomb': './data/images/Origins_Lobby_Icon_BO2.jpg',
  'buried': './data/images/Buried_menu_BOII.jpg',
  'rooftop': './data/images/Die_Rise_menu_selection_BO2.jpg',
  'processing': './data/images/Buried_menu_BOII.jpg'
};

export default function RecentMatchesBanner({ playerGuid }: RecentMatchesBannerProps) {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await fetch('./data/recent_matches.json');
        if (response.ok) {
          const allMatches: MatchData[] = await response.json();
          // Filtrar solo las partidas del jugador seleccionado
          const playerMatches = allMatches.filter(match => match.guid === playerGuid);
          setMatches(playerMatches);
          // Resetear el índice si cambia el jugador
          setCurrentIndex(0);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error cargando partidas recientes:', error);
        setLoading(false);
      }
    };

    loadMatches();

    // Actualizar cada 3 segundos para ver cambios en tiempo real
    const interval = setInterval(loadMatches, 3000);

    return () => clearInterval(interval);
  }, [playerGuid]);

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(matches.length / ITEMS_PER_PAGE);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="text-slate-600 dark:text-slate-400 text-sm text-center py-8">{t('matches.loading')}</div>
      </div>
    );
  }

  if (matches.length === 0) {
    return null; // No mostrar nada si no hay partidas
  }

  return (
    <div className="relative">
      {/* Header elegante responsive */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500 blur-xl opacity-50"></div>
            <Clock className="relative w-5 h-5 sm:w-7 sm:h-7 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('matches.title')}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 hidden sm:block">{matches.length} {t('matches.registered')}</p>
          </div>
        </div>
        
        {/* Botones de navegación premium */}
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={handlePrevious}
            className="group relative p-2 sm:p-3 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 hover:from-orange-500 hover:to-orange-600 border border-slate-300 dark:border-slate-600 hover:border-orange-500 rounded-lg sm:rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/20"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-300 group-hover:text-white transition-colors" />
          </button>
          <button
            onClick={handleNext}
            className="group relative p-2 sm:p-3 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 hover:from-orange-500 hover:to-orange-600 border border-slate-300 dark:border-slate-600 hover:border-orange-500 rounded-lg sm:rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/20"
            disabled={currentIndex >= totalPages - 1}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-300 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>

      {/* Carrusel horizontal - Responsive: 1 en móvil, 3 en tablet, 5 en desktop */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-700 ease-in-out gap-3 sm:gap-4"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div key={pageIndex} className="flex-shrink-0 w-full flex gap-3 sm:gap-4">
              {matches
                .slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE)
                .map((match, index) => (
                  <div
                    key={`${match.fileName}-${index}`}
                    className="flex-shrink-0 w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-10.67px)] group"
                  >
                    <div className="relative bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-xl border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl hover:shadow-orange-500/20 hover:border-orange-500/50 hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500">
                      
                      {/* Banner del mapa compacto */}
                      <div className="relative h-32 sm:h-36 md:h-40 overflow-hidden">
                        <img
                          src={MAP_IMAGES[match.map] || './data/images/Nuketown_menu_selection_BO2.jpg'}
                          alt={MAP_NAMES[match.map]}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Tag de zombies */}
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 sm:py-1 rounded-full border border-orange-500/30">
                            <MapIcon className="w-3 h-3 text-orange-400" />
                            <span className="text-xs text-orange-400 font-bold uppercase hidden sm:inline">{t('stats.zombies')}</span>
                          </div>
                        </div>
                        
                        {/* Badge de ronda */}
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-1 rounded-lg font-black text-xs shadow-lg">
                            R{match.round}
                          </div>
                        </div>
                        
                        {/* Nombre del mapa */}
                        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                          <h4 className="text-base sm:text-lg font-black text-white drop-shadow-lg truncate">
                            {MAP_NAMES[match.map]}
                          </h4>
                        </div>
                      </div>

                      {/* Estadísticas compactas responsive */}
                      <div className="p-3 sm:p-4 space-y-2">
                        {/* Fecha */}
                        <div className="text-xs text-slate-600 dark:text-slate-400 text-center mb-2 sm:mb-3">
                          {new Date(match.timestamp).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>

                        {/* Stats grid 2x2 */}
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-center">
                            <Target className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 mx-auto mb-1" />
                            <p className="text-xs text-slate-600 dark:text-slate-400">{t('stats.kills')}</p>
                            <p className="text-base sm:text-lg font-black text-red-500 dark:text-red-400">{match.kills}</p>
                          </div>
                          
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 text-center">
                            <Skull className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 mx-auto mb-1" />
                            <p className="text-xs text-slate-600 dark:text-slate-400">{t('stats.headshots')}</p>
                            <p className="text-base sm:text-lg font-black text-yellow-600 dark:text-yellow-400">{match.headshots}</p>
                          </div>
                          
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
                            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mx-auto mb-1" />
                            <p className="text-xs text-slate-600 dark:text-slate-400">{t('stats.revives')}</p>
                            <p className="text-base sm:text-lg font-black text-green-600 dark:text-green-400">{match.revives}</p>
                          </div>
                          
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-center">
                            <Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mx-auto mb-1" />
                            <p className="text-xs text-slate-600 dark:text-slate-400">{t('stats.score')}</p>
                            <p className="text-sm font-black text-blue-600 dark:text-blue-400">{match.score.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Downs compacto o estado de desconexión */}
                        <div className={`border rounded-lg p-2 text-center ${
                          match.downs > 0
                            ? 'bg-red-500/10 border-red-500/20'
                            : 'bg-blue-500/10 border-blue-500/20'
                        }`}>
                          <span className={`text-xs font-bold ${
                            match.downs > 0
                              ? 'text-red-500 dark:text-red-400'
                              : 'text-blue-500 dark:text-blue-400'
                          }`}>
                            {match.downs > 0 ? `${match.downs} ${t('matches.downs.count')}` : t('matches.disconnect')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores de página */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'w-6 sm:w-8 bg-orange-500' 
                : 'w-1.5 sm:w-2 bg-slate-400 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

