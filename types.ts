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
    duration?: string;
    bestWeapon?: {
        name: string;
        displayName: string;
        kills: number;
    } | null;
    weapons?: Record<string, {
        kills: number;
        headshots: number;
        displayName: string;
        killTimes?: { time: string; isHeadshot: boolean; round: number }[] | string[];
    }>;
    perks?: Record<string, {
        uses: number;
        displayName: string;
    }>;
    transactions?: {
        time: string;
        type: 'deposit' | 'withdraw';
        amount: number;
        balanceAfter: number;
    }[];

    
    general?: Record<string, number>;
    combat?: Record<string, number>;
    survival?: Record<string, number>;
    magicBox?: Record<string, number>;
    powerups?: Record<string, number>;
    equipment?: Record<string, number>;
    mapSpecific?: Record<string, number>;
    persistentUpgrades?: Record<string, number>;
    other?: Record<string, number>;
    mobOfTheDead?: Record<string, number>;
    buried?: Record<string, number>;
    origins?: Record<string, number>;
    cheats?: Record<string, number>;
}

export type RecentMatch = MatchData;

export interface EconomyData {
    balance: number;
    transactions: {
        time: string;
        type: 'deposit' | 'withdraw';
        amount: number;
        balanceAfter: number;
    }[];
}

export interface MapStats {
    topRound: number;
    totalKills: number;
    totalHeadshots: number;
    totalRevives: number;
    totalDowns: number;
    totalScore: number;
    totalTimePlayed: number;
    gamesPlayed: number;
    lastPlayed?: string;
}

export interface PlayerProfile {
    username: string;
    guid: string;
    avatarUrl?: string; 
    stats: {
        kills: number;
        downs: number;
        revives: number;
        headshots: number;
        totalTimePlayed: number;
    };
    maps: Record<string, MapStats>;
    economy: EconomyData;
}
