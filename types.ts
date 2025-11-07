export interface PlayerStats {
  kills: number;
  downs: number;

  revives: number;
  headshots: number;
}
export interface MapStats {
  topRound: number;
  totalKills: number;
  totalHeadshots: number;
  totalRevives: number;
  totalDowns: number;
  totalScore: number;
  gamesPlayed: number;
  lastPlayed: string;
}

export interface PlayerProfile {
  username: string;
  guid?: string;
  avatarUrl?: string;
  level: number;
  stats: PlayerStats;
  maps: { [key: string]: MapStats };
}

export interface RecentMatch {
  id: string;
  map: string;
  mode: string;
  result: 'VICTORY' | 'DEFEAT';
  kills: number;
  deaths: number;
  date: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number; // positive for deposit, negative for withdrawal
  date: string;
}

export interface EconomyData {
  balance: number;
  transactions: Transaction[];
}