import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MAP_BANNERS, MAP_NAME_TO_CODE, loadRecentMatches } from '../../../constants';
import { Target, Skull, Heart, Award, Activity, Calendar, X, BarChart3, Zap, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Clock, Sword, Shield, Package, Beer, Flame, Crosshair } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSound } from '../../../contexts/SoundContext';
import { useUISounds } from '../../../hooks/useUISounds';
import { useGSAP } from '../../../utils/gsap';
import { WEAPON_IMAGES, getWeaponBaseName, getMapImage } from '../../../constants/gameData';
import { useSettings } from '../../../contexts/SettingsContext';

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
  general?: {
    kills: number;
    deaths: number;
    downs: number;
    revives: number;
    suicides: number;
    scoreTotal: number;
    timePlayed: number;
    weightedRounds: number;
  };
  transactions?: {
    time: string;
    type: 'deposit' | 'withdraw';
    amount: number;
    balanceAfter: number;
  }[];
  duration?: string;
  weapons?: Record<string, {
    kills: number;
    headshots: number;
    displayName: string;
    killTimes?: string[] | { time: string; isHeadshot: boolean; round: number }[];
  }>;
  combat?: {
    headshots: number;
    gibs: number;
    meleeKills: number;
    grenadeKills: number;
    totalShots: number;
    hits: number;
  };
  survival?: {
    distanceTraveled: number;
    doorsPurchased: number;
    wins: number;
    losses: number;
    powerOn: number;
    drops: number;
  };
  magicBox?: {
    boxUsed: number;
    papUsed: number;
    boxWeaponsTaken: number;
    papWeaponsTaken: number;
  };
  powerups?: {
    nukes: number;
    instaKills: number;
    maxAmmo: number;
    doublePoints: number;
    carpenters: number;
    fireSales: number;
  };
  perkCounts?: {
    juggernog: number;
    quickRevive: number;
    doubleTap: number;
    speedCola: number;
    staminUp: number;
    phdFlopper: number;
    deadshot: number;
    muleKick: number;
    tombstoneWhosWho: number;
    electricCherry: number;
    vultureAid: number;
    totalPerks: number;
  };
  persistentUpgrades?: Record<string, number>;
  mobOfTheDead?: Record<string, number>;
  buried?: Record<string, number>;
  origins?: Record<string, number>;
  cheats?: Record<string, number>;
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

type MetricType = 'general' | 'kills' | 'downs' | 'score' | 'revives' | 'headshots' | 'bank' | 'weapons' | 'combat' | 'survival' | 'magicBox' | 'powerups' | 'perks' | 'persistentUpgrades' | 'mobOfTheDead' | 'buried' | 'origins' | 'cheats';

interface MetricConfig {
  key: MetricType;
  label: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}


const downsampleData = (data: any[], maxPoints: number = 300) => {
  if (data.length <= maxPoints) return data;

  const step = Math.floor(data.length / maxPoints);
  const sampled = [];


  sampled.push(data[0]);


  for (let i = step; i < data.length - step; i += step) {
    sampled.push(data[i]);
  }


  if (sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled.push(data[data.length - 1]);
  }

  return sampled;
};

