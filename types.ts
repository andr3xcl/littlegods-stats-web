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
}

export interface PlayerProfile {
    username: string;
    guid?: string;
    avatarUrl?: string;
    level: number;
    stats: PlayerStats;
    maps: { [key: string]: MapStats };
}

export interface WeaponData {
    name: string;
    displayName: string;
    kills: number;
    headshots: number;
}

export interface RecentMatch {
    id: string;
    map: string;
    mode: string;
    result: 'VICTORY' | 'DEFEAT';
    name: string;
    displayName: string;
    kills: number;
    deaths?: number;
    playerName?: string;
    guid?: string;
    round?: number;
    headshots?: number;
    revives?: number;
    timestamp?: number;
    fileName?: string;
}

export interface PerkData {
    name: string;
    displayName: string;
    uses: number;
}

export interface EconomyTransaction {
    id: string;
    type: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
    date: string;
    timestamp: number;
    number: number;
}

export interface MatchTransaction {
    time: string;
    type: 'deposit' | 'withdraw';
    amount: number;
    balanceAfter: number;
}

export interface MatchData {
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
    weapons: Record<string, WeaponData>;
    perks: Record<string, PerkData>;
    bestWeapon: {
        name: string;
        displayName: string;
        kills: number;
    } | null;
    duration?: string;
    transactions?: MatchTransaction[];
}

export interface EconomyData {
    balance: number;
    transactions: EconomyTransaction[];
}