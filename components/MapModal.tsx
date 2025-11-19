import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MAP_BANNERS, MAP_NAME_TO_CODE } from '../constants';
import { TrendingUp, Target, Skull, Heart, Award, Activity, Calendar, Trophy, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useGSAP } from '../utils/gsap';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMap: string | null;
  mapDisplayNames: { [key: string]: string };
  playerData: any;
}

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

interface BankTransaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'deposit_from_player' | 'pay_to_player';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  date: string;
  timestamp: number;
}

type MetricType = 'general' | 'kills' | 'downs' | 'score' | 'revives' | 'headshots' | 'bank';

interface MetricConfig {
  key: MetricType;
  label: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}


const MapModal: React.FC<MapModalProps> = React.memo(({ isOpen, onClose, selectedMap, mapDisplayNames, playerData }) => {
  const [matchHistory, setMatchHistory] = useState<MatchData[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('general');
  const { t } = useLanguage();
  const { theme } = useTheme();

  // GSAP hooks y referencias
  const gsap = useGSAP();
  const modalRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasAnimatedModal = useRef(false);

  // Función helper para clases de tema
  const getThemeClasses = (classes: { light: string; dark: string }) => {
    return theme === 'dark' ? classes.dark : classes.light;
  };

  // Configuración de métricas con traducciones
  const METRICS_CONFIG: MetricConfig[] = useMemo(() => [
    {
      key: 'general',
      label: t('stats.general'),
      color: '#8b5cf6',
      icon: <Activity className="w-5 h-5" />,
      description: t('modal.generalDescription')
    },
    {
      key: 'kills',
      label: t('stats.kills'),
      color: '#ef4444',
      icon: <Target className="w-5 h-5" />,
      description: t('metric.kills.desc')
    },
    {
      key: 'downs',
      label: t('stats.downs'),
      color: '#f97316',
      icon: <TrendingUp className="w-5 h-5" />,
      description: t('metric.downs.desc')
    },
    {
      key: 'revives',
      label: t('stats.revives'),
      color: '#10b981',
      icon: <Heart className="w-5 h-5" />,
      description: t('metric.revives.desc')
    },
    {
      key: 'headshots',
      label: t('stats.headshots'),
      color: '#8b5cf6',
      icon: <Skull className="w-5 h-5" />,
      description: t('metric.headshots.desc')
    },
    {
      key: 'score',
      label: t('stats.score'),
      color: '#fbbf24',
      icon: <Award className="w-5 h-5" />,
      description: t('metric.score.desc')
    },
    {
      key: 'bank',
      label: t('stats.bank'),
      color: '#f59e0b',
      icon: <Award className="w-5 h-5" />,
      description: t('metric.bank.desc')
    }
  ], [t]);

  const handleMetricChange = useCallback((metric: MetricType) => {
    setSelectedMetric(metric);
  }, []);

  // Animaciones GSAP para entrada/salida del modal
  useEffect(() => {
    if (isOpen && modalRef.current && !hasAnimatedModal.current) {
      gsap.animateModalIn(modalRef.current);
      hasAnimatedModal.current = true;
    }
    // Resetear cuando se cierra el modal
    if (!isOpen) {
      hasAnimatedModal.current = false;
    }
  }, [isOpen, gsap]);

  // Animación del spinner de carga
  useEffect(() => {
    if (loading && spinnerRef.current) {
      gsap.animateSpinner(spinnerRef.current);
    } else if (!loading && spinnerRef.current) {
      gsap.killAnimations(spinnerRef.current);
    }
  }, [loading, gsap]);

  // Cargar historial de partidas del mapa seleccionado y transacciones bancarias
  useEffect(() => {
    if (isOpen && selectedMap) {
      loadMatchHistory();
      loadBankTransactions();
    }
  }, [isOpen, selectedMap]);

  const loadMatchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('./data/recent_matches.json');
      if (response.ok) {
        const allMatches: MatchData[] = await response.json();
        // Filtrar solo las partidas de este mapa
        const mapMatches = allMatches.filter(match => match.map === selectedMap);
        setMatchHistory(mapMatches);
      }
    } catch (error) {
      console.error('Error loading match history:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMap]);

  const loadBankTransactions = useCallback(async () => {
    try {
      // Leer directamente los archivos de transacciones bancarias
      const currentPlayerGuid = playerData?.guid;
      if (!currentPlayerGuid) return;

      // Intentar leer desde la API del backend Node.js (si existe)
      try {
        const response = await fetch(`/api/bank-transactions/${currentPlayerGuid}`);
        if (response.ok) {
          const transactions = await response.json();
          setBankTransactions(transactions);
          return;
        }
      } catch (apiError) {
        // Si no hay API, fallback al método del frontend (limitado)
        console.warn('API not available, using limited frontend method');
      }

      // Método limitado del frontend - solo puede leer archivos estáticos
      // En producción, esto debería ser manejado por el backend
      const response = await fetch('./data/data_player.json');
      if (response.ok) {
        const playersData = await response.json();
        if (playersData[currentPlayerGuid]?.economy?.transactions) {
          const transactions = playersData[currentPlayerGuid].economy.transactions;
          setBankTransactions(transactions);
        }
      }
    } catch (error) {
      console.error('Error loading bank transactions:', error);
      setBankTransactions([]); // Asegurar que sea un array vacío en caso de error
    }
  }, [playerData?.guid]);

  const mapStats = useMemo(() => {
    return playerData?.maps?.[selectedMap] || {
    topRound: 0,
    totalKills: 0,
    totalHeadshots: 0,
    totalRevives: 0,
    totalDowns: 0,
    totalScore: 0,
    gamesPlayed: 0,
      lastPlayed: 'N/A'
    };
  }, [playerData, selectedMap]);

  // Preparar datos para gráficos
  const chartData = useMemo(() => {
    if (selectedMetric === 'bank') {
      // Para datos bancarios, mostrar evolución del balance con colores por tipo de transacción
      return bankTransactions.slice().sort((a, b) => a.timestamp - b.timestamp).map((transaction, index) => {
        const timeString = transaction.timestamp ? `${Math.floor(transaction.timestamp / 3600)}h ${Math.floor((transaction.timestamp % 3600) / 60)}m` : '0h 0m';

        return {
          game: `T${index + 1}`,
          time: timeString,
          bank: transaction.balanceAfter || 0,
          balance: transaction.balanceAfter || 0,
          amount: transaction.amount || 0,
          type: transaction.type || 'unknown',
          description: transaction.description || t('modal.noDescription'),
          timestamp: transaction.timestamp,
          // Color para el punto según tipo de transacción
          dotColor: (transaction.type === 'deposit' || transaction.type === 'deposit_from_player') ? '#10b981' :
                   (transaction.type === 'withdraw' || transaction.type === 'pay_to_player') ? '#ef4444' : '#6b7280'
        };
      });
    } else {
      // Para datos de partidas normales
      return matchHistory.slice().reverse().map((match, index) => ({
        game: `${t('modal.matchNumber')} ${index + 1}`,
        kills: match.kills,
        downs: match.downs,
        score: match.score,
        headshots: match.headshots,
        revives: match.revives,
        round: match.round,
        date: new Date(match.timestamp).toLocaleDateString()
      }));
    }
  }, [matchHistory, bankTransactions, selectedMetric]);

  // Obtener configuración de la métrica seleccionada
  const currentMetricConfig = useMemo(() =>
    METRICS_CONFIG.find(m => m.key === selectedMetric)!,
    [selectedMetric]
  );

  // Calcular estadísticas comparativas para todas las métricas
  const statsComparison = useMemo(() => {
    if (chartData.length === 0 && selectedMetric !== 'general') return null;
    if (matchHistory.length === 0 && selectedMetric === 'general') return null;

    const result: Record<MetricType, any> = {} as Record<MetricType, any>;

    // Para vista general, calcular estadísticas de todas las métricas normales
    if (selectedMetric === 'general') {
      ['kills', 'downs', 'revives', 'headshots', 'score'].forEach(metricKey => {
        const data = matchHistory.map(m => m[metricKey as keyof MatchData] as number).filter(val => val !== undefined && val !== null && !isNaN(val));
        if (data.length > 0) {
          result[metricKey as MetricType] = {
            best: Math.max(...data),
            worst: Math.min(...data),
            average: data.reduce((a, b) => a + b, 0) / data.length,
            trend: data.length > 1 ? (data[data.length - 1] > data[0] ? 'up' : 'down') : 'stable'
          };
        }
      });
    } else {
      // Calcular estadísticas para todas las métricas
      METRICS_CONFIG.forEach(metric => {
        if (metric.key === 'bank') {
        // Para datos bancarios, calcular estadísticas del balance a lo largo del tiempo
        const bankData = chartData.map(d => d.bank as number).filter(val => !isNaN(val));
        if (bankData.length > 0) {
          // El balance inicial (primera transacción) vs balance final
          const initialBalance = bankData[0];
          const finalBalance = bankData[bankData.length - 1];

          result['bank'] = {
            best: Math.max(...bankData),
            worst: Math.min(...bankData),
            average: bankData.reduce((a, b) => a + b, 0) / bankData.length,
            trend: finalBalance > initialBalance ? 'up' : finalBalance < initialBalance ? 'down' : 'stable'
          };
        } else {
          // Fallback al balance actual
          result['bank'] = {
            best: playerData?.economy?.balance || 0,
            worst: 0,
            average: playerData?.economy?.balance || 0,
            trend: 'stable'
          };
        }
      } else {
        // Para métricas normales de partidas
        const data = matchHistory.map(m => m[metric.key as keyof MatchData] as number).filter(val => val !== undefined && val !== null && !isNaN(val));
        if (data.length > 0) {
          result[metric.key] = {
            best: Math.max(...data),
            worst: Math.min(...data),
            average: data.reduce((a, b) => a + b, 0) / data.length,
            trend: data.length > 1 ? (data[data.length - 1] > data[0] ? 'up' : 'down') : 'stable'
          };
        }
      }
    });

    }

    return result;
  }, [chartData, playerData?.economy?.balance, selectedMetric, matchHistory]);

  if (!isOpen || !selectedMap) return null;

  const mapCode = MAP_NAME_TO_CODE[selectedMap] || selectedMap;
  const mapBanner = MAP_BANNERS[mapCode] || null;
  const safeMapBanner = mapBanner && mapBanner.trim() !== '' ? mapBanner : null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 ${getThemeClasses({
        light: 'bg-black/85 backdrop-blur-xl',
        dark: 'bg-black/95 backdrop-blur-xl'
      })}`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`w-full max-w-7xl max-h-[95vh] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border ${getThemeClasses({
          light: 'bg-white border-slate-300/60',
          dark: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-700/60'
        })}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con banner mejorado */}
        <div className="relative">
          <div className={`relative h-48 sm:h-56 lg:h-64 overflow-hidden ${getThemeClasses({
            light: 'rounded-t-2xl sm:rounded-t-3xl',
            dark: 'rounded-t-2xl sm:rounded-t-3xl'
          })}`}>
            {safeMapBanner ? (
              <img
                src={safeMapBanner}
                alt={`${mapDisplayNames[selectedMap]} banner`}
                className={`w-full h-full object-cover ${getThemeClasses({
                  light: 'brightness-110 contrast-105',
                  dark: 'brightness-95 contrast-110'
                })}`}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${getThemeClasses({
                light: 'bg-gradient-to-br from-blue-400 to-purple-600',
                dark: 'bg-gradient-to-br from-indigo-500 to-purple-600'
              })}`}>
                <div className="text-center text-white">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Trophy className={`w-8 h-8 ${getThemeClasses({
                      light: 'text-slate-700',
                      dark: 'text-white'
                    })}`} />
                  </div>
                  <h3 className={`text-xl font-bold ${getThemeClasses({
                    light: 'text-slate-900',
                    dark: 'text-white'
                  })}`}>{mapDisplayNames[selectedMap]}</h3>
                </div>
              </div>
            )}

            {/* Overlays mejorados con temas para mejor legibilidad de logos */}
            <div className={`absolute inset-0 bg-gradient-to-t ${getThemeClasses({
              light: 'from-black/60 via-black/30 via-60% to-transparent',
              dark: 'from-black/85 via-black/50 via-60% to-transparent'
            })}`}></div>
            <div className={`absolute inset-0 bg-gradient-to-r ${getThemeClasses({
              light: 'from-indigo-800/30 via-purple-800/15 to-transparent',
              dark: 'from-indigo-900/50 via-purple-900/25 to-transparent'
            })}`}></div>
            <div className={`absolute inset-0 bg-gradient-to-br ${getThemeClasses({
              light: 'from-transparent via-transparent to-pink-400/15',
              dark: 'from-transparent via-transparent to-pink-900/20'
            })}`}></div>

            {/* Overlay adicional para mejor legibilidad de logos */}
            <div className={`absolute inset-0 ${getThemeClasses({
              light: 'bg-black/10',
              dark: 'bg-black/20'
            })}`}></div>

            {/* Botón de cerrar mejorado */}
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 sm:top-6 sm:right-6 rounded-full p-2 sm:p-3 backdrop-blur-md border transition-all duration-200 hover:scale-105 ${getThemeClasses({
                light: 'bg-white/80 hover:bg-white/90 text-slate-700 border-white/40 hover:border-white/60',
                dark: 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30'
              })}`}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Header de información mejorado */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-md border ${getThemeClasses({
                    light: 'bg-white/20 border-white/30',
                    dark: 'bg-white/20 border-white/10'
                  })}`}>
                    <Trophy className={`w-5 h-5 sm:w-6 sm:h-6 ${getThemeClasses({
                      light: 'text-slate-700',
                      dark: 'text-white'
                    })}`} />
                  </div>
                  <div>
                    <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black mb-0.5 drop-shadow-lg ${getThemeClasses({
                      light: 'text-white',
                      dark: 'text-white'
                    })}`}>{mapDisplayNames[selectedMap]}</h1>
                    <p className={`text-sm sm:text-base opacity-90 ${getThemeClasses({
                      light: 'text-slate-200',
                      dark: 'text-slate-300'
                    })}`}>{t('modal.performanceAnalysis')}</p>
                  </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {selectedMetric !== 'bank' && (
                    <div className={`backdrop-blur-md border rounded-full px-3 py-1.5 ${getThemeClasses({
                      light: 'bg-white/20 border-white/30',
                      dark: 'bg-white/10 border-white/20'
                    })}`}>
                      <span className={`text-xs sm:text-sm font-bold ${getThemeClasses({
                        light: 'text-slate-800',
                        dark: 'text-white'
                      })}`}>🏆 {mapStats.topRound}</span>
                    </div>
                  )}
                  <div className={`backdrop-blur-md border rounded-full px-3 py-1.5 ${getThemeClasses({
                    light: 'bg-white/20 border-white/30',
                    dark: 'bg-white/10 border-white/20'
                  })}`}>
                    <span className={`text-xs sm:text-sm font-bold ${getThemeClasses({
                      light: 'text-slate-800',
                      dark: 'text-white'
                    })}`}>
                      {selectedMetric === 'bank' ? '💰' : '🎮'} {selectedMetric === 'bank' ? (bankTransactions?.length || 0) : (matchHistory?.length || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal mejorado */}
        <div
          className={`p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-h-[70vh] overflow-y-auto ${getThemeClasses({
            light: 'scrollbar-thin scrollbar-thumb-slate-400/50 scrollbar-track-slate-200/20 hover:scrollbar-thumb-slate-500/70',
            dark: 'scrollbar-thin scrollbar-thumb-slate-600/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-500/70'
          })}`}
          style={{
            willChange: 'scroll-position',
            scrollBehavior: 'smooth'
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div
                  ref={spinnerRef}
                  className={`w-12 h-12 border-4 border-t-transparent rounded-full mx-auto mb-4 ${getThemeClasses({
                    light: 'border-indigo-400',
                    dark: 'border-indigo-500'
                  })}`}
                ></div>
                <p className={`font-medium ${getThemeClasses({
                  light: 'text-slate-600',
                  dark: 'text-slate-400'
                })}`}>{t('general.loading')}</p>
              </div>
            </div>
          ) : matchHistory.length === 0 ? (
            <div ref={contentRef} className="text-center py-20">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${getThemeClasses({
                light: 'bg-slate-200 text-slate-500',
                dark: 'bg-slate-700 text-slate-600'
              })}`}>
                <Activity className="w-8 h-8" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${getThemeClasses({
                light: 'text-slate-700',
                dark: 'text-slate-300'
              })}`}>{t('modal.noDataAvailable')}</h3>
              <p className={`text-sm ${getThemeClasses({
                light: 'text-slate-600',
                dark: 'text-slate-500'
              })}`}>{t('modal.noMatchesFound')}</p>
            </div>
          ) : (
            <>
              {/* Selector de métricas mejorado */}
              <div className={`backdrop-blur-sm border rounded-2xl p-4 sm:p-6 ${getThemeClasses({
                light: 'bg-gradient-to-br from-slate-100/60 to-slate-200/60 border-slate-300/60',
                dark: 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/60'
              })}`}>
                <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 ${getThemeClasses({
                  light: 'text-slate-900',
                  dark: 'text-white'
                })}`}>
                  <Activity className={`w-5 h-5 sm:w-6 sm:h-6 ${getThemeClasses({
                    light: 'text-indigo-600',
                    dark: 'text-indigo-400'
                  })}`} />
                  {t('modal.selectMetric')}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {METRICS_CONFIG.map((metric) => (
                    <button
                      key={metric.key}
                      onClick={() => handleMetricChange(metric.key)}
                      className={`group p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedMetric === metric.key
                          ? `border-[${metric.color}] ${getThemeClasses({
                              light: `bg-[${metric.color}]/15 shadow-lg shadow-[${metric.color}]/20 scale-105`,
                              dark: `bg-[${metric.color}]/15 shadow-lg shadow-[${metric.color}]/20 scale-105`
                            })}`
                          : getThemeClasses({
                              light: 'border-slate-400/50 bg-slate-100/40 hover:border-slate-300/70 hover:bg-slate-200/50 hover:scale-102',
                              dark: 'border-slate-600/50 bg-slate-700/40 hover:border-slate-500/70 hover:bg-slate-600/50 hover:scale-102'
                            })
                      } backdrop-blur-sm`}
                    >
                      <div className={`w-8 h-8 mx-auto mb-2 ${
                        selectedMetric === metric.key ? `text-[${metric.color}]` : getThemeClasses({
                          light: 'text-slate-500',
                          dark: 'text-slate-400'
                        })
                      }`}>
                        {metric.icon}
                      </div>
                      <p className={`text-sm font-bold text-center ${
                        selectedMetric === metric.key ? getThemeClasses({
                          light: 'text-slate-900',
                          dark: 'text-white'
                        }) : getThemeClasses({
                          light: 'text-slate-600',
                          dark: 'text-slate-300'
                        })
                      }`}>
                        {metric.label}
                      </p>
                      <p className={`text-xs text-center mt-1 ${getThemeClasses({
                        light: 'text-slate-600',
                        dark: 'text-slate-500'
                      })}`}>
                        {metric.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estadísticas de la métrica seleccionada - Diseño moderno */}
              {selectedMetric !== 'general' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className={`backdrop-blur-sm border rounded-2xl p-4 sm:p-6 text-center group border-[${currentMetricConfig.color}]/30 hover:border-[${currentMetricConfig.color}]/50 hover:shadow-xl hover:shadow-[${currentMetricConfig.color}]/10 transition-all duration-300 hover:-translate-y-1 ${getThemeClasses({
                  light: 'bg-gradient-to-br from-slate-100/80 to-slate-200/80',
                  dark: 'bg-gradient-to-br from-slate-800/80 to-slate-900/80'
                })}`}>
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-[${currentMetricConfig.color}]/20 flex items-center justify-center`}>
                    {React.cloneElement(currentMetricConfig.icon, { className: `w-6 h-6 text-[${currentMetricConfig.color}]` })}
                  </div>
                  <p className={`text-4xl font-black mb-2 text-[${currentMetricConfig.color}]`}>
                    {statsComparison && statsComparison[selectedMetric] ? (
                      selectedMetric === 'bank'
                        ? `$${(statsComparison[selectedMetric].best || 0).toLocaleString()}`
                        : statsComparison[selectedMetric].best || 0
                    ) : 0}
                  </p>
                  <p className={`text-sm uppercase tracking-wider ${getThemeClasses({
                    light: 'text-slate-600',
                    dark: 'text-slate-400'
                  })}`}>{t('modal.record')}</p>
                  <p className={`text-xs mt-1 ${getThemeClasses({
                    light: 'text-slate-700',
                    dark: 'text-slate-500'
                  })}`}>{t('modal.bestMatch')}</p>
                </div>

                <div className={`backdrop-blur-sm border rounded-2xl p-4 sm:p-6 text-center group ${getThemeClasses({
                  light: 'bg-gradient-to-br from-slate-100/80 to-slate-200/80 border-slate-300/40',
                  dark: 'bg-gradient-to-br from-slate-800/80 to-slate-900/80'
                })} border-[${currentMetricConfig.color}]/30 hover:border-[${currentMetricConfig.color}]/50 hover:shadow-xl hover:shadow-[${currentMetricConfig.color}]/10 transition-all duration-300 hover:-translate-y-1`}>
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-[${currentMetricConfig.color}]/20 flex items-center justify-center`}>
                    <Activity className={`w-6 h-6 text-[${currentMetricConfig.color}]`} />
                  </div>
                  <p className={`text-4xl font-black mb-2 text-[${currentMetricConfig.color}]`}>
                    {statsComparison && statsComparison[selectedMetric] ? (
                      selectedMetric === 'score'
                        ? Math.round(statsComparison[selectedMetric].average || 0).toLocaleString()
                        : selectedMetric === 'bank'
                        ? `$${Math.round(statsComparison[selectedMetric].average || 0).toLocaleString()}`
                        : (statsComparison[selectedMetric].average || 0).toFixed(1)
                    ) : '0'}
                  </p>
                  <p className={`text-sm uppercase tracking-wider ${getThemeClasses({
                    light: 'text-slate-600',
                    dark: 'text-slate-400'
                  })}`}>{t('modal.average')}</p>
                  <p className={`text-xs mt-1 ${getThemeClasses({
                    light: 'text-slate-700',
                    dark: 'text-slate-500'
                  })}`}>{selectedMetric === 'bank' ? t('modal.averageBalance') : t('modal.perMatch')}</p>
                </div>

                <div className={`backdrop-blur-sm border rounded-2xl p-4 sm:p-6 text-center group ${getThemeClasses({
                  light: 'bg-gradient-to-br from-slate-100/80 to-slate-200/80 border-slate-300/40',
                  dark: 'bg-gradient-to-br from-slate-800/80 to-slate-900/80'
                })} border-[${currentMetricConfig.color}]/30 hover:border-[${currentMetricConfig.color}]/50 hover:shadow-xl hover:shadow-[${currentMetricConfig.color}]/10 transition-all duration-300 hover:-translate-y-1`}>
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-[${currentMetricConfig.color}]/20 flex items-center justify-center`}>
                    <TrendingUp className={`w-6 h-6 text-[${currentMetricConfig.color}]`} />
                  </div>
                  <p className={`text-4xl font-black mb-2 text-[${currentMetricConfig.color}]`}>
                    {statsComparison && statsComparison[selectedMetric] ? (
                      selectedMetric === 'bank'
                        ? `$${(statsComparison[selectedMetric].worst || 0).toLocaleString()}`
                        : statsComparison[selectedMetric].worst || 0
                    ) : 0}
                  </p>
                  <p className={`text-sm uppercase tracking-wider ${getThemeClasses({
                    light: 'text-slate-600',
                    dark: 'text-slate-400'
                  })}`}>{t('modal.minimum')}</p>
                  <p className={`text-xs mt-1 ${getThemeClasses({
                    light: 'text-slate-700',
                    dark: 'text-slate-500'
                  })}`}>{selectedMetric === 'bank' ? t('modal.minimumBalance') : t('modal.improvementArea')}</p>
                </div>
              </div>
              )}

              {/* Gráfico de la métrica seleccionada - solo mostrar para métricas específicas */}
              {selectedMetric !== 'general' && (
                <div className="space-y-8">
                  <h2 className={`text-2xl font-black flex items-center gap-3 ${getThemeClasses({
                    light: 'text-slate-900',
                    dark: 'text-white'
                  })}`}>
                    <Activity className={`w-7 h-7 ${getThemeClasses({
                      light: 'text-indigo-600',
                      dark: 'text-indigo-400'
                    })}`} />
                    {t('modal.analysisOf')} {currentMetricConfig.label}
                  </h2>

                {/* Gráfico dinámico optimizado */}
                <div className={`backdrop-blur-sm border rounded-2xl p-6 ${getThemeClasses({
                  light: 'bg-gradient-to-br from-slate-100/60 to-slate-200/60 border-slate-300/60',
                  dark: 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50'
                })}`}>
                  <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 text-[${currentMetricConfig.color}]`}>
                    {React.cloneElement(currentMetricConfig.icon, { className: 'w-5 h-5' })}
                    {selectedMetric === 'bank' ? t('modal.balanceEvolution') : `${currentMetricConfig.label} ${t('modal.perMatch')}`}
                  </h3>
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id={`${selectedMetric}Gradient`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={currentMetricConfig.color} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={currentMetricConfig.color} stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="2 2"
                          stroke="#374151"
                          strokeOpacity={0.3}
                        />
                        <XAxis
                          dataKey="game"
                          stroke="#9ca3af"
                          fontSize={11}
                          tick={{ fill: '#9ca3af' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          fontSize={11}
                          tick={{ fill: '#9ca3af' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                            border: `1px solid ${theme === 'dark' ? '#374151' : '#d1d5db'}`,
                            borderRadius: '6px',
                            color: theme === 'dark' ? '#f3f4f6' : '#374151',
                            fontSize: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: any, name: any, props: any) => {
                            if (selectedMetric === 'bank') {
                              const data = props.payload;
                              const transactionType = data.type;
                              const prefix = (transactionType === 'deposit' || transactionType === 'deposit_from_player') ? '+' :
                                           (transactionType === 'withdraw' || transactionType === 'pay_to_player') ? '-' : '';
                              return [`${prefix}$${Number(value).toLocaleString()}`, 'Balance'];
                            }
                            return [
                              selectedMetric === 'score' ? Number(value).toLocaleString() : value,
                              currentMetricConfig.label
                            ];
                          }}
                          labelFormatter={(label: any, payload: any) => {
                            if (selectedMetric === 'bank' && payload && payload[0]) {
                              const data = payload[0].payload;
                              return `${label} - ${data.time}: ${data.description}`;
                            }
                            return label;
                          }}
                          labelStyle={{ color: '#9ca3af' }}
                        />
                        <Area
                          type="monotone"
                          dataKey={selectedMetric}
                          stroke={currentMetricConfig.color}
                          fillOpacity={1}
                          fill={`url(#${selectedMetric}Gradient)`}
                          strokeWidth={2}
                          dot={(props: any) => {
                            const { cx, cy, payload } = props;
                            if (!payload || selectedMetric !== 'bank') {
                              return <circle cx={cx} cy={cy} r={0} fill="transparent" />;
                            }

                            const color = payload.dotColor || currentMetricConfig.color;
                            return (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={4}
                                fill={color}
                                stroke="#1f2937"
                                strokeWidth={2}
                              />
                            );
                          }}
                          activeDot={(props: any) => {
                            const { cx, cy, payload } = props;
                            const color = payload?.dotColor || currentMetricConfig.color;
                            return (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={6}
                                fill={color}
                                stroke="#ffffff"
                                strokeWidth={2}
                              />
                            );
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Indicadores de colores para transacciones */}
                  {selectedMetric === 'bank' && (
                    <div className={`mt-4 p-4 rounded-lg ${getThemeClasses({
                      light: 'bg-slate-200/40',
                      dark: 'bg-slate-700/30'
                    })}`}>
                      <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-green-400"></div>
                          <span className={`font-medium text-sm ${getThemeClasses({
                            light: 'text-green-600',
                            dark: 'text-green-400'
                          })}`}>Depósitos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-red-400"></div>
                          <span className={`font-medium text-sm ${getThemeClasses({
                            light: 'text-red-600',
                            dark: 'text-red-400'
                          })}`}>Retiros</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 border-2 rounded-full ${getThemeClasses({
                            light: 'border-gray-500',
                            dark: 'border-gray-400'
                          })}`}></div>
                          <span className={`font-medium text-sm ${getThemeClasses({
                            light: 'text-gray-600',
                            dark: 'text-gray-400'
                          })}`}>Otros</span>
                        </div>
                      </div>
                      <p className={`text-center text-xs mt-2 ${getThemeClasses({
                        light: 'text-slate-600',
                        dark: 'text-slate-400'
                      })}`}>
                        {t('modal.dotsShowTransactionType')}
                      </p>
                    </div>
                  )}

                  {/* Tendencia para otras métricas */}
                  {statsComparison && selectedMetric !== 'bank' && (
                    <div className={`mt-4 p-4 rounded-lg ${getThemeClasses({
                      light: 'bg-slate-200/40',
                      dark: 'bg-slate-700/30'
                    })}`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${getThemeClasses({
                          light: 'text-slate-700',
                          dark: 'text-slate-300'
                        })}`}>{t('modal.trend')}:</span>
                        <div className="flex items-center gap-2">
                          {statsComparison[selectedMetric].trend === 'up' ? (
                            <>
                              <TrendingUp className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 font-medium">{t('modal.improving')}</span>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                              <span className="text-red-400 font-medium">{t('modal.worsening')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                </div>
              )}

              {/* Análisis detallado de la métrica */}
              {statsComparison && selectedMetric !== 'general' && (
                <div className={`backdrop-blur-sm border rounded-2xl p-6 ${getThemeClasses({
                  light: 'bg-gradient-to-br from-slate-100/60 to-slate-200/60 border-slate-300/60',
                  dark: 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50'
                })}`}>
                  <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 text-[${currentMetricConfig.color}]`}>
                    {React.cloneElement(currentMetricConfig.icon, { className: 'w-6 h-6' })}
                    {t('modal.detailedAnalysis')} {currentMetricConfig.label}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className={`backdrop-blur-sm border rounded-xl p-4 text-center ${getThemeClasses({
                      light: 'bg-gradient-to-br from-green-50/80 to-green-100/80 border-green-300/40',
                      dark: 'bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20'
                    })}`}>
                      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-green-400" />
                      </div>
                      <p className="text-2xl font-black text-green-400 mb-1">
                        {statsComparison && statsComparison[selectedMetric] ? (
                          selectedMetric === 'bank' ? `$${(statsComparison[selectedMetric].best || 0).toLocaleString()}` : (statsComparison[selectedMetric].best || 0)
                        ) : 0}
                      </p>
                      <p className={`text-xs uppercase tracking-wider ${getThemeClasses({
                        light: 'text-slate-600',
                        dark: 'text-slate-400'
                      })}`}>{t('modal.record')}</p>
                      <p className={`text-xs mt-1 ${getThemeClasses({
                        light: 'text-slate-700',
                        dark: 'text-slate-500'
                      })}`}>{selectedMetric === 'bank' ? t('modal.maximumBalance') : t('modal.bestMatch')}</p>
                    </div>

                    <div className={`backdrop-blur-sm border rounded-xl p-4 text-center ${getThemeClasses({
                      light: 'bg-gradient-to-br from-blue-50/80 to-blue-100/80 border-blue-300/40',
                      dark: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20'
                    })}`}>
                      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-blue-400" />
                      </div>
                      <p className="text-2xl font-black text-blue-400 mb-1">
                        {statsComparison && statsComparison[selectedMetric] ? (
                          selectedMetric === 'score'
                            ? Math.round(statsComparison[selectedMetric].average || 0).toLocaleString()
                            : selectedMetric === 'bank'
                            ? `$${Math.round(statsComparison[selectedMetric].average || 0).toLocaleString()}`
                            : (statsComparison[selectedMetric].average || 0).toFixed(1)
                        ) : '0'}
                      </p>
                      <p className={`text-xs uppercase tracking-wider ${getThemeClasses({
                        light: 'text-slate-600',
                        dark: 'text-slate-400'
                      })}`}>{t('modal.average')}</p>
                      <p className={`text-xs mt-1 ${getThemeClasses({
                        light: 'text-slate-700',
                        dark: 'text-slate-500'
                      })}`}>{selectedMetric === 'bank' ? t('modal.averageBalance') : t('modal.standard')}</p>
                    </div>

                    <div className={`backdrop-blur-sm border rounded-xl p-4 text-center ${getThemeClasses({
                      light: 'bg-gradient-to-br from-red-50/80 to-red-100/80 border-red-300/40',
                      dark: 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20'
                    })}`}>
                      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-500/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />
                      </div>
                      <p className="text-2xl font-black text-red-400 mb-1">
                        {statsComparison && statsComparison[selectedMetric] ? (
                          selectedMetric === 'bank' ? `$${(statsComparison[selectedMetric].worst || 0).toLocaleString()}` : (statsComparison[selectedMetric].worst || 0)
                        ) : 0}
                      </p>
                      <p className={`text-xs uppercase tracking-wider ${getThemeClasses({
                        light: 'text-slate-600',
                        dark: 'text-slate-400'
                      })}`}>{t('modal.minimum')}</p>
                      <p className={`text-xs mt-1 ${getThemeClasses({
                        light: 'text-slate-700',
                        dark: 'text-slate-500'
                      })}`}>{selectedMetric === 'bank' ? t('modal.minimumBalance') : t('modal.improvementArea')}</p>
                    </div>

                    <div className={`backdrop-blur-sm border rounded-xl p-4 text-center border-[${currentMetricConfig.color}]/20 ${getThemeClasses({
                      light: 'bg-gradient-to-br from-slate-50/80 to-slate-100/80',
                      dark: 'bg-gradient-to-br'
                    })}`}>
                      <div className={`w-10 h-10 mx-auto mb-3 rounded-full bg-[${currentMetricConfig.color}]/20 flex items-center justify-center`}>
                        {statsComparison && statsComparison[selectedMetric] && statsComparison[selectedMetric].trend === 'up' ? (
                          <TrendingUp className={`w-5 h-5 text-green-400`} />
                        ) : (
                          <TrendingUp className={`w-5 h-5 text-red-400 rotate-180`} />
                        )}
                      </div>
                      <p className={`text-2xl font-black mb-1 ${
                        statsComparison && statsComparison[selectedMetric] && statsComparison[selectedMetric].trend === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {statsComparison && statsComparison[selectedMetric] && statsComparison[selectedMetric].trend === 'up' ? '↗' : '↘'}
                      </p>
                      <p className={`text-xs uppercase tracking-wider ${getThemeClasses({
                        light: 'text-slate-600',
                        dark: 'text-slate-400'
                      })}`}>{t('modal.trend')}</p>
                      <p className={`text-xs mt-1 ${
                        statsComparison && statsComparison[selectedMetric] && statsComparison[selectedMetric].trend === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {statsComparison && statsComparison[selectedMetric] && statsComparison[selectedMetric].trend === 'up' ? t('modal.improving') : t('modal.worsening')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabla de historial (partidas o transacciones bancarias) */}
              <div className={`backdrop-blur-sm border rounded-2xl p-6 ${getThemeClasses({
                light: 'bg-gradient-to-br from-slate-100/60 to-slate-200/60 border-slate-300/60',
                dark: 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50'
              })}`}>
                <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${getThemeClasses({
                  light: 'text-slate-900',
                  dark: 'text-white'
                })}`}>
                  <Calendar className={`w-6 h-6 ${getThemeClasses({
                    light: 'text-green-600',
                    dark: 'text-green-400'
                  })}`} />
                  {selectedMetric === 'bank' ? t('modal.transactionHistory') : t('modal.matchHistory')} {currentMetricConfig.label}
                </h3>

                <div className={`overflow-x-auto ${getThemeClasses({
                  light: 'scrollbar-thin scrollbar-thumb-slate-400/50 scrollbar-track-slate-200/20',
                  dark: 'scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800'
                })}`}>
                  <table className="w-full text-sm">
                    <thead className={`sticky top-0 backdrop-blur-sm ${getThemeClasses({
                      light: 'bg-slate-200/90',
                      dark: 'bg-slate-800/90'
                    })}`}>
                      <tr className={`border-b ${getThemeClasses({
                        light: 'border-slate-300',
                        dark: 'border-slate-700'
                      })}`}>
                        {selectedMetric === 'bank' ? (
                          <>
                            <th className={`text-left py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-slate-700',
                              dark: 'text-slate-300'
                            })}`}>{t('modal.transaction')}</th>
                            <th className={`text-center py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-slate-700',
                              dark: 'text-slate-300'
                            })}`}>Tiempo</th>
                            <th className={`text-center py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-slate-700',
                              dark: 'text-slate-300'
                            })}`}>Tipo</th>
                            <th className={`text-center py-3 px-4 font-semibold text-[${currentMetricConfig.color}]`}>
                              Balance ⭐
                            </th>
                            <th className={`text-center py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-slate-700',
                              dark: 'text-slate-300'
                            })}`}>Monto</th>
                            <th className={`text-center py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-slate-700',
                              dark: 'text-slate-300'
                            })}`}>Descripción</th>
                          </>
                        ) : selectedMetric === 'general' ? (
                          <>
                            <th className={`text-left py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-slate-700',
                              dark: 'text-slate-300'
                            })}`}>{t('modal.matchNumber')}</th>
                            <th className={`text-center py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-slate-700',
                              dark: 'text-slate-300'
                            })}`}>Ronda</th>
                            <th className={`text-center py-3 px-4 font-semibold text-[${METRICS_CONFIG.find(m => m.key === 'kills')?.color}]`}>
                              Kills ⭐
                            </th>
                            <th className={`text-center py-3 px-4 font-semibold text-[${METRICS_CONFIG.find(m => m.key === 'downs')?.color}]`}>
                              Downs ⭐
                            </th>
                            <th className={`text-center py-3 px-4 font-semibold text-[${METRICS_CONFIG.find(m => m.key === 'headshots')?.color}]`}>
                              Headshots ⭐
                            </th>
                            <th className={`text-center py-3 px-4 font-semibold text-[${METRICS_CONFIG.find(m => m.key === 'revives')?.color}]`}>
                              Revives ⭐
                            </th>
                            <th className={`text-center py-3 px-4 font-semibold text-[${METRICS_CONFIG.find(m => m.key === 'score')?.color}]`}>
                              Score ⭐
                            </th>
                          </>
                        ) : (
                          <>
                            <th className={`text-left py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-slate-700',
                              dark: 'text-slate-300'
                            })}`}>{t('modal.matchNumber')}</th>
                            <th className={`text-center py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-slate-700',
                              dark: 'text-slate-300'
                            })}`}>Ronda</th>
                            <th className={`text-center py-3 px-4 font-semibold text-[${currentMetricConfig.color}]`}>
                              {currentMetricConfig.label} ⭐
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMetric === 'bank'
                        ? bankTransactions.slice(0, 10).map((item, index) => {
                            const bankValue = item.balanceAfter || 0;
                            const isBestBalance = statsComparison && bankValue === statsComparison[selectedMetric].best;
                            const isWorstBalance = statsComparison && bankValue === statsComparison[selectedMetric].worst;

                            return (
                              <tr
                                key={`bank-${item.id}`}
                                className={`border-b ${getThemeClasses({
                                  light: 'border-slate-300/50 hover:bg-slate-200/20',
                                  dark: 'border-slate-700/50 hover:bg-slate-700/20'
                                })} ${isBestBalance ? 'bg-green-500/10' : isWorstBalance ? 'bg-red-500/10' : ''}`}
                              >
                                <td className={`py-3 px-4 font-medium ${getThemeClasses({
                                  light: 'text-slate-900',
                                  dark: 'text-white'
                                })}`}>#{item.number}</td>
                                <td className={`py-3 px-4 text-center font-semibold capitalize ${getThemeClasses({
                                  light: 'text-indigo-600',
                                  dark: 'text-indigo-400'
                                })}`}>
                                  {item.type === 'deposit' ? t('modal.deposit') :
                                   item.type === 'withdraw' ? t('modal.withdraw') :
                                   item.type === 'deposit_from_player' ? t('modal.received') : t('modal.sent')}
                                </td>
                                <td className={`py-3 px-4 text-center font-bold text-[${currentMetricConfig.color}] ${
                                  isBestBalance ? 'text-green-400' : isWorstBalance ? 'text-red-400' : ''
                                }`}>
                                  ${bankValue.toLocaleString()}
                                  {isBestBalance && ' 🏆'}
                                  {isWorstBalance && ' ⚠️'}
                                </td>
                                <td className={`py-3 px-4 text-center font-semibold ${getThemeClasses({
                                  light: 'text-yellow-600',
                                  dark: 'text-yellow-400'
                                })}`}>
                                  {item.type === 'deposit' || item.type === 'deposit_from_player' ? '+' : '-'}${item.amount}
                                </td>
                                <td className={`py-3 px-4 text-center text-xs max-w-xs truncate ${getThemeClasses({
                                  light: 'text-slate-700',
                                  dark: 'text-slate-300'
                                })}`} title={item.description}>
                                  {item.description}
                                </td>
                              </tr>
                            );
                          })
                        : matchHistory.slice(-10).reverse().map((item, index) => {
                            if (selectedMetric === 'general') {
                              // Para vista general, mostrar todas las estadísticas
                              return (
                                <tr
                                  key={`${item.fileName}-${index}`}
                                  className={`border-b ${getThemeClasses({
                                    light: 'border-slate-300/50 hover:bg-slate-200/20',
                                    dark: 'border-slate-700/50 hover:bg-slate-700/20'
                                  })}`}
                                >
                                  <td className={`py-3 px-4 font-medium ${getThemeClasses({
                                    light: 'text-slate-900',
                                    dark: 'text-white'
                                  })}`}>{`${t('modal.matchNumber')} ${matchHistory.length - index}`}</td>
                                  <td className={`py-3 px-4 text-center font-semibold ${getThemeClasses({
                                    light: 'text-indigo-600',
                                    dark: 'text-indigo-400'
                                  })}`}>{item.round || 1}</td>
                                  <td className={`py-3 px-4 text-center font-bold text-[${METRICS_CONFIG.find(m => m.key === 'kills')?.color}] ${
                                    statsComparison && (item.kills || 0) === statsComparison.kills.best ? 'text-green-400' :
                                    statsComparison && (item.kills || 0) === statsComparison.kills.worst ? 'text-red-400' : ''
                                  }`}>
                                    {item.kills || 0}
                                    {statsComparison && (item.kills || 0) === statsComparison.kills.best && ' 🏆'}
                                    {statsComparison && (item.kills || 0) === statsComparison.kills.worst && ' ⚠️'}
                                  </td>
                                  <td className={`py-3 px-4 text-center font-bold text-[${METRICS_CONFIG.find(m => m.key === 'downs')?.color}] ${
                                    statsComparison && (item.downs || 0) === statsComparison.downs.best ? 'text-green-400' :
                                    statsComparison && (item.downs || 0) === statsComparison.downs.worst ? 'text-red-400' : ''
                                  }`}>
                                    {item.downs || 0}
                                    {statsComparison && (item.downs || 0) === statsComparison.downs.best && ' 🏆'}
                                    {statsComparison && (item.downs || 0) === statsComparison.downs.worst && ' ⚠️'}
                                  </td>
                                  <td className={`py-3 px-4 text-center font-bold text-[${METRICS_CONFIG.find(m => m.key === 'headshots')?.color}] ${
                                    statsComparison && (item.headshots || 0) === statsComparison.headshots.best ? 'text-green-400' :
                                    statsComparison && (item.headshots || 0) === statsComparison.headshots.worst ? 'text-red-400' : ''
                                  }`}>
                                    {item.headshots || 0}
                                    {statsComparison && (item.headshots || 0) === statsComparison.headshots.best && ' 🏆'}
                                    {statsComparison && (item.headshots || 0) === statsComparison.headshots.worst && ' ⚠️'}
                                  </td>
                                  <td className={`py-3 px-4 text-center font-bold text-[${METRICS_CONFIG.find(m => m.key === 'revives')?.color}] ${
                                    statsComparison && (item.revives || 0) === statsComparison.revives.best ? 'text-green-400' :
                                    statsComparison && (item.revives || 0) === statsComparison.revives.worst ? 'text-red-400' : ''
                                  }`}>
                                    {item.revives || 0}
                                    {statsComparison && (item.revives || 0) === statsComparison.revives.best && ' 🏆'}
                                    {statsComparison && (item.revives || 0) === statsComparison.revives.worst && ' ⚠️'}
                                  </td>
                                  <td className={`py-3 px-4 text-center font-bold text-[${METRICS_CONFIG.find(m => m.key === 'score')?.color}] ${
                                    statsComparison && (item.score || 0) === statsComparison.score.best ? 'text-green-400' :
                                    statsComparison && (item.score || 0) === statsComparison.score.worst ? 'text-red-400' : ''
                                  }`}>
                                    {(item.score || 0).toLocaleString()}
                                    {statsComparison && (item.score || 0) === statsComparison.score.best && ' 🏆'}
                                    {statsComparison && (item.score || 0) === statsComparison.score.worst && ' ⚠️'}
                                  </td>
                                </tr>
                              );
                            } else {
                              // Para métricas específicas, mostrar solo 3 columnas
                              const metricValue = item[selectedMetric as keyof typeof item] as number;
                              const isBestMatch = statsComparison && metricValue === statsComparison[selectedMetric].best;
                              const isWorstMatch = statsComparison && metricValue === statsComparison[selectedMetric].worst;

                              return (
                                <tr
                                  key={`${item.fileName}-${index}`}
                                  className={`border-b ${getThemeClasses({
                                    light: 'border-slate-300/50 hover:bg-slate-200/20',
                                    dark: 'border-slate-700/50 hover:bg-slate-700/20'
                                  })} ${isBestMatch ? 'bg-green-500/10' : isWorstMatch ? 'bg-red-500/10' : ''}`}
                                >
                                  <td className={`py-3 px-4 font-medium ${getThemeClasses({
                                    light: 'text-slate-900',
                                    dark: 'text-white'
                                  })}`}>{`${t('modal.matchNumber')} ${matchHistory.length - index}`}</td>
                                  <td className={`py-3 px-4 text-center font-semibold ${getThemeClasses({
                                    light: 'text-indigo-600',
                                    dark: 'text-indigo-400'
                                  })}`}>{item.round || 1}</td>
                                  <td className={`py-3 px-4 text-center font-bold text-[${currentMetricConfig.color}] ${
                                    isBestMatch ? 'text-green-400' : isWorstMatch ? 'text-red-400' : ''
                                  }`}>
                                    {selectedMetric === 'score' ? (metricValue || 0).toLocaleString() : (metricValue || 0)}
                                    {isBestMatch && ' 🏆'}
                                    {isWorstMatch && ' ⚠️'}
                                  </td>
                                </tr>
                              );
                            }
                          })
                      }
                    </tbody>
                  </table>
                </div>

                <div className={`mt-4 flex justify-center gap-4 text-xs ${getThemeClasses({
                  light: 'text-slate-600',
                  dark: 'text-slate-400'
                })}`}>
                  {selectedMetric === 'bank' ? (
                    <>
                      <span className="text-green-400">{t('modal.greenDots')}</span>
                      <span className="text-red-400">{t('modal.redDots')}</span>
                      <span className={`text-[${currentMetricConfig.color}]`}>{t('modal.areaBalance')}</span>
                    </>
                  ) : (
                    <>
                      <span>🏆 {t('modal.recordMark')}</span>
                      <span>⚠️ {t('modal.worstPerformance')}</span>
                      <span className={`text-[${currentMetricConfig.color}]`}>⭐ {t('modal.selectedMetric')}</span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default MapModal;