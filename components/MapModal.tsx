import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MAP_BANNERS, MAP_NAME_TO_CODE } from '../constants';
import { TrendingUp, Target, Skull, Heart, Award, Activity, Calendar, Trophy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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

type MetricType = 'kills' | 'downs' | 'score' | 'revives' | 'headshots' | 'bank';

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
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('kills');
  const { t } = useLanguage();

  // Configuración de métricas con traducciones
  const METRICS_CONFIG: MetricConfig[] = useMemo(() => [
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
        game: `Partida ${index + 1}`,
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
    if (chartData.length === 0) return null;

    const result: Record<MetricType, any> = {} as Record<MetricType, any>;

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
        const data = chartData.map(d => d[metric.key as keyof typeof d] as number);
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

    return result;
  }, [chartData, playerData?.economy?.balance]);

  if (!isOpen || !selectedMap) return null;

  const mapCode = MAP_NAME_TO_CODE[selectedMap] || selectedMap;
  const mapBanner = MAP_BANNERS[mapCode] || null;

  // Asegurarse de que mapBanner nunca sea una cadena vacía
  const safeMapBanner = mapBanner && mapBanner.trim() !== '' ? mapBanner : null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header con banner */}
        <div className="relative">
          <div className="relative h-64 overflow-hidden rounded-t-3xl">
            {safeMapBanner ? (
              <img
                src={safeMapBanner}
                alt={`${mapDisplayNames[selectedMap]} banner`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold">{mapDisplayNames[selectedMap]}</h3>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 via-transparent to-purple-900/30"></div>

            <button
              onClick={onClose}
              className="absolute top-6 right-6 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-white mb-1">{mapDisplayNames[selectedMap]}</h1>
                  <p className="text-slate-300 text-lg">{t('modal.performanceAnalysis')}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                {selectedMetric !== 'bank' && (
                  <span className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 px-4 py-2 rounded-full font-bold border border-indigo-500/30">
                    🏆 Top Round: {mapStats.topRound}
                  </span>
                )}
                <span className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 px-4 py-2 rounded-full font-bold border border-green-500/30">
                  {selectedMetric === 'bank' ? '💰' : '🎮'} {selectedMetric === 'bank' ? (bankTransactions?.length || 0) : (matchHistory?.length || 0)} {selectedMetric === 'bank' ? t('modal.transactionsAnalyzed') : t('modal.matchesAnalyzed')}
                </span>
                {selectedMetric !== 'bank' && (
                  <span className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-300 px-4 py-2 rounded-full font-bold border border-orange-500/30">
                    📅 {t('modal.lastPlayed')}: {mapStats.lastPlayed}
                  </span>
                )}
                {selectedMetric === 'bank' && bankTransactions && bankTransactions.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {/* Resumen de depósitos y retiros recientes */}
                    <div className="flex gap-2">
                      {(() => {
                        const recentDeposits = bankTransactions
                          .filter(t => t && (t.type === 'deposit' || t.type === 'deposit_from_player'))
                          .slice(0, 3);
                        const recentWithdrawals = bankTransactions
                          .filter(t => t && (t.type === 'withdraw' || t.type === 'pay_to_player'))
                          .slice(0, 3);

                        return (
                          <>
                            {recentDeposits.length > 0 && (
                              <span className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-bold border border-green-500/30">
                                🟢 +${recentDeposits.reduce((sum, t) => sum + (t.amount || 0), 0)}
                              </span>
                            )}
                            {recentWithdrawals.length > 0 && (
                              <span className="bg-gradient-to-r from-red-600/30 to-red-700/30 text-red-100 px-4 py-2 rounded-full text-sm font-black border-2 border-red-500 shadow-lg shadow-red-500/20 animate-pulse">
                                🔴 RETIRO -${recentWithdrawals.reduce((sum, t) => sum + (t.amount || 0), 0)}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    {/* Balance actual */}
                    {playerData?.economy?.balance !== undefined && typeof playerData.economy.balance === 'number' && (
                      <span className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 px-4 py-2 rounded-full font-bold border border-yellow-500/30">
                        💵 Balance actual: ${playerData.economy.balance.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
              </div>

        {/* Contenido principal */}
        <div
          className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
          style={{
            willChange: 'scroll-position',
            scrollBehavior: 'smooth'
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">{t('general.loading')}</p>
              </div>
            </div>
          ) : matchHistory.length === 0 ? (
            <div className="text-center py-20">
              <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-300 mb-2">{t('modal.noDataAvailable')}</h3>
              <p className="text-slate-500">{t('modal.noMatchesFound')}</p>
            </div>
          ) : (
            <>
              {/* Selector de métricas */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-indigo-400" />
                  {t('modal.selectMetric')}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {METRICS_CONFIG.map((metric) => (
                    <button
                      key={metric.key}
                      onClick={() => setSelectedMetric(metric.key)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedMetric === metric.key
                          ? `border-[${metric.color}] bg-[${metric.color}]/10 shadow-md`
                          : `border-slate-600/50 bg-slate-700/30 hover:border-slate-500/50 hover:bg-slate-600/30`
                      }`}
                    >
                      <div className={`w-8 h-8 mx-auto mb-2 ${
                        selectedMetric === metric.key ? `text-[${metric.color}]` : 'text-slate-400'
                      }`}>
                        {metric.icon}
                      </div>
                      <p className={`text-sm font-bold text-center ${
                        selectedMetric === metric.key ? 'text-white' : 'text-slate-300'
                      }`}>
                        {metric.label}
                      </p>
                      <p className="text-xs text-slate-500 text-center mt-1">
                        {metric.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estadísticas de la métrica seleccionada */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`bg-gradient-to-br border rounded-2xl p-6 text-center group transition-all duration-200 border-[${currentMetricConfig.color}]/20 hover:border-[${currentMetricConfig.color}]/40 hover:shadow-lg`}
                     style={{ willChange: 'transform' }}>
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
                  <p className="text-sm text-slate-400 uppercase tracking-wider">{t('modal.record')}</p>
                  <p className="text-xs text-slate-500 mt-1">{t('modal.bestMatch')}</p>
                </div>

                <div className={`bg-gradient-to-br border rounded-2xl p-6 text-center group transition-all border-[${currentMetricConfig.color}]/20 hover:border-[${currentMetricConfig.color}]/40`}>
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
                  <p className="text-sm text-slate-400 uppercase tracking-wider">{t('modal.average')}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedMetric === 'bank' ? t('modal.averageBalance') : t('modal.perMatch')}</p>
                </div>

                <div className={`bg-gradient-to-br border rounded-2xl p-6 text-center group transition-all border-[${currentMetricConfig.color}]/20 hover:border-[${currentMetricConfig.color}]/40`}>
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
                  <p className="text-sm text-slate-400 uppercase tracking-wider">{t('modal.minimum')}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedMetric === 'bank' ? t('modal.minimumBalance') : t('modal.improvementArea')}</p>
                </div>
              </div>

              {/* Gráfico de la métrica seleccionada */}
              <div className="space-y-8">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <Activity className="w-7 h-7 text-indigo-400" />
                  {t('modal.analysisOf')} {currentMetricConfig.label}
                </h2>

                {/* Gráfico dinámico optimizado */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
                  <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 text-[${currentMetricConfig.color}]`}>
                    {React.cloneElement(currentMetricConfig.icon, { className: 'w-5 h-5' })}
                    {selectedMetric === 'bank' ? 'Evolución del Balance Bancario' : `${currentMetricConfig.label} por Partida`}
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
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '6px',
                            color: '#f3f4f6',
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
                    <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-green-400"></div>
                          <span className="text-green-400 font-medium text-sm">Depósitos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-red-400"></div>
                          <span className="text-red-400 font-medium text-sm">Retiros</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
                          <span className="text-gray-400 font-medium text-sm">Otros</span>
                        </div>
                      </div>
                      <p className="text-center text-slate-400 text-xs mt-2">
                        {t('modal.dotsShowTransactionType')}
                      </p>
                    </div>
                  )}

                  {/* Tendencia para otras métricas */}
                  {statsComparison && selectedMetric !== 'bank' && (
                    <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">{t('modal.trend')}:</span>
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

              {/* Análisis detallado de la métrica */}
              {statsComparison && (
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
                  <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 text-[${currentMetricConfig.color}]`}>
                    {React.cloneElement(currentMetricConfig.icon, { className: 'w-6 h-6' })}
                    {t('modal.detailedAnalysis')} {currentMetricConfig.label}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-green-400" />
                      </div>
                      <p className="text-2xl font-black text-green-400 mb-1">
                        {statsComparison && statsComparison[selectedMetric] ? (
                          selectedMetric === 'bank' ? `$${(statsComparison[selectedMetric].best || 0).toLocaleString()}` : (statsComparison[selectedMetric].best || 0)
                        ) : 0}
                      </p>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">{t('modal.record')}</p>
                      <p className="text-xs text-slate-500 mt-1">{selectedMetric === 'bank' ? t('modal.maximumBalance') : t('modal.bestMatch')}</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4 text-center">
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
                      <p className="text-xs text-slate-400 uppercase tracking-wider">{t('modal.average')}</p>
                      <p className="text-xs text-slate-500 mt-1">{selectedMetric === 'bank' ? t('modal.averageBalance') : t('modal.standard')}</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-500/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />
                      </div>
                      <p className="text-2xl font-black text-red-400 mb-1">
                        {statsComparison && statsComparison[selectedMetric] ? (
                          selectedMetric === 'bank' ? `$${(statsComparison[selectedMetric].worst || 0).toLocaleString()}` : (statsComparison[selectedMetric].worst || 0)
                        ) : 0}
                      </p>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">{t('modal.minimum')}</p>
                      <p className="text-xs text-slate-500 mt-1">{selectedMetric === 'bank' ? t('modal.minimumBalance') : t('modal.improvementArea')}</p>
                    </div>

                    <div className={`bg-gradient-to-br border rounded-xl p-4 text-center border-[${currentMetricConfig.color}]/20`}>
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
                      <p className="text-xs text-slate-400 uppercase tracking-wider">{t('modal.trend')}</p>
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
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-green-400" />
                  {selectedMetric === 'bank' ? t('modal.transactionHistory') : t('modal.matchHistory')} {currentMetricConfig.label}
                </h3>

                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-800/90 backdrop-blur-sm">
                      <tr className="border-b border-slate-700">
                        {selectedMetric === 'bank' ? (
                          <>
                            <th className="text-left py-3 px-4 text-slate-300 font-semibold">Transacción</th>
                            <th className="text-center py-3 px-4 text-slate-300 font-semibold">Tiempo</th>
                            <th className="text-center py-3 px-4 text-slate-300 font-semibold">Tipo</th>
                            <th className={`text-center py-3 px-4 font-semibold text-[${currentMetricConfig.color}]`}>
                              Balance ⭐
                            </th>
                            <th className="text-center py-3 px-4 text-slate-300 font-semibold">Monto</th>
                            <th className="text-center py-3 px-4 text-slate-300 font-semibold">Descripción</th>
                          </>
                        ) : (
                          <>
                            <th className="text-left py-3 px-4 text-slate-300 font-semibold">Partida</th>
                            <th className="text-center py-3 px-4 text-slate-300 font-semibold">Fecha</th>
                            <th className="text-center py-3 px-4 text-slate-300 font-semibold">Ronda</th>
                            <th className={`text-center py-3 px-4 font-semibold text-[${currentMetricConfig.color}]`}>
                              {currentMetricConfig.label} ⭐
                            </th>
                            <th className="text-center py-3 px-4 text-slate-300 font-semibold">Kills</th>
                            <th className="text-center py-3 px-4 text-slate-300 font-semibold">Downs</th>
                            <th className="text-center py-3 px-4 text-slate-300 font-semibold">Score</th>
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
                                className={`border-b border-slate-700/50 hover:bg-slate-700/20 transition-all duration-150 transform hover:scale-[1.01] ${
                                  isBestBalance ? 'bg-green-500/10' : isWorstBalance ? 'bg-red-500/10' : ''
                                }`}
                                style={{ willChange: 'transform' }}
                              >
                                <td className="py-3 px-4 text-white font-medium">#{item.number}</td>
                                <td className="py-3 px-4 text-center text-slate-300">
                                  {item.timestamp ? `${Math.floor(item.timestamp / 3600)}h ${Math.floor((item.timestamp % 3600) / 60)}m ${item.timestamp % 60}s` : 'Fecha desconocida'}
                                </td>
                                <td className="py-3 px-4 text-center text-indigo-400 font-semibold capitalize">
                                  {item.type === 'deposit' ? 'Depósito' :
                                   item.type === 'withdraw' ? 'Retiro' :
                                   item.type === 'deposit_from_player' ? 'Recibido' : 'Enviado'}
                                </td>
                                <td className={`py-3 px-4 text-center font-bold text-[${currentMetricConfig.color}] ${
                                  isBestBalance ? 'text-green-400' : isWorstBalance ? 'text-red-400' : ''
                                }`}>
                                  ${bankValue.toLocaleString()}
                                  {isBestBalance && ' 🏆'}
                                  {isWorstBalance && ' ⚠️'}
                                </td>
                                <td className="py-3 px-4 text-center text-yellow-400 font-semibold">
                                  {item.type === 'deposit' || item.type === 'deposit_from_player' ? '+' : '-'}${item.amount}
                                </td>
                                <td className="py-3 px-4 text-center text-slate-300 text-xs max-w-xs truncate" title={item.description}>
                                  {item.description}
                                </td>
                              </tr>
                            );
                          })
                        : matchHistory.slice(-10).reverse().map((item, index) => {
                            const metricValue = item[selectedMetric as keyof typeof item] as number;
                            const isBestMatch = statsComparison && metricValue === statsComparison[selectedMetric].best;
                            const isWorstMatch = statsComparison && metricValue === statsComparison[selectedMetric].worst;

                            return (
                              <tr
                                key={`${item.fileName}-${index}`}
                                className={`border-b border-slate-700/50 hover:bg-slate-700/20 transition-all duration-150 transform hover:scale-[1.01] ${
                                  isBestMatch ? 'bg-green-500/10' : isWorstMatch ? 'bg-red-500/10' : ''
                                }`}
                                style={{ willChange: 'transform' }}
                              >
                                <td className="py-3 px-4 text-white font-medium">{`Partida ${matchHistory.length - index}`}</td>
                                <td className="py-3 px-4 text-center text-slate-300">
                                  {item.timestamp ? `${Math.floor(item.timestamp / 3600)}h ${Math.floor((item.timestamp % 3600) / 60)}m ${item.timestamp % 60}s` : 'Fecha desconocida'}
                                </td>
                                <td className="py-3 px-4 text-center text-indigo-400 font-semibold">{item.round || 1}</td>
                                <td className={`py-3 px-4 text-center font-bold text-[${currentMetricConfig.color}] ${
                                  isBestMatch ? 'text-green-400' : isWorstMatch ? 'text-red-400' : ''
                                }`}>
                                  {selectedMetric === 'score' ? (metricValue || 0).toLocaleString() : (metricValue || 0)}
                                  {isBestMatch && ' 🏆'}
                                  {isWorstMatch && ' ⚠️'}
                                </td>
                                <td className="py-3 px-4 text-center text-red-400 font-semibold">{item.kills || 0}</td>
                                <td className="py-3 px-4 text-center text-orange-400 font-semibold">{item.downs || 0}</td>
                                <td className="py-3 px-4 text-center text-yellow-400 font-semibold">{(item.score || 0).toLocaleString()}</td>
                              </tr>
                            );
                          })
                      }
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-center gap-4 text-xs text-slate-400">
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