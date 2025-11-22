import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MAP_BANNERS, MAP_NAME_TO_CODE } from '../constants';
import { Target, Skull, Heart, Award, Activity, Calendar, X, BarChart3, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

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

// Smart data sampling for large datasets
const downsampleData = (data: any[], maxPoints: number = 300) => {
  if (data.length <= maxPoints) return data;

  const step = Math.floor(data.length / maxPoints);
  const sampled = [];

  // Always include first point
  sampled.push(data[0]);

  // Sample intermediate points
  for (let i = step; i < data.length - step; i += step) {
    sampled.push(data[i]);
  }

  // Always include last point
  if (sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled.push(data[data.length - 1]);
  }

  return sampled;
};

const MapModal: React.FC<MapModalProps> = React.memo(({ isOpen, onClose, selectedMap, mapDisplayNames, playerData }) => {
  const [matchHistory, setMatchHistory] = useState<MatchData[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('general');
  const [tablePage, setTablePage] = useState(0);
  const { t } = useLanguage();
  const { theme } = useTheme();

  const ITEMS_PER_PAGE = 25;

  const getThemeClasses = useCallback((classes: { light: string; dark: string }) => {
    return theme === 'dark' ? classes.dark : classes.light;
  }, [theme]);

  const METRICS_CONFIG: MetricConfig[] = useMemo(() => [
    {
      key: 'general',
      label: t('stats.general'),
      color: '#6366f1',
      icon: <BarChart3 className="w-5 h-5" />,
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
      icon: <Award className="w-5 h-5" />,
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
      color: '#eab308',
      icon: <Activity className="w-5 h-5" />,
      description: t('metric.score.desc')
    },
    {
      key: 'bank',
      label: t('stats.bank'),
      color: '#f59e0b',
      icon: <Zap className="w-5 h-5" />,
      description: t('metric.bank.desc')
    }
  ], [t]);

  const handleMetricChange = useCallback((metric: MetricType) => {
    setSelectedMetric(metric);
    setTablePage(0); // Reset to first page
  }, []);

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
      const currentPlayerGuid = playerData?.guid;
      if (!currentPlayerGuid) return;

      try {
        const response = await fetch(`/api/bank-transactions/${currentPlayerGuid}`);
        if (response.ok) {
          const transactions = await response.json();
          setBankTransactions(transactions);
          return;
        }
      } catch (apiError) {
        console.warn('API not available, using local data');
      }

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
      setBankTransactions([]);
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

  const chartData = useMemo(() => {
    if (selectedMetric === 'bank') {
      const rawData = bankTransactions
        .slice()
        .sort((a, b) => a.timestamp - b.timestamp);

      return downsampleData(rawData.map((transaction, index) => {
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
          dotColor: (transaction.type === 'deposit' || transaction.type === 'deposit_from_player') ? '#10b981' :
                   (transaction.type === 'withdraw' || transaction.type === 'pay_to_player') ? '#ef4444' : '#6b7280'
        };
      }));
    } else {
      const rawData = matchHistory
        .slice()
        .reverse();

      return downsampleData(rawData.map((match, index) => ({
        game: `${t('modal.matchNumber')} ${index + 1}`,
        kills: match.kills,
        downs: match.downs,
        score: match.score,
        headshots: match.headshots,
        revives: match.revives,
        round: match.round,
        date: new Date(match.timestamp).toLocaleDateString()
      })));
    }
  }, [matchHistory, bankTransactions, selectedMetric, t]);

  const currentMetricConfig = useMemo(() =>
    METRICS_CONFIG.find(m => m.key === selectedMetric)!,
    [selectedMetric]
  );

  const statsComparison = useMemo(() => {
    if (chartData.length === 0 && selectedMetric !== 'general') return null;
    if (matchHistory.length === 0 && selectedMetric === 'general') return null;

    const result: Record<string, any> = {};

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
      METRICS_CONFIG.forEach(metric => {
        if (metric.key === 'bank') {
          const bankData = chartData.map(d => d.bank as number).filter(val => !isNaN(val));
          if (bankData.length > 0) {
            const initialBalance = bankData[0];
            const finalBalance = bankData[bankData.length - 1];
            result['bank'] = {
              best: Math.max(...bankData),
              worst: Math.min(...bankData),
              average: bankData.reduce((a, b) => a + b, 0) / bankData.length,
              trend: finalBalance > initialBalance ? 'up' : finalBalance < initialBalance ? 'down' : 'stable'
            };
          } else {
            result['bank'] = {
              best: playerData?.economy?.balance || 0,
              worst: 0,
              average: playerData?.economy?.balance || 0,
              trend: 'stable'
            };
          }
        } else {
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

  const getComparisonClass = useCallback((value: number, metric: string) => {
    if (!statsComparison || !statsComparison[metric]) return '';
    return value === statsComparison[metric].best ? 'text-green-400' :
           value === statsComparison[metric].worst ? 'text-red-400' : '';
  }, [statsComparison]);

  const getComparisonEmoji = useCallback((value: number, metric: string) => {
    if (!statsComparison || !statsComparison[metric]) return '';
    return value === statsComparison[metric].best ? ' 🏆' : '';
  }, [statsComparison]);

  // Pagination data
  const paginatedTableData = useMemo(() => {
    const data = selectedMetric === 'bank' ? bankTransactions : matchHistory;
    const startIndex = tablePage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  }, [selectedMetric, bankTransactions, matchHistory, tablePage]);

  const totalPages = Math.ceil((selectedMetric === 'bank' ? bankTransactions.length : matchHistory.length) / ITEMS_PER_PAGE);

  if (!isOpen || !selectedMap) return null;

  const mapCode = MAP_NAME_TO_CODE[selectedMap] || selectedMap;
  const mapBanner = MAP_BANNERS[mapCode] || null;
  const safeMapBanner = mapBanner && mapBanner.trim() !== '' ? mapBanner : null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200 ${getThemeClasses({
        light: 'bg-black/90 backdrop-blur-xl',
        dark: 'bg-black/95 backdrop-blur-xl'
      })}`}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-7xl max-h-[95vh] overflow-hidden rounded-2xl shadow-2xl border ${getThemeClasses({
          light: 'bg-white border-gray-200',
          dark: 'bg-gray-900 border-gray-700'
        })}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Map Banner */}
        <div className="relative">
          <div className={`relative h-48 lg:h-56 overflow-hidden rounded-t-2xl ${getThemeClasses({
            light: '',
            dark: ''
          })}`}>
            {safeMapBanner ? (
              <img
                src={safeMapBanner}
                alt={`${mapDisplayNames[selectedMap]} banner`}
                className={`w-full h-full object-cover ${getThemeClasses({
                  light: 'brightness-105',
                  dark: 'brightness-110'
                })}`}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${getThemeClasses({
                light: 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500',
                dark: 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'
              })}`}>
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold">{mapDisplayNames[selectedMap]}</h3>
                </div>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-2 bg-black/30 hover:bg-black/50 text-white border border-white/20 hover:border-white/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title and Stats */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                    {mapDisplayNames[selectedMap]}
                  </h1>
                  <p className="text-white/80 text-sm">
                    {t('modal.performanceAnalysis')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedMetric !== 'bank' && (
                    <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1">
                      <span className="text-white font-semibold text-sm">🏆 {mapStats.topRound}</span>
                    </div>
                  )}
                  <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1">
                    <span className="text-white font-semibold text-sm">
                      📊 {(selectedMetric === 'bank' ? bankTransactions : matchHistory)?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className={`text-lg font-medium ${getThemeClasses({
                  light: 'text-gray-600',
                  dark: 'text-gray-400'
                })}`}>{t('general.loading')}</p>
              </div>
            </div>
          ) : matchHistory.length === 0 && bankTransactions.length === 0 ? (
            /* No Data Message - Only show this when no data */
            <div className="text-center py-12">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${getThemeClasses({
                light: 'bg-gray-200 text-gray-500',
                dark: 'bg-gray-700 text-gray-600'
              })}`}>
                <Activity className="w-8 h-8" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${getThemeClasses({
                light: 'text-gray-700',
                dark: 'text-gray-300'
              })}`}>{t('modal.noDataAvailable')}</h3>
              <p className={`text-sm ${getThemeClasses({
                light: 'text-gray-600',
                dark: 'text-gray-500'
              })}`}>{t('modal.noMatchesFound')}</p>
            </div>
          ) : (
            /* Data Available - Show all sections */
            <>
              {/* Metrics Selector */}
              <div className={`rounded-xl p-6 border ${getThemeClasses({
                light: 'bg-gray-50 border-gray-200',
                dark: 'bg-gray-800 border-gray-700'
              })}`}>
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-3 ${getThemeClasses({
                  light: 'text-gray-900',
                  dark: 'text-white'
                })}`}>
                  <Activity className="w-6 h-6 text-blue-500" />
                  {t('modal.selectMetric')}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                  {METRICS_CONFIG.map((metric) => (
                    <button
                      key={metric.key}
                      onClick={() => handleMetricChange(metric.key)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedMetric === metric.key
                          ? `border-[${metric.color}] bg-[${metric.color}]/10 shadow-lg`
                          : getThemeClasses({
                              light: 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                              dark: 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
                            })
                      }`}
                    >
                      <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                        selectedMetric === metric.key
                          ? `bg-[${metric.color}] text-white`
                          : `bg-[${metric.color}]/20 text-[${metric.color}]`
                      }`}>
                        {metric.icon}
                      </div>

                      <p className={`text-sm font-semibold text-center ${
                        selectedMetric === metric.key ? getThemeClasses({
                          light: 'text-gray-900',
                          dark: 'text-white'
                        }) : getThemeClasses({
                          light: 'text-gray-700',
                          dark: 'text-gray-300'
                        })
                      }`}>
                        {metric.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Comparison */}
              {selectedMetric !== 'general' && statsComparison && (
                <div className="flex justify-center">
                  <div className={`rounded-xl p-6 text-center border ${getThemeClasses({
                    light: 'bg-white border-gray-200 shadow-lg',
                    dark: 'bg-gray-800 border-gray-700 shadow-xl'
                  })}`}>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[${currentMetricConfig.color}]/20 to-[${currentMetricConfig.color}]/10 flex items-center justify-center`}>
                      <div className={`text-[${currentMetricConfig.color}] text-2xl`}>
                        {React.cloneElement(currentMetricConfig.icon, { className: 'w-8 h-8' })}
                      </div>
                    </div>

                    <p className={`text-4xl font-black mb-2 text-[${currentMetricConfig.color}]`}>
                      {selectedMetric === 'bank'
                        ? `$${(statsComparison[selectedMetric].best || 0).toLocaleString()}`
                        : (statsComparison[selectedMetric].best || 0)
                      }
                    </p>

                    <p className={`text-sm font-semibold uppercase tracking-wide mb-4 ${getThemeClasses({
                      light: 'text-gray-600',
                      dark: 'text-gray-400'
                    })}`}>
                      {t('modal.record')}
                    </p>

                    <p className={`text-sm ${getThemeClasses({
                      light: 'text-gray-700',
                      dark: 'text-gray-300'
                    })}`}>
                      {selectedMetric === 'bank' ? t('modal.maximumBalance') : t('modal.bestMatch')}
                    </p>
                  </div>
                </div>
              )}

              {/* Chart */}
              {selectedMetric !== 'general' && chartData.length > 0 && (
                <div className={`rounded-xl p-6 border ${getThemeClasses({
                  light: 'bg-white border-gray-200 shadow-lg',
                  dark: 'bg-gray-800 border-gray-700 shadow-xl'
                })}`}>
                  <h3 className={`text-xl font-bold mb-4 flex items-center gap-3 text-[${currentMetricConfig.color}]`}>
                    <Activity className="w-6 h-6" />
                    {selectedMetric === 'bank' ? t('modal.balanceEvolution') : `${currentMetricConfig.label} ${t('modal.perMatch')}`}
                  </h3>

                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <defs>
                          <linearGradient id={`${selectedMetric}Gradient`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={currentMetricConfig.color} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={currentMetricConfig.color} stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
                        <XAxis dataKey="game" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                            border: `2px solid ${currentMetricConfig.color}`,
                            borderRadius: '8px',
                            fontSize: '14px'
                          }}
                          formatter={(value: any) => {
                            if (selectedMetric === 'bank') {
                              const data = chartData.find(d => d.bank === value);
                              const transactionType = data?.type;
                              const prefix = (transactionType === 'deposit' || transactionType === 'deposit_from_player') ? '+' :
                                           (transactionType === 'withdraw' || transactionType === 'pay_to_player') ? '-' : '';
                              return [`${prefix}$${Number(value).toLocaleString()}`, 'Balance'];
                            }
                            return [selectedMetric === 'score' ? Number(value).toLocaleString() : value, currentMetricConfig.label];
                          }}
                          labelFormatter={(label: any) => label}
                        />

                        <Area
                          type="monotone"
                          dataKey={selectedMetric}
                          stroke={currentMetricConfig.color}
                          strokeWidth={2}
                          fill={`url(#${selectedMetric}Gradient)`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className={`rounded-xl p-6 border ${getThemeClasses({
                light: 'bg-white border-gray-200 shadow-lg',
                dark: 'bg-gray-800 border-gray-700 shadow-xl'
              })}`}>
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-3 ${getThemeClasses({
                  light: 'text-gray-900',
                  dark: 'text-white'
                })}`}>
                  <Calendar className="w-6 h-6 text-green-500" />
                  {selectedMetric === 'bank' ? t('modal.transactionHistory') : t('modal.matchHistory')} {currentMetricConfig.label}
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={getThemeClasses({
                      light: 'bg-gray-50',
                      dark: 'bg-gray-700'
                    })}>
                      <tr className={getThemeClasses({
                        light: 'border-gray-200',
                        dark: 'border-gray-600'
                      })}>
                        {selectedMetric === 'bank' ? (
                          <>
                            <th className={`text-left py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-gray-700',
                              dark: 'text-gray-300'
                            })}`}>#</th>
                            <th className={`text-center py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-gray-700',
                              dark: 'text-gray-300'
                            })}`}>Tipo</th>
                            <th className={`text-center py-3 px-4 font-semibold text-[${currentMetricConfig.color}]`}>
                              Balance
                            </th>
                            <th className={`text-center py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-gray-700',
                              dark: 'text-gray-300'
                            })}`}>Monto</th>
                            <th className={`text-left py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-gray-700',
                              dark: 'text-gray-300'
                            })}`}>Descripción</th>
                          </>
                        ) : selectedMetric === 'general' ? (
                          <>
                            <th className={`text-left py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-gray-700',
                              dark: 'text-gray-300'
                            })}`}>Partida</th>
                            <th className={`text-center py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-gray-700',
                              dark: 'text-gray-300'
                            })}`}>Ronda</th>
                            <th className="text-center py-3 px-4 font-semibold text-red-500">Kills</th>
                            <th className="text-center py-3 px-4 font-semibold text-orange-500">Downs</th>
                            <th className="text-center py-3 px-4 font-semibold text-purple-500">Headshots</th>
                            <th className="text-center py-3 px-4 font-semibold text-green-500">Revives</th>
                            <th className="text-center py-3 px-4 font-semibold text-yellow-500">Score</th>
                          </>
                        ) : (
                          <>
                            <th className={`text-left py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-gray-700',
                              dark: 'text-gray-300'
                            })}`}>Partida</th>
                            <th className={`text-center py-3 px-4 font-semibold ${getThemeClasses({
                              light: 'text-gray-700',
                              dark: 'text-gray-300'
                            })}`}>Ronda</th>
                            <th className={`text-center py-3 px-4 font-semibold text-[${currentMetricConfig.color}]`}>
                              {currentMetricConfig.label}
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMetric === 'bank'
                        ? paginatedTableData.map((item: any, index: number) => {
                            const globalIndex = tablePage * ITEMS_PER_PAGE + index;
                            return (
                              <tr key={`bank-${item.id || globalIndex}`} className={getThemeClasses({
                                light: 'border-gray-100 hover:bg-gray-50',
                                dark: 'border-gray-700 hover:bg-gray-800'
                              })}>
                                <td className={`py-3 px-4 font-semibold ${getThemeClasses({
                                  light: 'text-gray-900',
                                  dark: 'text-white'
                                })}`}>#{globalIndex + 1}</td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    item.type === 'deposit' || item.type === 'deposit_from_player'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                    {item.type === 'deposit' ? t('modal.deposit') :
                                     item.type === 'withdraw' ? t('modal.withdraw') :
                                     item.type === 'deposit_from_player' ? t('modal.received') : t('modal.sent')}
                                  </span>
                                </td>
                                <td className={`py-3 px-4 text-center font-bold text-[${currentMetricConfig.color}]`}>
                                  ${item.balanceAfter?.toLocaleString()}
                                </td>
                                <td className={`py-3 px-4 text-center font-semibold ${getThemeClasses({
                                  light: 'text-yellow-600',
                                  dark: 'text-yellow-400'
                                })}`}>
                                  {item.type === 'deposit' || item.type === 'deposit_from_player' ? '+' : '-'}${item.amount}
                                </td>
                                <td className={`py-3 px-4 text-left text-sm ${getThemeClasses({
                                  light: 'text-gray-700',
                                  dark: 'text-gray-300'
                                })}`}>
                                  {item.description}
                                </td>
                              </tr>
                            );
                          })
                        : paginatedTableData.map((item: any, index: number) => {
                            const globalIndex = tablePage * ITEMS_PER_PAGE + index;
                            if (selectedMetric === 'general') {
                              return (
                                <tr key={`match-${item.fileName}-${globalIndex}`} className={getThemeClasses({
                                  light: 'border-gray-100 hover:bg-gray-50',
                                  dark: 'border-gray-700 hover:bg-gray-800'
                                })}>
                                  <td className={`py-3 px-4 font-semibold ${getThemeClasses({
                                    light: 'text-gray-900',
                                    dark: 'text-white'
                                  })}`}>{`${t('modal.matchNumber')} ${globalIndex + 1}`}</td>
                                  <td className={`py-3 px-4 text-center font-semibold ${getThemeClasses({
                                    light: 'text-blue-600',
                                    dark: 'text-blue-400'
                                  })}`}>{item.round || 1}</td>
                                  <td className={`py-3 px-4 text-center font-bold text-red-500 ${getComparisonClass(item.kills || 0, 'kills')}`}>
                                    {item.kills || 0}{getComparisonEmoji(item.kills || 0, 'kills')}
                                  </td>
                                  <td className={`py-3 px-4 text-center font-bold text-orange-500 ${getComparisonClass(item.downs || 0, 'downs')}`}>
                                    {item.downs || 0}{getComparisonEmoji(item.downs || 0, 'downs')}
                                  </td>
                                  <td className={`py-3 px-4 text-center font-bold text-purple-500 ${getComparisonClass(item.headshots || 0, 'headshots')}`}>
                                    {item.headshots || 0}{getComparisonEmoji(item.headshots || 0, 'headshots')}
                                  </td>
                                  <td className={`py-3 px-4 text-center font-bold text-green-500 ${getComparisonClass(item.revives || 0, 'revives')}`}>
                                    {item.revives || 0}{getComparisonEmoji(item.revives || 0, 'revives')}
                                  </td>
                                  <td className={`py-3 px-4 text-center font-bold text-yellow-500 ${getComparisonClass(item.score || 0, 'score')}`}>
                                    {(item.score || 0).toLocaleString()}{getComparisonEmoji(item.score || 0, 'score')}
                                  </td>
                                </tr>
                              );
                            } else {
                              const metricValue = item[selectedMetric] || 0;
                              return (
                                <tr key={`match-${item.fileName}-${globalIndex}`} className={getThemeClasses({
                                  light: 'border-gray-100 hover:bg-gray-50',
                                  dark: 'border-gray-700 hover:bg-gray-800'
                                })}>
                                  <td className={`py-3 px-4 font-semibold ${getThemeClasses({
                                    light: 'text-gray-900',
                                    dark: 'text-white'
                                  })}`}>{`${t('modal.matchNumber')} ${globalIndex + 1}`}</td>
                                  <td className={`py-3 px-4 text-center font-semibold ${getThemeClasses({
                                    light: 'text-blue-600',
                                    dark: 'text-blue-400'
                                  })}`}>{item.round || 1}</td>
                                  <td className={`py-3 px-4 text-center font-bold text-[${currentMetricConfig.color}] ${getComparisonClass(metricValue, selectedMetric)}`}>
                                    {selectedMetric === 'score' ? metricValue.toLocaleString() : metricValue}{getComparisonEmoji(metricValue, selectedMetric)}
                                  </td>
                                </tr>
                              );
                            }
                          })
                      }
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      onClick={() => setTablePage(Math.max(0, tablePage - 1))}
                      disabled={tablePage === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        tablePage === 0
                          ? 'opacity-50 cursor-not-allowed'
                          : getThemeClasses({
                              light: 'hover:bg-gray-100 text-gray-700',
                              dark: 'hover:bg-gray-700 text-gray-300'
                            })
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>

                    <span className={`font-medium ${getThemeClasses({
                      light: 'text-gray-700',
                      dark: 'text-gray-300'
                    })}`}>
                      Página {tablePage + 1} de {totalPages}
                    </span>

                    <button
                      onClick={() => setTablePage(Math.min(totalPages - 1, tablePage + 1))}
                      disabled={tablePage === totalPages - 1}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        tablePage === totalPages - 1
                          ? 'opacity-50 cursor-not-allowed'
                          : getThemeClasses({
                              light: 'hover:bg-gray-100 text-gray-700',
                              dark: 'hover:bg-gray-700 text-gray-300'
                            })
                      }`}
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default MapModal;