const MapModal: React.FC<MapModalProps> = React.memo(({ isOpen, onClose, selectedMap, mapDisplayNames, playerData }) => {
  const [allMatches, setAllMatches] = useState<MatchData[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchData[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('general');
  const [selectedSubMetric, setSelectedSubMetric] = useState<string | null>(null);
  const [tablePage, setTablePage] = useState(0);
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { mapImagePreference } = useSettings();
  const { playExit, playPan, playHover, playSelect, playEquip } = useUISounds();


  const gsap = useGSAP();
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 5;

  const METRICS_CONFIG: MetricConfig[] = useMemo(() => [
    {
      key: 'general',
      label: t('stats.general'),
      color: '#6366f1',
      icon: <BarChart3 className="w-5 h-5" />,
      description: t('modal.generalDescription')
    },
    {
      key: 'bank',
      label: t('stats.bank'),
      color: '#f59e0b',
      icon: <Zap className="w-5 h-5" />,
      description: t('metric.bank.desc')
    },
    {
      key: 'weapons',
      label: t('stats.weapons') || "Armas",
      color: '#f43f5e',
      icon: <Sword className="w-5 h-5" />,
      description: t('modal.weaponsDescription') || "Análisis de armas"
    },
    {
      key: 'combat',
      label: t('stats.combat'),
      color: '#ef4444',
      icon: <Crosshair className="w-5 h-5" />,
      description: t('modal.combatDescription')
    },
    {
      key: 'survival',
      label: t('stats.survivalMode'),
      color: '#10b981',
      icon: <Shield className="w-5 h-5" />,
      description: t('modal.survivalDescription')
    },
    {
      key: 'magicBox',
      label: t('stats.magicBox'),
      color: '#3b82f6',
      icon: <Package className="w-5 h-5" />,
      description: t('modal.magicBoxDescription')
    },
    {
      key: 'powerups',
      label: t('stats.powerups'),
      color: '#eab308',
      icon: <Flame className="w-5 h-5" />,
      description: t('modal.powerupsDescription')
    },
    {
      key: 'perks',
      label: t('stats.perks'),
      color: '#8b5cf6',
      icon: <Beer className="w-5 h-5" />,
      description: t('modal.perksDescription')
    },
    {
      key: 'persistentUpgrades',
      label: 'Pers. Upgrades',
      color: '#06b6d4', 
      icon: <Activity className="w-5 h-5" />,
      description: 'Persistent Upgrades' 
    },
    {
      key: 'mobOfTheDead',
      label: t('map.mobOfTheDead'),
      color: '#ea580c', 
      icon: <Skull className="w-5 h-5" />,
      description: t('modal.mobOfTheDeadDescription')
    },
    {
      key: 'buried',
      label: t('map.buried'),
      color: '#b45309', 
      icon: <Crosshair className="w-5 h-5" />,
      description: t('modal.buriedDescription')
    },
    {
      key: 'origins',
      label: t('map.origins'),
      color: '#2563eb', 
      icon: <Shield className="w-5 h-5" />,
      description: t('modal.originsDescription')
    },
    {
      key: 'cheats',
      label: 'Cheats',
      color: '#dc2626', 
      icon: <Activity className="w-5 h-5" />,
      description: t('modal.cheatsDescription')
    }
  ], [t]);

  const visibleMetrics = useMemo(() => {
    return METRICS_CONFIG.filter(metric => {
      if (metric.key === 'mobOfTheDead') return selectedMap === 'prison';
      if (metric.key === 'buried') return selectedMap === 'processing'; 
      if (metric.key === 'origins') return selectedMap === 'tomb';
      return true;
    });
  }, [METRICS_CONFIG, selectedMap]);

  const SUB_METRICS: Record<string, { key: string; label: string }[]> = useMemo(() => ({
    general: [
      { key: 'scoreTotal', label: t('stats.score') },
      { key: 'kills', label: t('stats.kills') },
      { key: 'totalPerks', label: t('stats.perks') },
      { key: 'totalPowerups', label: t('stats.powerups') }
    ],
    combat: [
      { key: 'kills', label: t('stats.kills') },
      { key: 'deaths', label: 'Deaths' },
      { key: 'downs', label: t('stats.downs') },
      { key: 'revives', label: t('stats.revives') },
      { key: 'suicides', label: 'Suicides' },
      { key: 'scoreTotal', label: t('stats.score') },
      { key: 'timePlayed', label: t('stats.timePlayed') }, 
      { key: 'headshots', label: t('stats.headshots') },
      { key: 'gibs', label: t('stats.gibs') },
      { key: 'meleeKills', label: t('stats.melee') },
      { key: 'grenadeKills', label: t('stats.grenades') },
      { key: 'accuracy', label: t('stats.accuracy') }
    ],
    survival: [
      { key: 'distanceTraveled', label: t('stats.miles') },
      { key: 'doorsPurchased', label: t('stats.doors') },
      { key: 'drops', label: t('stats.drops') },
      { key: 'failedRevives', label: t('stats.failedRevives') }
    ],
    magicBox: [
      { key: 'boxUsed', label: t('stats.boxUses') },
      { key: 'papUsed', label: t('stats.papUses') },
      { key: 'boxWeaponsTaken', label: t('stats.boxTaken') },
      { key: 'papWeaponsTaken', label: t('stats.papTaken') }
    ],
    powerups: [
      { key: 'nukes', label: t('stats.nukes') },
      { key: 'instaKills', label: t('stats.instaKill') },
      { key: 'maxAmmo', label: t('stats.maxAmmo') },
      { key: 'doublePoints', label: t('stats.doublePoints') },
      { key: 'carpenters', label: t('stats.carpenter') },
      { key: 'fireSales', label: t('stats.fireSale') }
    ],
    perks: [
      { key: 'totalPerks', label: t('stats.total') },
      { key: 'juggernog', label: 'Juggernog' },
      { key: 'quickRevive', label: 'Quick Revive' },
      { key: 'speedCola', label: 'Speed Cola' },
      { key: 'doubleTap', label: 'Double Tap' },
      { key: 'staminUp', label: 'Stamin-Up' },
      { key: 'phdFlopper', label: 'PHD Flopper' },
      { key: 'deadshot', label: 'Deadshot' },
      { key: 'muleKick', label: 'Mule Kick' },
      { key: 'tombstoneWhosWho', label: 'Tombstone' },
      { key: 'vultureAid', label: 'Vulture Aid' }
    ],
    persistentUpgrades: [
      { key: 'juggernogPersistent', label: t('stats.persJugg') },
      { key: 'reviveNoPerk', label: t('stats.persRevive') },
      { key: 'multikillHeadshots', label: t('stats.persHeadshots') },
      { key: 'instaKill', label: t('stats.persInsta') },
      { key: 'carpenterPersistent', label: t('stats.persCarpenter') },
      { key: 'cashBackBought', label: t('stats.persCashBack') }
    ],
    mobOfTheDead: [
      { key: 'tomahawkAcquired', label: t('stats.tomahawkAcquired') },
      { key: 'fanTrapsUsed', label: t('stats.fanTraps') },
      { key: 'acidTrapsUsed', label: t('stats.acidTraps') },
      { key: 'sniperTowersUsed', label: t('stats.sniperTowers') },
      { key: 'eeGoodEnding', label: t('stats.eeGood') },
      { key: 'eeBadEnding', label: t('stats.eeBad') },
      { key: 'spoonAcquired', label: t('stats.spoon') },
      { key: 'brutusKilled', label: t('stats.brutus') }
    ],
    buried: [
      { key: 'lsatPurchased', label: t('stats.lsat') },
      { key: 'fountainUsed', label: t('stats.fountain') },
      { key: 'ghostsKilled', label: t('stats.ghosts') },
      { key: 'drainedByGhost', label: t('stats.ghostDrained') },
      { key: 'freeGhostPerk', label: t('stats.ghostPerk') },
      { key: 'boozeToArthur', label: t('stats.slothBooze') },
      { key: 'barricadesBroken', label: t('stats.slothBarricades') },
      { key: 'candyToArthur', label: t('stats.slothCandy') },
      { key: 'wallbuysPlaced', label: t('stats.wallbuysPlaced') }
    ],
    origins: [
      { key: 'mechzKilled', label: t('stats.mechz') },
      { key: 'robotStomped', label: t('stats.robotStomped') },
      { key: 'robotAccessed', label: t('stats.robotAccessed') },
      { key: 'generatorsCaptured', label: t('stats.generatorsCap') },
      { key: 'generatorsDefended', label: t('stats.generatorsDef') },
      { key: 'generatorsLost', label: t('stats.generatorsLost') },
      { key: 'digs', label: t('stats.digs') },
      { key: 'goldenShovel', label: t('stats.goldenShovel') },
      { key: 'goldenHelmet', label: t('stats.goldenHelmet') },
      { key: 'perkSlotsExtended', label: t('stats.perkSlots') }
    ],
    cheats: [
      { key: 'cheatFlags', label: t('stats.cheatFlags') }
    ]
  }), [t]);

  const handleMetricChange = useCallback((metric: MetricType) => {
    playEquip();
    setSelectedMetric(metric);
    
    if (SUB_METRICS[metric]) {
      
      setSelectedSubMetric(SUB_METRICS[metric][0].key);
    } else {
      setSelectedSubMetric(null);
    }
    setTablePage(0);
  }, [playEquip, SUB_METRICS]);

  useEffect(() => {
    if (isOpen && selectedMap) {
      
      setSelectedMetric('general');
      setTablePage(0);

      loadMatchHistory();

      if (modalRef.current) {
        gsap.animateModalIn(modalRef.current);
      }
    }
  }, [isOpen, selectedMap, gsap]);

  const handleClose = useCallback(() => {
    playExit();
    if (modalRef.current) {
      gsap.animateModalOut(modalRef.current, onClose);
    } else {
      onClose();
    }
  }, [onClose, gsap, playExit]);

  const loadMatchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const identifier = playerData?.username || playerData?.guid;
      if (!identifier) return;

      const matches = (await loadRecentMatches(identifier)) as unknown as MatchData[];


      const mapEntries = matches.filter(match => match.map === selectedMap);



      const realMatches = mapEntries.filter(m => m.round !== undefined && m.kills !== undefined);
      setMatchHistory(realMatches);


      const transactions: BankTransaction[] = [];
      mapEntries.forEach(match => {
        if (match.transactions) {
          match.transactions.forEach((txn, idx) => {
            transactions.push({
              id: `txn-${match.guid}-${idx}`,
              type: txn.type as any,
              amount: txn.amount,
              balanceBefore: 0,
              balanceAfter: txn.balanceAfter,
              description: `Match: ${match.map} - Round ${match.round}`,
              date: new Date(match.timestamp).toISOString(),
              timestamp: match.timestamp
            });
          });
        }
      });

      transactions.sort((a, b) => a.timestamp - b.timestamp);
      setBankTransactions(transactions);

    } catch (error) {
      console.error('Error loading match history:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMap, playerData]);



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

  const weaponStats = useMemo(() => {
    const stats: Record<string, { kills: number; headshots: number; displayName: string; killTimes?: string[] | { time: string; isHeadshot: boolean; round: number }[] }> = {};

    matchHistory.forEach(match => {
      if (!match.weapons) return;
      Object.values(match.weapons).forEach(weapon => {
        if (!stats[weapon.displayName]) {
          stats[weapon.displayName] = { kills: 0, headshots: 0, displayName: weapon.displayName, killTimes: [] };
        }
        
        
        const computedHeadshots = weapon.headshots !== undefined
          ? weapon.headshots
          : (Array.isArray(weapon.killTimes)
            ? weapon.killTimes.filter((k: any) => typeof k === 'object' && k.isHeadshot).length
            : 0);

        stats[weapon.displayName].kills += weapon.kills;
        stats[weapon.displayName].headshots += computedHeadshots;
      });
    });

    return Object.values(stats).sort((a, b) => b.kills - a.kills);
  }, [matchHistory]);

  
  const [selectedWeaponName, setSelectedWeaponName] = useState<string | null>(null);

  useEffect(() => {
    if (weaponStats.length > 0 && !selectedWeaponName) {
      setSelectedWeaponName(weaponStats[0].displayName);
    }
  }, [weaponStats, selectedWeaponName]);

  const chartData = useMemo(() => {
    if (selectedMetric === 'bank') {
      const rawData = bankTransactions;

      return downsampleData(rawData.map((transaction, index) => {
        const date = new Date(transaction.timestamp);
        return {
          game: `T${index + 1}`,
          time: date.toLocaleDateString(),
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
    } else if (selectedMetric === 'weapons') {
      
      const targetWeapon = selectedWeaponName || weaponStats[0]?.displayName;

      const rawData = matchHistory
        .slice()
        .reverse();

      return downsampleData(rawData.map((match, index) => {
        let kills = 0;
        if (match.weapons) {
          
          const w = Object.values(match.weapons).find(w => w.displayName === targetWeapon);
          if (w) kills = w.kills;
        }
        return {
          game: `${t('modal.matchNumber')} ${index + 1}`,
          weapons: kills,
          date: new Date(match.timestamp).toLocaleDateString()
        };
      }));
    } else if (selectedMetric === 'general') {
      const rawData = matchHistory.slice().reverse();
      return downsampleData(rawData.map((match, index) => {
        let value = 0;
        if (selectedSubMetric === 'totalPowerups') {
          value = (match.powerups?.nukes || 0) + (match.powerups?.instaKills || 0) + (match.powerups?.maxAmmo || 0) + (match.powerups?.doublePoints || 0) + (match.powerups?.carpenters || 0) + (match.powerups?.fireSales || 0);
        } else if (selectedSubMetric === 'totalPerks') {
          value = match.perkCounts?.totalPerks || 0;
        } else if (selectedSubMetric === 'scoreTotal') {
          value = match.general?.scoreTotal ?? match.score;
        } else if (selectedSubMetric === 'kills') {
          value = match.general?.kills ?? match.kills;
        }

        return {
          ...match,
          game: `${t('modal.matchNumber')} ${index + 1}`,
          [selectedMetric]: value,
          date: new Date(match.timestamp).toLocaleDateString()
        };
      }));
    } else if (selectedMetric === 'combat') {
      const rawData = matchHistory.slice().reverse();
      return downsampleData(rawData.map((match, index) => {
        let value = 0;
        if (selectedSubMetric === 'accuracy') {
          value = match.combat && match.combat.totalShots > 0
            ? Math.round((match.combat.hits / match.combat.totalShots) * 100)
            : 0;
        } else if (selectedSubMetric === 'kills') value = match.general?.kills ?? match.kills;
        else if (selectedSubMetric === 'deaths') value = match.general?.deaths || 0;
        else if (selectedSubMetric === 'downs') value = match.general?.downs ?? match.downs;
        else if (selectedSubMetric === 'revives') value = match.general?.revives ?? match.revives;
        else if (selectedSubMetric === 'suicides') value = match.general?.suicides || 0;
        else if (selectedSubMetric === 'scoreTotal') value = match.general?.scoreTotal ?? match.score;
        else if (selectedSubMetric === 'timePlayed') value = match.general?.timePlayed || 0;
        else if (selectedSubMetric && match.combat) {
          
          value = match.combat[selectedSubMetric] || 0;
        }
        return {
          ...match,
          game: `${t('modal.matchNumber')} ${index + 1}`,
          [selectedMetric]: value,
          date: new Date(match.timestamp).toLocaleDateString()
        };
      }));
    } else if (selectedMetric === 'survival') {
      const rawData = matchHistory.slice().reverse();
      return downsampleData(rawData.map((match, index) => {
        let value = 0;
        if (selectedSubMetric === 'distanceTraveled') {
          value = Math.round((match.survival?.distanceTraveled || 0) / 1609.34 * 100) / 100; 
        } else if (selectedSubMetric && match.survival) {
          
          value = match.survival[selectedSubMetric] || 0;
        }
        return {
          ...match,
          game: `${t('modal.matchNumber')} ${index + 1}`,
          [selectedMetric]: value,
          date: new Date(match.timestamp).toLocaleDateString()
        };
      }));
    } else if (selectedMetric === 'magicBox') {
      const rawData = matchHistory.slice().reverse();
      return downsampleData(rawData.map((match, index) => {
        let value = 0;
        if (selectedSubMetric && match.magicBox) {
          
          value = match.magicBox[selectedSubMetric] || 0;
        }
        return {
          ...match,
          game: `${t('modal.matchNumber')} ${index + 1}`,
          [selectedMetric]: value,
          date: new Date(match.timestamp).toLocaleDateString()
        };
      }));
    } else if (selectedMetric === 'powerups') {
      const rawData = matchHistory.slice().reverse();
      return downsampleData(rawData.map((match, index) => {
        let value = 0;
        if (selectedSubMetric && match.powerups) {
          
          value = match.powerups[selectedSubMetric] || 0;
        }
        return {
          ...match,
          game: `${t('modal.matchNumber')} ${index + 1}`,
          [selectedMetric]: value,
          date: new Date(match.timestamp).toLocaleDateString()
        };
      }));
    } else if (selectedMetric === 'perks') {
      const rawData = matchHistory.slice().reverse();
      return downsampleData(rawData.map((match, index) => {
        let value = 0;
        if (selectedSubMetric && match.perkCounts) {
          
          value = match.perkCounts[selectedSubMetric] || 0;
        }
        return {
          ...match,
          game: `${t('modal.matchNumber')} ${index + 1}`,
          [selectedMetric]: value,
          date: new Date(match.timestamp).toLocaleDateString()
        };
      }));
    } else if (['mobOfTheDead', 'buried', 'origins', 'cheats', 'persistentUpgrades'].includes(selectedMetric)) {
      const rawData = matchHistory.slice().reverse();
      return downsampleData(rawData.map((match, index) => {
        let value = 0;
        
        if (selectedSubMetric && match[selectedMetric]) {
          
          value = match[selectedMetric][selectedSubMetric] || 0;
        }
        return {
          ...match, 
          game: `${t('modal.matchNumber')} ${index + 1}`,
          [selectedMetric]: value,
          date: new Date(match.timestamp).toLocaleDateString()
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
  }, [matchHistory, bankTransactions, selectedMetric, t, weaponStats, selectedWeaponName, selectedSubMetric]);

  const currentMetricConfig = useMemo(() =>
    METRICS_CONFIG.find(m => m.key === selectedMetric)!,
    [selectedMetric, METRICS_CONFIG]
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
              best: 0,
              worst: 0,
              average: 0,
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
  }, [chartData, selectedMetric, matchHistory, METRICS_CONFIG]);

  const getComparisonClass = useCallback((value: number, metric: string) => {
    if (!statsComparison || !statsComparison[metric]) return '';
    return value === statsComparison[metric].best ? 'text-green-500 font-black' :
      value === statsComparison[metric].worst ? 'text-red-500 font-medium' : '';
  }, [statsComparison]);

  const getComparisonEmoji = useCallback((value: number, metric: string) => {
    if (!statsComparison || !statsComparison[metric]) return '';
    return value === statsComparison[metric].best ? ' 🏆' : '';
  }, [statsComparison]);


  const paginatedTableData = useMemo(() => {
    let data;
    if (selectedMetric === 'bank') {
      data = bankTransactions;
    } else if (selectedMetric === 'weapons') {
      data = weaponStats;
    } else {
      data = matchHistory;
    }
    const startIndex = tablePage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    return data.slice(startIndex, endIndex);
  }, [selectedMetric, bankTransactions, matchHistory, tablePage, weaponStats]);

  const totalPages = Math.ceil((selectedMetric === 'bank' ? bankTransactions.length : selectedMetric === 'weapons' ? weaponStats.length : matchHistory.length) / ITEMS_PER_PAGE);

  if (!isOpen || !selectedMap) return null;

  if (!isOpen || !selectedMap) return null;

  const safeMapBanner = getMapImage(selectedMap, mapImagePreference);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-black/95 backdrop-blur-xl' : 'bg-black/85 backdrop-blur-xl'}`}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`w-full max-w-7xl max-h-[95vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col border ${theme === 'dark' ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-700/60' : 'bg-white border-slate-300/60'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div className="relative shrink-0">
          <div className="relative h-48 lg:h-64 overflow-hidden">
            {safeMapBanner ? (
              <img
                src={safeMapBanner}
                alt={`${mapDisplayNames[selectedMap]} banner`}
                className="w-full h-full object-cover brightness-75 hover:brightness-100 transition-all duration-700 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
                <div className="text-center text-white">
                  <h3 className="text-3xl font-black tracking-tight">{mapDisplayNames[selectedMap]}</h3>
                </div>
              </div>
            )}

            { }
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

            { }
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all duration-300 hover:scale-110 group"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            { }
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                      {t('modal.performanceAnalysis')}
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-lg">
                    {mapDisplayNames[selectedMap]}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  {selectedMetric !== 'bank' && (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2 flex flex-col items-center min-w-[80px]">
                      <span className="text-xs text-slate-300 uppercase font-bold tracking-wider">Record</span>
                      <span className="text-xl font-black text-white flex items-center gap-1">
                        {mapStats.topRound} <span className="text-yellow-400 text-sm">🏆</span>
                      </span>
                    </div>
                  )}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2 flex flex-col items-center min-w-[80px]">
                    <span className="text-xs text-slate-300 uppercase font-bold tracking-wider">Total</span>
                    <span className="text-xl font-black text-white">
                      {(selectedMetric === 'bank' ? bankTransactions : matchHistory)?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        { }
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-slate-50 dark:bg-slate-900/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
              </div>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400 animate-pulse">{t('general.loading')}</p>
            </div>
          ) : matchHistory.length === 0 && bankTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Activity className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('modal.noDataAvailable')}</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">{t('modal.noMatchesFound')}</p>
            </div>
          ) : (
            <>
              { }
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-sm border border-slate-200 dark:border-slate-700/50">
                <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 no-scrollbar">
                  {visibleMetrics.map((metric) => (
                    <button
                      key={metric.key}
                      onClick={() => handleMetricChange(metric.key)}
                      className={`
                        relative flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 min-w-max
                        ${selectedMetric === metric.key
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                        }
                      `}
                    >
                      <span className={`${selectedMetric === metric.key ? 'text-white dark:text-slate-900' : `text-[${metric.color}]`}`}>
                        {metric.icon}
                      </span>
                      <span>{metric.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              { }
              {selectedMetric !== 'general' && statsComparison && statsComparison[selectedMetric] && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  { }
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-[${currentMetricConfig.color}]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('modal.record')}</span>
                      </div>
                      <div className={`text-3xl font-black text-[${currentMetricConfig.color}] mb-1`}>
                        {selectedMetric === 'bank'
                          ? `$${(statsComparison[selectedMetric].best || 0).toLocaleString()}`
                          : (statsComparison[selectedMetric].best || 0).toLocaleString()
                        }
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {selectedMetric === 'bank' ? t('modal.maximumBalance') : t('modal.bestMatch')}
                      </div>
                    </div>
                  </div>

                  { }
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Promedio</span>
                      </div>
                      <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                        {selectedMetric === 'bank'
                          ? `$${Math.round(statsComparison[selectedMetric].average || 0).toLocaleString()}`
                          : Math.round((statsComparison[selectedMetric].average || 0) * 10) / 10
                        }
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {t('modal.perMatch')}
                      </div>
                    </div>
                  </div>

                  { }
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className={`absolute top-0 right-0 w-24 h-24 ${statsComparison[selectedMetric].trend === 'up' ? 'bg-green-500/10' : 'bg-red-500/10'} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        {statsComparison[selectedMetric].trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('modal.trend')}</span>
                      </div>
                      <div className={`text-3xl font-black ${statsComparison[selectedMetric].trend === 'up' ? 'text-green-500' : 'text-red-500'} mb-1`}>
                        {statsComparison[selectedMetric].trend === 'up' ? t('modal.improving') : t('modal.worsening')}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Últimas partidas
                      </div>
                    </div>
                  </div>
                </div>
              )}

              { }
              {selectedMetric !== 'general' && chartData.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className={`w-5 h-5 text-[${currentMetricConfig.color}]`} />
                        {selectedMetric === 'bank'
                          ? t('modal.balanceEvolution')
                          : selectedMetric === 'weapons'
                            ? (
                              <div className="flex items-center gap-2">
                                <span>Historial:</span>
                                {selectedWeaponName && (
                                  <div className="w-10 h-6 relative shrink-0 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden">
                                    <img
                                      src={WEAPON_IMAGES[getWeaponBaseName(selectedWeaponName)] || './data/images/Nuketown_menu_selection_BO2.jpg'}
                                      alt={selectedWeaponName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <span>{selectedWeaponName || 'Top Weapon'}</span>
                              </div>
                            )
                            : t('modal.historyOf', { metric: currentMetricConfig.label })}
                      </h3>
                    </div>

                    {}
                    {}
                    {SUB_METRICS[selectedMetric] && (
                      <div className="flex flex-wrap gap-2">
                        {}
                        {SUB_METRICS[selectedMetric].map((sub) => (
                          <button
                            key={sub.key}
                            onClick={() => {
                              setSelectedSubMetric(sub.key);
                              playPan();
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${selectedSubMetric === sub.key
                              ? `bg-[${currentMetricConfig.color}] text-white shadow-md`
                              : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={currentMetricConfig.color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={currentMetricConfig.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                        <XAxis
                          dataKey="game"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }}
                          dx={-10}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                            borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                          }}
                          itemStyle={{ color: currentMetricConfig.color }}
                          formatter={(value: any) => [
                            selectedMetric === 'bank' ? `$${Number(value).toLocaleString()}` : Number(value).toLocaleString(),
                            currentMetricConfig.label
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey={selectedMetric === 'bank' ? 'balance' : selectedMetric}
                          stroke={currentMetricConfig.color}
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorMetric)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              { }
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    {selectedMetric === 'bank' ? t('modal.transactionHistory') : selectedMetric === 'weapons' ? "Ranking de Armas" : t('modal.matchHistory')}
                  </h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {selectedMetric === 'bank' ? bankTransactions.length : selectedMetric === 'weapons' ? weaponStats.length : matchHistory.length} registros
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700/50">
                        {selectedMetric === 'bank' ? (
                          <>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">#</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Tipo</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-right">Monto</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-right">Balance</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Descripción</th>
                          </>
                        ) : selectedMetric === 'weapons' ? (
                          <>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">#</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Arma</th>
                            <th className="p-4 text-xs font-bold uppercase text-red-500 tracking-wider text-right">Kills</th>
                            <th className="p-4 text-xs font-bold uppercase text-purple-500 tracking-wider text-right">Headshots</th>
                          </>
                        ) : selectedMetric === 'general' ? (
                          <>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Partida</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Ronda</th>
                            <th className="p-4 text-xs font-bold uppercase text-red-500 tracking-wider text-center">Kills</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Deaths</th>
                            <th className="p-4 text-xs font-bold uppercase text-orange-500 tracking-wider text-center">Downs</th>
                            <th className="p-4 text-xs font-bold uppercase text-green-500 tracking-wider text-center">Revives</th>
                            <th className="p-4 text-xs font-bold uppercase text-red-700 tracking-wider text-center">Suic</th>
                            <th className="p-4 text-xs font-bold uppercase text-yellow-500 tracking-wider text-center">Score</th>
                            <th className="p-4 text-xs font-bold uppercase text-purple-500 tracking-wider text-center">{t('stats.perks')} 🥤</th>
                            <th className="p-4 text-xs font-bold uppercase text-green-500 tracking-wider text-center">{t('stats.powerups')} 🔥</th>
                            <th className="p-4 text-xs font-bold uppercase text-blue-500 tracking-wider text-center">Time</th>
                          </>
                        ) : selectedMetric === 'combat' ? (
                          <>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Partida</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Ronda</th>
                            <th className="p-4 text-xs font-bold uppercase text-red-500 tracking-wider text-center">Kills</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Deaths</th>
                            <th className="p-4 text-xs font-bold uppercase text-orange-500 tracking-wider text-center">Downs</th>
                            <th className="p-4 text-xs font-bold uppercase text-green-500 tracking-wider text-center">Revives</th>
                            <th className="p-4 text-xs font-bold uppercase text-red-700 tracking-wider text-center">Suic</th>
                            <th className="p-4 text-xs font-bold uppercase text-yellow-500 tracking-wider text-center">Score</th>
                            <th className="p-4 text-xs font-bold uppercase text-red-500 tracking-wider text-center">HS</th>
                            <th className="p-4 text-xs font-bold uppercase text-yellow-500 tracking-wider text-center">Gibs</th>
                            <th className="p-4 text-xs font-bold uppercase text-blue-500 tracking-wider text-center">Melee</th>
                            <th className="p-4 text-xs font-bold uppercase text-orange-500 tracking-wider text-center">Nade</th>
                            <th className="p-4 text-xs font-bold uppercase text-purple-500 tracking-wider text-center">Acc</th>
                            <th className="p-4 text-xs font-bold uppercase text-blue-500 tracking-wider text-center">Time</th>
                          </>
                        ) : selectedMetric === 'survival' ? (
                          <>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Partida</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Ronda</th>
                            <th className="p-4 text-xs font-bold uppercase text-green-500 tracking-wider text-center">Miles</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Doors</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Drops</th>
                            <th className="p-4 text-xs font-bold uppercase text-red-500 tracking-wider text-center">Revives (F)</th>
                          </>
                        ) : selectedMetric === 'magicBox' ? (
                          <>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Partida</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Ronda</th>
                            <th className="p-4 text-xs font-bold uppercase text-blue-500 tracking-wider text-center">Box Uses</th>
                            <th className="p-4 text-xs font-bold uppercase text-purple-500 tracking-wider text-center">PAP Uses</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Taken (Box)</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Taken (PAP)</th>
                          </>
                        ) : selectedMetric === 'powerups' ? (
                          <>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Partida</th>
                            <th className="p-4 text-xs font-bold uppercase text-yellow-500 tracking-wider text-center">Nuke</th>
                            <th className="p-4 text-xs font-bold uppercase text-green-500 tracking-wider text-center">Insta</th>
                            <th className="p-4 text-xs font-bold uppercase text-blue-500 tracking-wider text-center">Max Ammo</th>
                            <th className="p-4 text-xs font-bold uppercase text-orange-500 tracking-wider text-center">x2</th>
                            <th className="p-4 text-xs font-bold uppercase text-yellow-300 tracking-wider text-center">Carp</th>
                            <th className="p-4 text-xs font-bold uppercase text-red-500 tracking-wider text-center">Sale</th>
                          </>
                        ) : selectedMetric === 'perks' ? (
                          <>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Partida</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">{t('stats.total')} 🥤</th>
                            <th className="p-4 text-xs font-bold uppercase text-red-500 tracking-wider text-center">Jugg</th>
                            <th className="p-4 text-xs font-bold uppercase text-blue-500 tracking-wider text-center">Quick</th>
                            <th className="p-4 text-xs font-bold uppercase text-green-500 tracking-wider text-center">Speed</th>
                            <th className="p-4 text-xs font-bold uppercase text-yellow-500 tracking-wider text-center">Double</th>
                            <th className="p-4 text-xs font-bold uppercase text-orange-500 tracking-wider text-center">Stamin</th>
                            <th className="p-4 text-xs font-bold uppercase text-purple-500 tracking-wider text-center">PHD</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Deadshot</th>
                            <th className="p-4 text-xs font-bold uppercase text-green-500 tracking-wider text-center">Mule</th>
                            <th className="p-4 text-xs font-bold uppercase text-blue-500 tracking-wider text-center">Cherry</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Tomb/Who</th>
                            <th className="p-4 text-xs font-bold uppercase text-orange-500 tracking-wider text-center">Vulture</th>
                          </>
                        ) : ['mobOfTheDead', 'buried', 'origins', 'cheats', 'persistentUpgrades'].includes(selectedMetric) ? (
                          <>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Partida</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Ronda</th>
                            {}
                            {SUB_METRICS[selectedMetric]?.map((sub: any) => (
                              <th key={sub.key} className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">
                                {sub.label}
                              </th>
                            ))}
                          </>
                        ) : (
                          <>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Partida</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Ronda</th>
                            <th className={`p-4 text-xs font-bold uppercase text-[${currentMetricConfig.color}] tracking-wider text-center`}>
                              {currentMetricConfig.label}
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody key={selectedMetric} className="divide-y divide-slate-200 dark:divide-slate-700/50">
                      {paginatedTableData.map((item: any, index: number) => {
                        const globalIndex = tablePage * ITEMS_PER_PAGE + index;

                        if (selectedMetric === 'bank') {
                          return (
                            <tr
                              key={`bank-${item.id || globalIndex}`}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default"
                              onMouseEnter={() => playHover()}
                            >
                              <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">#{globalIndex + 1}</td>
                              <td className="p-4 text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.type === 'deposit' || item.type === 'deposit_from_player'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  }`}>
                                  {item.type === 'deposit' ? 'Depósito' :
                                    item.type === 'withdraw' ? 'Retiro' :
                                      item.type === 'deposit_from_player' ? 'Recibido' : 'Enviado'}
                                </span>
                              </td>
                              <td className={`p-4 text-right font-mono font-medium ${item.type === 'deposit' || item.type === 'deposit_from_player' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                {item.type === 'deposit' || item.type === 'deposit_from_player' ? '+' : '-'}{item.amount}
                              </td>
                              <td className="p-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                                ${item.balanceAfter?.toLocaleString()}
                              </td>
                              <td className="p-4 text-sm text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                                {item.description}
                              </td>
                            </tr>
                          );
                        } else if (selectedMetric === 'weapons') {
                          const weapon = item as { kills: number, headshots: number, displayName: string };
                          const isSelected = selectedWeaponName === weapon.displayName;
                          return (
                            <tr
                              key={`weapon-${weapon.displayName}`}
                              onClick={() => {
                                setSelectedWeaponName(weapon.displayName);
                                playSelect();
                              }}
                              onMouseEnter={() => playHover()}
                              className={`transition-colors cursor-pointer ${isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                            >
                              <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">#{globalIndex + 1}</td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-8 relative shrink-0 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden">
                                    <img
                                      src={WEAPON_IMAGES[getWeaponBaseName(weapon.displayName)] || './data/images/Nuketown_menu_selection_BO2.jpg'}
                                      alt={weapon.displayName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span className={`font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {weapon.displayName}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 text-right font-bold text-red-500">{weapon.kills.toLocaleString()}</td>
                              <td className="p-4 text-right font-bold text-purple-500">{weapon.headshots.toLocaleString()}</td>
                            </tr>
                          )
                        } else if (selectedMetric === 'general') {
                          return (
                            <tr
                              key={`match-${item.fileName}-${globalIndex}`}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default"
                              onMouseEnter={() => playHover()}
                            >
                              <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                                {t('modal.matchNumber')} {matchHistory.length - globalIndex}
                              </td>
                              <td className="p-4 text-center font-mono text-blue-500 font-bold">{item.round}</td>
                              <td className={`p-4 text-center font-bold ${getComparisonClass(item.general?.kills ?? item.kills, 'kills')}`}>
                                {item.general?.kills ?? item.kills}
                              </td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                                {item.general?.deaths || 0}
                              </td>
                              <td className={`p-4 text-center font-bold ${getComparisonClass(item.general?.downs ?? item.downs, 'downs')}`}>
                                {item.general?.downs ?? item.downs}
                              </td>
                              <td className={`p-4 text-center font-bold ${getComparisonClass(item.general?.revives ?? item.revives, 'revives')}`}>
                                {item.general?.revives ?? item.revives}
                              </td>
                              <td className="p-4 text-center font-bold text-red-700">
                                {item.general?.suicides || 0}
                              </td>
                              <td className={`p-4 text-center font-bold ${getComparisonClass(item.general?.scoreTotal ?? item.score, 'score')}`}>
                                {(item.general?.scoreTotal ?? item.score)?.toLocaleString()}
                              </td>
                              <td className="p-4 text-center font-bold text-purple-500">
                                {item.perkCounts?.totalPerks || 0}
                              </td>
                              <td className="p-4 text-center font-bold text-green-500">
                                {(item.powerups?.nukes || 0) + (item.powerups?.instaKills || 0) + (item.powerups?.maxAmmo || 0) + (item.powerups?.doublePoints || 0) + (item.powerups?.carpenters || 0) + (item.powerups?.fireSales || 0)}
                              </td>
                              <td className="p-4 text-center font-mono text-slate-500 dark:text-slate-400">
                                {item.general?.timePlayed ? new Date(item.general.timePlayed * 1000).toISOString().substr(11, 8) : item.duration || '-'}
                              </td>
                            </tr>
                          );
                        } else if (selectedMetric === 'combat') {
                          return (
                            <tr
                              key={`match-${item.fileName}-${globalIndex}`}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default"
                              onMouseEnter={() => playHover()}
                            >
                              <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                                {t('modal.matchNumber')} {matchHistory.length - globalIndex}
                              </td>
                              <td className="p-4 text-center font-mono text-blue-500 font-bold">{item.round}</td>
                              {}
                              <td className="p-4 text-center font-bold text-red-500">{item.general?.kills ?? item.kills}</td>
                              <td className="p-4 text-center font-bold text-slate-500">{item.general?.deaths || 0}</td>
                              <td className="p-4 text-center font-bold text-orange-500">{item.general?.downs ?? item.downs}</td>
                              <td className="p-4 text-center font-bold text-green-500">{item.general?.revives ?? item.revives}</td>
                              <td className="p-4 text-center font-bold text-red-700">{item.general?.suicides || 0}</td>
                              <td className="p-4 text-center font-bold text-yellow-500">{(item.general?.scoreTotal ?? item.score)?.toLocaleString()}</td>

                              {}
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.combat?.headshots || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.combat?.gibs || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.combat?.meleeKills || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.combat?.grenadeKills || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                                {item.combat?.totalShots > 0
                                  ? `${Math.round((item.combat.hits / item.combat.totalShots) * 100)}%`
                                  : '0%'}
                              </td>
                              <td className="p-4 text-center font-mono text-xs">{item.general?.timePlayed ? new Date(item.general.timePlayed * 1000).toISOString().substr(11, 8) : item.duration || '-'}</td>
                            </tr>
                          );
                        } else if (['mobOfTheDead', 'buried', 'origins', 'cheats', 'persistentUpgrades'].includes(selectedMetric)) {
                          
                          const currentSubMetrics = SUB_METRICS[selectedMetric] || [];
                          return (
                            <tr
                              key={`match-${item.fileName}-${globalIndex}`}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default"
                              onMouseEnter={() => playHover()}
                            >
                              <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                                {t('modal.matchNumber')} {matchHistory.length - globalIndex}
                              </td>
                              <td className="p-4 text-center font-mono text-blue-500 font-bold">{item.round}</td>
                              {currentSubMetrics.map((sub: any) => (
                                <td key={sub.key} className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                                  {}
                                  {(item[selectedMetric]?.[sub.key] || 0).toLocaleString()}
                                </td>
                              ))}
                            </tr>
                          );
                        } else if (selectedMetric === 'survival') {
                          return (
                            <tr
                              key={`match-${item.fileName}-${globalIndex}`}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default"
                              onMouseEnter={() => playHover()}
                            >
                              <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                                {t('modal.matchNumber')} {matchHistory.length - globalIndex}
                              </td>
                              <td className="p-4 text-center font-mono text-blue-500 font-bold">{item.round}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{Math.round((item.survival?.distanceTraveled || 0) / 1609.34 * 100) / 100}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.survival?.doorsPurchased || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.survival?.drops || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.survival?.failedRevives || 0}</td>
                            </tr>
                          );
                        } else if (selectedMetric === 'magicBox') {
                          return (
                            <tr
                              key={`match-${item.fileName}-${globalIndex}`}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default"
                              onMouseEnter={() => playHover()}
                            >
                              <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                                {t('modal.matchNumber')} {matchHistory.length - globalIndex}
                              </td>
                              <td className="p-4 text-center font-mono text-blue-500 font-bold">{item.round}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.magicBox?.boxUsed || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.magicBox?.papUsed || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.magicBox?.boxWeaponsTaken || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.magicBox?.papWeaponsTaken || 0}</td>
                            </tr>
                          );
                        } else if (selectedMetric === 'powerups') {
                          return (
                            <tr
                              key={`match-${item.fileName}-${globalIndex}`}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default"
                              onMouseEnter={() => playHover()}
                            >
                              <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                                {t('modal.matchNumber')} {matchHistory.length - globalIndex}
                              </td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.powerups?.nukes || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.powerups?.instaKills || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.powerups?.maxAmmo || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.powerups?.doublePoints || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.powerups?.carpenters || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.powerups?.fireSales || 0}</td>
                            </tr>
                          );
                        } else if (selectedMetric === 'perks') {
                          return (
                            <tr
                              key={`match-${item.fileName}-${globalIndex}`}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default"
                              onMouseEnter={() => playHover()}
                            >
                              <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                                {t('modal.matchNumber')} {matchHistory.length - globalIndex}
                              </td>
                              <td className="p-4 text-center font-mono text-blue-500 font-bold">{item.perkCounts?.totalPerks || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.perkCounts?.juggernog || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.perkCounts?.quickRevive || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.perkCounts?.speedCola || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.perkCounts?.doubleTap || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.perkCounts?.staminUp || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.perkCounts?.phdFlopper || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.perkCounts?.deadshot || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.perkCounts?.muleKick || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.perkCounts?.electricCherry || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.perkCounts?.tombstoneWhosWho || 0}</td>
                              <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{item.perkCounts?.vultureAid || 0}</td>
                            </tr>
                          );
                        } else {
                          const value = item[selectedMetric];
                          return (
                            <tr
                              key={`match-${item.fileName}-${globalIndex}`}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default"
                              onMouseEnter={() => playHover()}
                            >
                              <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                                {t('modal.matchNumber')} {matchHistory.length - globalIndex}
                              </td>
                              <td className="p-4 text-center font-mono text-blue-500 font-bold">{item.round}</td>
                              <td className={`p-4 text-center font-bold text-[${currentMetricConfig.color}] ${getComparisonClass(value, selectedMetric)}`}>
                                {value?.toLocaleString()}
                              </td>
                            </tr>
                          );
                        }
                      })}
                    </tbody>
                  </table>
                </div>

                { }
                {totalPages > 1 && (
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                    <button
                      onClick={() => setTablePage(Math.max(0, tablePage - 1))}
                      disabled={tablePage === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Página {tablePage + 1} de {totalPages}
                    </span>
                    <button
                      onClick={() => setTablePage(Math.min(totalPages - 1, tablePage + 1))}
                      disabled={tablePage >= totalPages - 1}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
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