import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MAP_BANNERS, MAP_NAME_TO_CODE } from '../constants';
import { TrendingUp, Target, Skull, Heart, Award, Activity, Calendar, Trophy, X, BarChart3, Zap } from 'lucide-react';
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

  const gsap = useGSAP();
  const modalRef = useRef<HTMLDivElement>(null);
  const hasAnimatedModal = useRef(false);

  const getThemeClasses = (classes: { light: string; dark: string }) => {
    return theme === 'dark' ? classes.dark : classes.light;
  };

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
      color: '#eab308',
      icon: <Award className="w-5 h-5" />,
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
  }, []);

  useEffect(() => {
    if (isOpen && modalRef.current && !hasAnimatedModal.current) {
      gsap.animateModalIn(modalRef.current);
      hasAnimatedModal.current = true;
    }
    if (!isOpen) {
      hasAnimatedModal.current = false;
    }
  }, [isOpen, gsap]);

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
        console.warn('API not available, using limited frontend method');
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
          dotColor: (transaction.type === 'deposit' || transaction.type === 'deposit_from_player') ? '#10b981' :
                   (transaction.type === 'withdraw' || transaction.type === 'pay_to_player') ? '#ef4444' : '#6b7280'
        };
      });
    } else {
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

  const currentMetricConfig = useMemo(() =>
    METRICS_CONFIG.find(m => m.key === selectedMetric)!,
    [selectedMetric]
  );

  const statsComparison = useMemo(() => {
    if (chartData.length === 0 && selectedMetric !== 'general') return null;
    if (matchHistory.length === 0 && selectedMetric === 'general') return null;

    const result: Record<MetricType, any> = {} as Record<MetricType, any>;

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

  if (!isOpen || !selectedMap) return null;

  const mapCode = MAP_NAME_TO_CODE[selectedMap] || selectedMap;
  const mapBanner = MAP_BANNERS[mapCode] || null;
  const safeMapBanner = mapBanner && mapBanner.trim() !== '' ? mapBanner : null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${getThemeClasses({
        light: 'bg-black/75 backdrop-blur-xl',
        dark: 'bg-black/85 backdrop-blur-xl'
      })}`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-3xl shadow-2xl border ${getThemeClasses({
          light: 'bg-white/95 border-slate-200/60',
          dark: 'bg-slate-900/95 border-slate-700/60'
        })} backdrop-blur-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div className="relative">
          <div className={`relative h-56 lg:h-64 overflow-hidden ${getThemeClasses({
            light: 'rounded-t-3xl',
            dark: 'rounded-t-3xl'
          })}`}>
            {safeMapBanner ? (
              <img
                src={safeMapBanner}
                alt={`${mapDisplayNames[selectedMap]} banner`}
                className={`w-full h-full object-cover ${getThemeClasses({
                  light: 'brightness-105 contrast-110',
                  dark: 'brightness-110 contrast-105'
                })}`}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${getThemeClasses({
                light: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
                dark: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600'
              })}`}>
                <div className="text-center text-white">
                  <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Trophy className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold">{mapDisplayNames[selectedMap]}</h3>
                </div>
              </div>
            )}

            {}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 via-70% to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 via-transparent to-purple-900/40"></div>

            {}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 rounded-full p-3 bg-black/30 hover:bg-black/50 text-white border border-white/20 hover:border-white/40 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>

            {}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white mb-1 drop-shadow-2xl">
                      {mapDisplayNames[selectedMap]}
                    </h1>
                    <p className="text-white/90 text-lg opacity-95 drop-shadow-lg">
                      {t('modal.performanceAnalysis')}
                    </p>
                  </div>
                </div>

                {}
                <div className="flex items-center gap-3">
                  {selectedMetric !== 'bank' && (
                    <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
                      <span className="text-white font-bold text-sm">🏆 {mapStats.topRound}</span>
                    </div>
                  )}
                  <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
                    <span className="text-white font-bold text-sm">
                      {selectedMetric === 'bank' ? '💰' : '🎮'} {(selectedMetric === 'bank' ? bankTransactions : matchHistory)?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-500/70">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-6 animate-spin"></div>
                <p className={`text-lg font-medium ${getThemeClasses({
                  light: 'text-slate-600',
                  dark: 'text-slate-400'
                })}`}>{t('general.loading')}</p>
              </div>
            </div>
          ) : matchHistory.length === 0 && selectedMetric !== 'bank' ? (
            <div className="text-center py-20">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${getThemeClasses({
                light: 'bg-slate-200 text-slate-500',
                dark: 'bg-slate-700 text-slate-600'
              })}`}>
                <Activity className="w-10 h-10" />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${getThemeClasses({
                light: 'text-slate-700',
                dark: 'text-slate-300'
              })}`}>{t('modal.noDataAvailable')}</h3>
              <p className={`text-lg ${getThemeClasses({
                light: 'text-slate-600',
                dark: 'text-slate-500'
              })}`}>{t('modal.noMatchesFound')}</p>
            </div>
          ) : (
            <>
              {}
              <div className={`backdrop-blur-xl border rounded-3xl p-8 ${getThemeClasses({
                light: 'bg-gradient-to-br from-white/80 to-slate-50/80 border-slate-200/50 shadow-xl',
                dark: 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 shadow-2xl'
              })}`}>
                <h3 className={`text-2xl font-bold mb-8 flex items-center gap-3 ${getThemeClasses({
                  light: 'text-slate-900',
                  dark: 'text-white'
                })}`}>
                  <Activity className={`w-7 h-7 ${getThemeClasses({
                    light: 'text-indigo-600',
                    dark: 'text-indigo-400'
                  })}`} />
                  {t('modal.selectMetric')}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                  {METRICS_CONFIG.map((metric) => (
                    <button
                      key={metric.key}
                      onClick={() => handleMetricChange(metric.key)}
                      className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                        selectedMetric === metric.key
                          ? `border-[${metric.color}] shadow-2xl shadow-[${metric.color}]/25 scale-105`
                          : getThemeClasses({
                              light: 'border-slate-200/60 bg-white/60 hover:border-slate-300/80 hover:bg-white/80 hover:scale-102 hover:shadow-lg',
                              dark: 'border-slate-600/60 bg-slate-700/60 hover:border-slate-500/80 hover:bg-slate-600/80 hover:scale-102 hover:shadow-xl'
                            })
                      } backdrop-blur-sm`}
                    >
                      {}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        selectedMetric === metric.key ? 'opacity-100' : ''
                      }`}>
                        <div className={`absolute inset-0 bg-gradient-to-br from-[${metric.color}]/10 to-[${metric.color}]/5`}></div>
                        <div className={`absolute inset-0 bg-[${metric.color}]/5 animate-pulse`}></div>
                      </div>

                      <div className={`relative w-10 h-10 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                        selectedMetric === metric.key
                          ? `bg-[${metric.color}] shadow-lg`
                          : `bg-[${metric.color}]/20 group-hover:bg-[${metric.color}]/30`
                      } transition-all duration-300`}>
                        <div className={selectedMetric === metric.key ? 'text-white' : `text-[${metric.color}]`}>
                          {metric.icon}
                        </div>
                      </div>

                      <p className={`relative text-lg font-bold text-center mb-2 ${
                        selectedMetric === metric.key ? getThemeClasses({
                          light: 'text-slate-900',
                          dark: 'text-white'
                        }) : getThemeClasses({
                          light: 'text-slate-700',
                          dark: 'text-slate-300'
                        })
                      }`}>
                        {metric.label}
                      </p>

                      <p className={`relative text-sm text-center leading-tight ${getThemeClasses({
                        light: 'text-slate-600',
                        dark: 'text-slate-400'
                      })}`}>
                        {metric.description}
                      </p>

                      {}
                      {selectedMetric === metric.key && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <div className={`w-3 h-3 rounded-full bg-[${metric.color}]`}></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {}
              {selectedMetric !== 'general' && statsComparison && (
                <div className="flex justify-center">
                  <div className={`relative backdrop-blur-xl border-2 rounded-3xl p-8 text-center group overflow-hidden ${
                    getThemeClasses({
                      light: 'bg-gradient-to-br from-white/90 to-slate-50/90 border-slate-200/60 shadow-2xl',
                      dark: 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/60 shadow-2xl'
                    })
                  } border-[${currentMetricConfig.color}]/50 hover:shadow-[${currentMetricConfig.color}]/20 transition-all duration-500 hover:-translate-y-2 w-full max-w-md`}>

                    {}
                    <div className={`absolute inset-0 bg-gradient-to-br from-[${currentMetricConfig.color}]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                    {}
                    <div className={`relative w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[${currentMetricConfig.color}]/20 to-[${currentMetricConfig.color}]/10 flex items-center justify-center shadow-xl border border-[${currentMetricConfig.color}]/30`}>
                      <div className={`text-[${currentMetricConfig.color}]`}>
                        {React.cloneElement(currentMetricConfig.icon, { className: 'w-10 h-10' })}
                      </div>
                    </div>

                    {}
                    <p className={`relative text-6xl font-black mb-4 text-[${currentMetricConfig.color}] drop-shadow-sm`}>
                      {selectedMetric === 'bank'
                        ? `$${(statsComparison[selectedMetric].best || 0).toLocaleString()}`
                        : (statsComparison[selectedMetric].best || 0)
                      }
                    </p>

                    {}
                    <p className={`relative text-lg uppercase tracking-wider font-bold mb-3 ${getThemeClasses({
                      light: 'text-slate-600',
                      dark: 'text-slate-400'
                    })}`}>
                      {t('modal.record')}
                    </p>

                    {}
                    <p className={`relative text-base ${getThemeClasses({
                      light: 'text-slate-700',
                      dark: 'text-slate-500'
                    })}`}>
                      {selectedMetric === 'bank' ? t('modal.maximumBalance') : t('modal.bestMatch')}
                    </p>

                    {}
                    <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                      <Trophy className={`w-8 h-8 text-[${currentMetricConfig.color}]`} />
                    </div>
                  </div>
                </div>
              )}

              {}
              {selectedMetric !== 'general' && chartData.length > 0 && (
                <div className={`backdrop-blur-xl border rounded-3xl p-8 ${getThemeClasses({
                  light: 'bg-gradient-to-br from-white/80 to-slate-50/80 border-slate-200/50 shadow-xl',
                  dark: 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 shadow-2xl'
                })}`}>
                  <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 text-[${currentMetricConfig.color}]`}>
                    <TrendingUp className="w-7 h-7" />
                    {selectedMetric === 'bank' ? t('modal.balanceEvolution') : `${currentMetricConfig.label} ${t('modal.perMatch')}`}
                  </h3>

                  <div className="relative">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id={`${selectedMetric}Gradient`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={currentMetricConfig.color} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={currentMetricConfig.color} stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#374151"
                          strokeOpacity={0.2}
                        />

                        <XAxis
                          dataKey="game"
                          stroke="#6b7280"
                          fontSize={12}
                          tick={{ fill: '#6b7280' }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          stroke="#6b7280"
                          fontSize={12}
                          tick={{ fill: '#6b7280' }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                            border: `2px solid ${currentMetricConfig.color}`,
                            borderRadius: '12px',
                            color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
                            fontSize: '14px',
                            boxShadow: `0 10px 25px -5px ${currentMetricConfig.color}20`,
                            backdropFilter: 'blur(8px)'
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
                        />

                        <Area
                          type="monotone"
                          dataKey={selectedMetric}
                          stroke={currentMetricConfig.color}
                          strokeWidth={3}
                          fill={`url(#${selectedMetric}Gradient)`}
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
                                r={5}
                                fill={color}
                                stroke="#1e293b"
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
                                r={8}
                                fill={color}
                                stroke="#ffffff"
                                strokeWidth={3}
                              />
                            );
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {}
                  {selectedMetric === 'bank' && (
                    <div className="mt-6 p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center justify-center gap-8">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-green-400 shadow-sm"></div>
                          <span className="font-semibold text-green-600 dark:text-green-400">Depósitos</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-red-400 shadow-sm"></div>
                          <span className="font-semibold text-red-600 dark:text-red-400">Retiros</span>
                        </div>
                      </div>
                      <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-3">
                        {t('modal.dotsShowTransactionType')}
                      </p>
                    </div>
                  )}

                  {}
                  {statsComparison && selectedMetric !== 'bank' && (
                    <div className={`mt-6 p-6 rounded-2xl border ${getThemeClasses({
                      light: 'bg-slate-50/50 border-slate-200/50',
                      dark: 'bg-slate-800/30 border-slate-700/50'
                    })}`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-lg ${getThemeClasses({
                          light: 'text-slate-700',
                          dark: 'text-slate-300'
                        })}`}>{t('modal.trend')}:</span>
                        <div className="flex items-center gap-3">
                          {statsComparison[selectedMetric].trend === 'up' ? (
                            <>
                              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-500/30">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                                <span className="text-green-600 dark:text-green-400 font-semibold">{t('modal.improving')}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full border border-red-500/30">
                                <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />
                                <span className="text-red-600 dark:text-red-400 font-semibold">{t('modal.worsening')}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {}
              {(matchHistory.length > 0 || bankTransactions.length > 0) && (
                <div className={`backdrop-blur-xl border rounded-3xl p-8 ${getThemeClasses({
                  light: 'bg-gradient-to-br from-white/80 to-slate-50/80 border-slate-200/50 shadow-xl',
                  dark: 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 shadow-2xl'
                })}`}>
                  <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${getThemeClasses({
                    light: 'text-slate-900',
                    dark: 'text-white'
                  })}`}>
                    <Calendar className={`w-7 h-7 ${getThemeClasses({
                      light: 'text-green-600',
                      dark: 'text-green-400'
                    })}`} />
                    {selectedMetric === 'bank' ? t('modal.transactionHistory') : t('modal.matchHistory')} {currentMetricConfig.label}
                  </h3>

                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-400/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-500/70">
                    <table className="w-full text-sm">
                      <thead className={`sticky top-0 ${getThemeClasses({
                        light: 'bg-slate-100/80 backdrop-blur-sm',
                        dark: 'bg-slate-800/80 backdrop-blur-sm'
                      })}`}>
                        <tr className={`border-b ${getThemeClasses({
                          light: 'border-slate-300',
                          dark: 'border-slate-700'
                        })}`}>
                          {selectedMetric === 'bank' ? (
                            <>
                              <th className={`text-left py-4 px-6 font-bold ${getThemeClasses({
                                light: 'text-slate-700',
                                dark: 'text-slate-300'
                              })}`}>#</th>
                              <th className={`text-center py-4 px-6 font-bold ${getThemeClasses({
                                light: 'text-slate-700',
                                dark: 'text-slate-300'
                              })}`}>Tipo</th>
                              <th className={`text-center py-4 px-6 font-bold text-[${currentMetricConfig.color}]`}>
                                Balance ⭐
                              </th>
                              <th className={`text-center py-4 px-6 font-bold ${getThemeClasses({
                                light: 'text-slate-700',
                                dark: 'text-slate-300'
                              })}`}>Monto</th>
                              <th className={`text-left py-4 px-6 font-bold ${getThemeClasses({
                                light: 'text-slate-700',
                                dark: 'text-slate-300'
                              })}`}>Descripción</th>
                            </>
                          ) : selectedMetric === 'general' ? (
                            <>
                              <th className={`text-left py-4 px-6 font-bold ${getThemeClasses({
                                light: 'text-slate-700',
                                dark: 'text-slate-300'
                              })}`}>Partida</th>
                              <th className={`text-center py-4 px-6 font-bold ${getThemeClasses({
                                light: 'text-slate-700',
                                dark: 'text-slate-300'
                              })}`}>Ronda</th>
                              <th className={`text-center py-4 px-6 font-bold text-red-500`}>Kills ⭐</th>
                              <th className={`text-center py-4 px-6 font-bold text-orange-500`}>Downs ⭐</th>
                              <th className={`text-center py-4 px-6 font-bold text-purple-500`}>Headshots ⭐</th>
                              <th className={`text-center py-4 px-6 font-bold text-green-500`}>Revives ⭐</th>
                              <th className={`text-center py-4 px-6 font-bold text-yellow-500`}>Score ⭐</th>
                            </>
                          ) : (
                            <>
                              <th className={`text-left py-4 px-6 font-bold ${getThemeClasses({
                                light: 'text-slate-700',
                                dark: 'text-slate-300'
                              })}`}>Partida</th>
                              <th className={`text-center py-4 px-6 font-bold ${getThemeClasses({
                                light: 'text-slate-700',
                                dark: 'text-slate-300'
                              })}`}>Ronda</th>
                              <th className={`text-center py-4 px-6 font-bold text-[${currentMetricConfig.color}]`}>
                                {currentMetricConfig.label} ⭐
                              </th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedMetric === 'bank'
                          ? bankTransactions.slice(0, 8).map((item, index) => {
                              const bankValue = item.balanceAfter || 0;
                              const isBestBalance = statsComparison && bankValue === statsComparison[selectedMetric].best;

                              return (
                                <tr
                                  key={`bank-${item.id || index}`}
                                  className={`border-b transition-colors ${getThemeClasses({
                                    light: 'border-slate-200/50 hover:bg-slate-50/50',
                                    dark: 'border-slate-700/50 hover:bg-slate-700/20'
                                  })} ${isBestBalance ? 'bg-green-500/10' : ''}`}
                                >
                                  <td className={`py-4 px-6 font-semibold ${getThemeClasses({
                                    light: 'text-slate-900',
                                    dark: 'text-white'
                                  })}`}>#{item.number || (bankTransactions.length - index)}</td>
                                  <td className={`py-4 px-6 text-center`}>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      item.type === 'deposit' || item.type === 'deposit_from_player'
                                        ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                                        : 'bg-red-500/20 text-red-600 dark:text-red-400'
                                    }`}>
                                      {item.type === 'deposit' ? 'Depósito' :
                                       item.type === 'withdraw' ? 'Retiro' :
                                       item.type === 'deposit_from_player' ? 'Recibido' : 'Enviado'}
                                    </span>
                                  </td>
                                  <td className={`py-4 px-6 text-center font-bold text-[${currentMetricConfig.color}] ${
                                    isBestBalance ? 'text-green-400' : ''
                                  }`}>
                                    ${bankValue.toLocaleString()}
                                    {isBestBalance && ' 🏆'}
                                  </td>
                                  <td className={`py-4 px-6 text-center font-semibold ${getThemeClasses({
                                    light: 'text-yellow-600',
                                    dark: 'text-yellow-400'
                                  })}`}>
                                    {item.type === 'deposit' || item.type === 'deposit_from_player' ? '+' : '-'}${item.amount}
                                  </td>
                                  <td className={`py-4 px-6 text-left text-sm max-w-xs truncate ${getThemeClasses({
                                    light: 'text-slate-700',
                                    dark: 'text-slate-300'
                                  })}`} title={item.description}>
                                    {item.description}
                                  </td>
                                </tr>
                              );
                            })
                          : matchHistory.slice(-8).reverse().map((item, index) => {
                              if (selectedMetric === 'general') {
                                return (
                                  <tr
                                    key={`${item.fileName}-${index}`}
                                    className={`border-b transition-colors ${getThemeClasses({
                                      light: 'border-slate-200/50 hover:bg-slate-50/50',
                                      dark: 'border-slate-700/50 hover:bg-slate-700/20'
                                    })}`}
                                  >
                                    <td className={`py-4 px-6 font-semibold ${getThemeClasses({
                                      light: 'text-slate-900',
                                      dark: 'text-white'
                                    })}`}>{`${t('modal.matchNumber')} ${matchHistory.length - index}`}</td>
                                    <td className={`py-4 px-6 text-center font-semibold ${getThemeClasses({
                                      light: 'text-indigo-600',
                                      dark: 'text-indigo-400'
                                    })}`}>{item.round || 1}</td>
                                    <td className={`py-4 px-6 text-center font-bold text-red-500 ${
                                      statsComparison && (item.kills || 0) === statsComparison.kills.best ? 'text-green-400' :
                                      statsComparison && (item.kills || 0) === statsComparison.kills.worst ? 'text-red-400' : ''
                                    }`}>
                                      {item.kills || 0}
                                      {statsComparison && (item.kills || 0) === statsComparison.kills.best && ' 🏆'}
                                    </td>
                                    <td className={`py-4 px-6 text-center font-bold text-orange-500 ${
                                      statsComparison && (item.downs || 0) === statsComparison.downs.best ? 'text-green-400' :
                                      statsComparison && (item.downs || 0) === statsComparison.downs.worst ? 'text-red-400' : ''
                                    }`}>
                                      {item.downs || 0}
                                      {statsComparison && (item.downs || 0) === statsComparison.downs.best && ' 🏆'}
                                    </td>
                                    <td className={`py-4 px-6 text-center font-bold text-purple-500 ${
                                      statsComparison && (item.headshots || 0) === statsComparison.headshots.best ? 'text-green-400' :
                                      statsComparison && (item.headshots || 0) === statsComparison.headshots.worst ? 'text-red-400' : ''
                                    }`}>
                                      {item.headshots || 0}
                                      {statsComparison && (item.headshots || 0) === statsComparison.headshots.best && ' 🏆'}
                                    </td>
                                    <td className={`py-4 px-6 text-center font-bold text-green-500 ${
                                      statsComparison && (item.revives || 0) === statsComparison.revives.best ? 'text-green-400' :
                                      statsComparison && (item.revives || 0) === statsComparison.revives.worst ? 'text-red-400' : ''
                                    }`}>
                                      {item.revives || 0}
                                      {statsComparison && (item.revives || 0) === statsComparison.revives.best && ' 🏆'}
                                    </td>
                                    <td className={`py-4 px-6 text-center font-bold text-yellow-500 ${
                                      statsComparison && (item.score || 0) === statsComparison.score.best ? 'text-green-400' :
                                      statsComparison && (item.score || 0) === statsComparison.score.worst ? 'text-red-400' : ''
                                    }`}>
                                      {(item.score || 0).toLocaleString()}
                                      {statsComparison && (item.score || 0) === statsComparison.score.best && ' 🏆'}
                                    </td>
                                  </tr>
                                );
                              } else {
                                const metricValue = item[selectedMetric as keyof typeof item] as number;
                                const isBestMatch = statsComparison && metricValue === statsComparison[selectedMetric].best;

                                return (
                                  <tr
                                    key={`${item.fileName}-${index}`}
                                    className={`border-b transition-colors ${getThemeClasses({
                                      light: 'border-slate-200/50 hover:bg-slate-50/50',
                                      dark: 'border-slate-700/50 hover:bg-slate-700/20'
                                    })} ${isBestMatch ? 'bg-green-500/10' : ''}`}
                                  >
                                    <td className={`py-4 px-6 font-semibold ${getThemeClasses({
                                      light: 'text-slate-900',
                                      dark: 'text-white'
                                    })}`}>{`${t('modal.matchNumber')} ${matchHistory.length - index}`}</td>
                                    <td className={`py-4 px-6 text-center font-semibold ${getThemeClasses({
                                      light: 'text-indigo-600',
                                      dark: 'text-indigo-400'
                                    })}`}>{item.round || 1}</td>
                                    <td className={`py-4 px-6 text-center font-bold text-[${currentMetricConfig.color}] ${
                                      isBestMatch ? 'text-green-400' : ''
                                    }`}>
                                      {selectedMetric === 'score' ? (metricValue || 0).toLocaleString() : (metricValue || 0)}
                                      {isBestMatch && ' 🏆'}
                                    </td>
                                  </tr>
                                );
                              }
                            })
                        }
                      </tbody>
                    </table>
                  </div>

                  {}
                  <div className="mt-6 flex justify-center gap-6 text-sm">
                    {selectedMetric === 'bank' ? (
                      <>
                        <span className="flex items-center gap-2">
                          <span className="text-green-400">🏆</span>
                          <span className={getThemeClasses({
                            light: 'text-slate-600',
                            dark: 'text-slate-400'
                          })}>Balance máximo</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-2">
                          <span className="text-green-400">🏆</span>
                          <span className={getThemeClasses({
                            light: 'text-slate-600',
                            dark: 'text-slate-400'
                          })}>{t('modal.recordMark')}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="text-red-400">⚠️</span>
                          <span className={getThemeClasses({
                            light: 'text-slate-600',
                            dark: 'text-slate-400'
                          })}>{t('modal.worstPerformance')}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default MapModal;