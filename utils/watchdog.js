#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const PLUTONIUM_BASE_DIR = path.join(process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Local'), 'Plutonium', 'storage', 't6', 'raw', 'scriptdata');
const BANK_DIR = path.join(PLUTONIUM_BASE_DIR, 'bank');
const RECENT_DIR = path.join(PLUTONIUM_BASE_DIR, 'recent');
const BANK_TRANSACTIONS_DIR = path.join(PLUTONIUM_BASE_DIR, 'bank_transactions');
const DATA_DIR = path.join(process.cwd(), 'data');
const PLAYERS_DIR = path.join(DATA_DIR, 'players');
const PLAYERS_INDEX_FILE = path.join(DATA_DIR, 'players.json');
// Legacy files for fallback/migration if needed, but we will write to new structure
const DATA_FILE = path.join(DATA_DIR, 'data_player.json');
const RECENT_MATCHES_FILE = path.join(DATA_DIR, 'recent_matches.json');
const WATCHER_DELAY = 500;
const WEAPON_NAME_MAPPING = {
  'm1911_zm': 'M1911',
  'python_zm': 'Python',
  'judge_zm': 'Executioner',
  'kard_zm': 'KAP-40',
  'fiveseven_zm': 'Five-Seven',
  'fivesevendw_zm': 'Five-Seven Dual Wield',
  'beretta93r_zm': 'B93R',
  'beretta93r_extclip_zm': 'B93R',
  'm1911_zm': 'M1911',
  'python_zm': 'Python',
  'judge_zm': 'Executioner',
  'kard_zm': 'KAP-40',
  'fiveseven_zm': 'Five-Seven',
  'fivesevendw_zm': 'Five-Seven Dual Wield',
  'beretta93r_zm': 'B93R',
  'beretta93r_extclip_zm': 'B93R Extended Clip',
  'mp5k_zm': 'MP5',
  'pdw57_zm': 'PDW-57',
  'ak74u_zm': 'AK-74u',
  'ak74u_extclip_zm': 'AK-74u Extended Clip',
  'qcw05_zm': 'Chicom CQB',
  'mp40_zm': 'MP40',
  'mp40_stalker_zm': 'MP40 Stalker',
  'evoskorpion_zm': 'Skorpion',
  'thompson_zm': 'Chicago Typewriter',
  'uzi_zm': 'UZI',
  'm14_zm': 'M14',
  'fnfal_zm': 'FAL',
  'galil_zm': 'Galil',
  'm16_zm': 'M16',
  'tar21_zm': 'TAR-21',
  'gl_tar21_zm': 'TAR-21 Grenade Launcher',
  'type95_zm': 'Type 25',
  'xm8_zm': 'M8A1',
  'an94_zm': 'AN-94',
  'scar_zm': 'SCAR-H',
  'ak47_zm': 'AK-47',
  'fnfal_zm': 'FAL',
  'hk416_zm': 'M27',
  'rpd_zm': 'RPD',
  'lsat_zm': 'LSAT',
  'mg08_zm': 'MG08',
  'hamr_zm': 'HAMR',
  '870mcs_zm': 'Remington 870 MCS',
  'rottweil72_zm': 'Olympia',
  'saiga12_zm': 'S12',
  'srm1216_zm': 'SMR',
  'ksg_zm': 'KSG',
  'dsr50_zm': 'DSR 50',
  'ballista_zm': 'Ballista',
  'barretm82_zm': 'Barrett M82A1',
  'svu_zm': 'SVU-AS',
  'usrpg_zm': 'RPG',
  'm32_zm': 'War Machine',
  'minigun_alcatraz_zm': 'Death Machine',
  'ray_gun_zm': 'Ray Gun',
  'raygun_mark2_zm': 'Ray Gun Mark II',
  'blundergat_zm': 'Blundergat',
  'blundersplat_zm': 'Acidgat',
  'slowgun_zm': 'Paralyzer',
  'slipgun_zm': 'Sliquifier',
  'knife_ballistic_zm': 'Ballistic Knife',
  'knife_ballistic_bowie_zm': 'Ballistic Bowie Knife',
  'knife_ballistic_no_melee_zm': 'Ballistic Knife (No Melee)',
};
const PERK_NAME_MAPPING = {
  'Juggernog': 'Juggernog',
  'Quick Revive': 'Quick Revive',
  'Speed Cola': 'Speed Cola',
  'Double Tap': 'Double Tap',
  'Stamin-Up': 'Stamin-Up',
  'PhD Flopper': 'PhD Flopper',
  'Deadshot Daiquiri': 'Deadshot Daiquiri',
  'Mule Kick': 'Mule Kick',
  'Electric Cherry': 'Electric Cherry',
  'Who\'s Who': 'Who\'s Who',
  'Tombstone': 'Tombstone',
  'Vulture Aid Elixir': 'Vulture Aid Elixir',
  'Widow\'s Wine': 'Widow\'s Wine'
};
function _getWeaponDisplayName(weaponName) {
  if (WEAPON_NAME_MAPPING[weaponName]) {
    return WEAPON_NAME_MAPPING[weaponName];
  }
  if (weaponName.includes(' ') && !weaponName.includes('_')) {
    return weaponName;
  }
  const isUpgraded = weaponName.toLowerCase().includes('_upgraded_zm') ||
    weaponName.toLowerCase().match(/upgraded\d*$/);
  let cleanName = weaponName.toLowerCase().trim();
  const upgradeSuffixes = [
    /_upgraded_zm/gi,
    /_reflex_zm/gi,
    /_extclip_zm/gi,
    /_stalker_zm/gi,
    /_akimbo_zm/gi,
    /_steadyaim_zm/gi,
    /_dualclip_zm/gi,
    /_zm/gi,
    /upgraded\d*$/gi  // "upgraded" + números al final
  ];
  for (const suffix of upgradeSuffixes) {
    cleanName = cleanName.replace(suffix, '');
  }
  let baseName = cleanName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  if (WEAPON_NAME_MAPPING[baseName]) {
    baseName = WEAPON_NAME_MAPPING[baseName];
  } else {
    for (const [key, value] of Object.entries(WEAPON_NAME_MAPPING)) {
      if (cleanName.includes(key.toLowerCase())) {
        baseName = value;
        break;
      }
    }
  }
  if (isUpgraded) {
    baseName += ' Upgraded';
  }
  return baseName;
}
function _getPerkDisplayName(perkName) {
  return PERK_NAME_MAPPING[perkName] || perkName;
}
function _ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch (error) {
      console.warn(`⚠️ Error creando directorio ${dirPath}:`, error.message);
    }
  }
}

function _sanitizeFilename(name) {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function _getPlayerDir(username) {
  const sanitized = _sanitizeFilename(username);
  return path.join(PLAYERS_DIR, sanitized);
}
function _loadPlayersData() {
  const playersData = {};

  // 1. Try to load from new folder structure
  if (fs.existsSync(PLAYERS_DIR)) {
    try {
      const playerDirs = fs.readdirSync(PLAYERS_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const dir of playerDirs) {
        const dataFile = path.join(PLAYERS_DIR, dir, 'data.json');
        if (fs.existsSync(dataFile)) {
          try {
            const playerData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
            if (playerData.guid) {
              playersData[playerData.guid] = playerData;
            }
          } catch (e) {
            console.warn(`⚠️ Error loading data for ${dir}:`, e.message);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Error scanning players directory:', error.message);
    }
  }

  // 2. Fallback/Merge with legacy if needed (only if empty)
  if (Object.keys(playersData).length === 0 && fs.existsSync(DATA_FILE)) {
    try {
      const legacyData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      return legacyData;
    } catch (error) {
      console.warn('⚠️ No se pudo cargar data_player.json legacy.', error.message);
    }
  }

  return playersData;
}

function _savePlayersData(data) {
  try {
    // 1. Save Legacy for safety (DISABLED)
    // fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    // 2. Save Index
    const playersIndex = Object.values(data).map(p => ({
      guid: p.guid,
      username: p.username,
      lastSeen: new Date().toISOString() // Approximate
    }));
    fs.writeFileSync(PLAYERS_INDEX_FILE, JSON.stringify(playersIndex, null, 2));

    // 3. Save Individual Player Data
    for (const guid in data) {
      const player = data[guid];
      if (!player.username) continue;

      const playerDir = _getPlayerDir(player.username);
      _ensureDirExists(playerDir);

      const playerFile = path.join(playerDir, 'data.json');
      fs.writeFileSync(playerFile, JSON.stringify(player, null, 2));
    }

  } catch (error) {
    console.error('❌ Error guardando datos de jugadores:', error);
  }
}
function _parseStatsFromFileContent(content) {
  const stats = {
    playerName: 'Unknown',
    round: 1,
    kills: 0,
    headshots: 0,
    revives: 0,
    downs: 0,
    score: 0,
    duration: '00:00:00',
    weapons: {},
    perks: {},
    bestWeapon: null,
    transactions: []
  };
  const lines = content.split('\n');
  let inTransactionsSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Basic Stats
    if (trimmed.includes('Nombre:') || trimmed.includes('Jugador:')) {
      stats.playerName = trimmed.split(':')[1]?.trim() || stats.playerName;
    }
    if (trimmed.includes('Ronda:') || trimmed.includes('Round:') || trimmed.includes('Ronda Alcanzada:')) {
      stats.round = parseInt(trimmed.split(':')[1]?.trim()) || stats.round;
    }
    if (trimmed.includes('Duracion:') || trimmed.includes('Duration:')) {
      stats.duration = trimmed.split(':')[1]?.trim() + ':' + trimmed.split(':')[2]?.trim() + ':' + trimmed.split(':')[3]?.trim();
      // Fix potential split issue if format is HH:MM:SS
      const parts = trimmed.split(':');
      if (parts.length >= 4) { // Label + HH + MM + SS
        stats.duration = `${parts[1].trim()}:${parts[2].trim()}:${parts[3].trim()}`;
      } else if (trimmed.includes('Duracion: ')) {
        stats.duration = trimmed.replace('Duracion: ', '').trim();
      }
    }
    if (trimmed.includes('Kills:') || trimmed.includes('Asesinatos:')) {
      stats.kills = parseInt(trimmed.split(':')[1]?.trim()) || stats.kills;
    }
    if (trimmed.includes('Headshots:')) {
      stats.headshots = parseInt(trimmed.split(':')[1]?.trim()) || stats.headshots;
    }
    if (trimmed.includes('Revives:') || trimmed.includes('Reanimaciones:')) {
      stats.revives = parseInt(trimmed.split(':')[1]?.trim()) || stats.revives;
    }
    if (trimmed.includes('Downs:') || trimmed.includes('Caídas:')) {
      stats.downs = parseInt(trimmed.split(':')[1]?.trim()) || stats.downs;
    }
    if (trimmed.includes('Score:') || trimmed.includes('Puntuación:') || trimmed.includes('Score Total:')) {
      stats.score = parseInt(trimmed.split(':')[1]?.trim()) || stats.score;
    }

    // Weapons
    if (trimmed.includes('ARMAS USADAS EN LA PARTIDA:')) {
      const weaponsSectionIndex = lines.indexOf(line);
      if (weaponsSectionIndex !== -1) {
        for (let i = weaponsSectionIndex + 1; i < lines.length; i++) {
          const weaponLine = lines[i].trim();
          if (weaponLine === '' || weaponLine.includes('PERKS') || weaponLine.includes('TRANSACCIONES') || weaponLine.includes('Fecha/Hora:')) break;
          const weaponMatch = weaponLine.match(/^(.+?):\s*(\d+)\s*kills$/);
          if (weaponMatch) {
            const weaponName = weaponMatch[1].trim();
            const killCount = parseInt(weaponMatch[2]);
            if (killCount > 0) {
              stats.weapons[weaponName] = {
                kills: killCount,
                displayName: _getWeaponDisplayName(weaponName)
              };
            }
          }
        }
      }
    }

    // Perks
    if (trimmed.includes('PERKS USADOS EN LA PARTIDA:')) {
      const perksSectionIndex = lines.indexOf(line);
      if (perksSectionIndex !== -1) {
        for (let i = perksSectionIndex + 1; i < lines.length; i++) {
          const perkLine = lines[i].trim();
          if (perkLine === '' || perkLine.includes('TRANSACCIONES') || perkLine.includes('Fecha/Hora:')) break;
          const perkMatch = perkLine.match(/^(.+?):\s*(\d+)\s*usos?$/);
          if (perkMatch) {
            const perkName = perkMatch[1].trim();
            const useCount = parseInt(perkMatch[2]);
            if (useCount > 0) {
              stats.perks[perkName] = {
                uses: useCount,
                displayName: _getPerkDisplayName(perkName)
              };
            }
          }
        }
      }
    }

    // Transactions
    if (trimmed.includes('TRANSACCIONES BANCARIAS:')) {
      inTransactionsSection = true;
      continue;
    }
    if (inTransactionsSection) {
      if (trimmed.startsWith('--------------------------------') || trimmed.includes('Fecha/Hora:')) {
        if (trimmed.includes('Fecha/Hora:')) inTransactionsSection = false; // End of file usually
        // Don't disable immediately on separator line as it starts and ends the section
        if (stats.transactions.length > 0 && trimmed.startsWith('--------------------------------')) {
          inTransactionsSection = false;
        }
        continue;
      }

      // Parse Transaction Line: [00:00:04] DEPOSIT: 500 - Balance: 1792
      // Regex: \[([\d:]+)\] (DEPOSIT|WITHDRAW): (\d+) - Balance: (\d+)
      const txnMatch = trimmed.match(/^\[([\d:]+)\] (DEPOSIT|WITHDRAW): (\d+) - Balance: (\d+)$/);
      if (txnMatch) {
        stats.transactions.push({
          time: txnMatch[1],
          type: txnMatch[2].toLowerCase(), // 'deposit' or 'withdraw'
          amount: parseInt(txnMatch[3]),
          balanceAfter: parseInt(txnMatch[4])
        });
      }
    }
  }

  if (Object.keys(stats.weapons).length > 0) {
    let maxKills = 0;
    let bestWeaponKey = null;
    for (const [weaponKey, weaponData] of Object.entries(stats.weapons)) {
      if (weaponData.kills > maxKills) {
        maxKills = weaponData.kills;
        bestWeaponKey = weaponKey;
      }
    }
    if (bestWeaponKey) {
      stats.bestWeapon = {
        name: bestWeaponKey,
        displayName: stats.weapons[bestWeaponKey].displayName,
        kills: maxKills
      };
    }
  }
  return stats;
}

function getGamesPlayedCount(guid, map) {
  try {
    // New structure: recent/guid/map/map_index.txt
    const indexFile = path.join(RECENT_DIR, guid, map, `${map}_index.txt`);
    if (fs.existsSync(indexFile)) {
      const content = fs.readFileSync(indexFile, 'utf-8').trim();
      const count = parseInt(content);
      return isNaN(count) ? 0 : count;
    }
  } catch (error) {
    console.warn(`Error leyendo índice para ${map}:`, error);
  }
  return 0;
}

function recalculateMapStats(guid, map) {
  const stats = {
    topRound: 1,
    totalKills: 0,
    totalHeadshots: 0,
    totalRevives: 0,
    totalDowns: 0,
    totalScore: 0
  };
  try {
    // New structure: recent/guid/map/
    const mapDir = path.join(RECENT_DIR, guid, map);
    if (!fs.existsSync(mapDir)) {
      return stats;
    }
    const files = fs.readdirSync(mapDir)
      .filter(file => file.startsWith(`${map}_recent_`) && file.endsWith('.txt'))
      .sort();
    for (const file of files) {
      try {
        const filePath = path.join(mapDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsedStats = _parseStatsFromFileContent(content);
        stats.totalKills += parsedStats.kills;
        stats.totalHeadshots += parsedStats.headshots;
        stats.totalRevives += parsedStats.revives;
        stats.totalDowns += parsedStats.downs;
        stats.totalScore += parsedStats.score;
        if (parsedStats.round > stats.topRound) {
          stats.topRound = parsedStats.round;
        }
      } catch (error) {
        console.warn(`Error procesando archivo ${file}:`, error);
      }
    }
  } catch (error) {
    console.warn(`Error recalculando estadísticas para ${map}:`, error);
  }
  return stats;
}

function recalculatePlayerTotalStats(maps) {
  const totalStats = {
    kills: 0,
    downs: 0,
    revives: 0,
    headshots: 0
  };
  for (const mapName in maps) {
    const mapStats = maps[mapName];
    totalStats.kills += mapStats.totalKills || 0;
    totalStats.downs += mapStats.totalDowns || 0;
    totalStats.revives += mapStats.totalRevives || 0;
    totalStats.headshots += mapStats.totalHeadshots || 0;
  }
  return totalStats;
}

function ensurePlayerRecentDir(guid) {
  const playerRecentDir = path.join(RECENT_DIR, guid);
  if (!fs.existsSync(playerRecentDir)) {
    try {
      fs.mkdirSync(playerRecentDir, { recursive: true });
    } catch (error) {
      console.warn(`⚠️ Error creando directorio de recent matches para ${guid}:`, error.message);
    }
  }
  return playerRecentDir;
}

function processPlayerStats(guid, playerName, map, round, kills, headshots, revives, downs, score) {
  ensurePlayerRecentDir(guid);
  let playersData = _loadPlayersData();
  if (!playersData[guid]) {
    playersData[guid] = {
      username: playerName,
      guid: guid,
      stats: { kills: 0, downs: 0, revives: 0, headshots: 0 },
      maps: {},
      economy: { balance: 0, transactions: [] } // Transactions will now be empty/unused here or aggregated differently if needed
    };
  }
  if (playerName && playerName !== 'Unknown' && playerName !== playersData[guid].username) {
    playersData[guid].username = playerName;
  }
  const gamesPlayed = getGamesPlayedCount(guid, map);
  if (gamesPlayed === 0) {
    return; // No guardar si no hay índice
  }
  const recalculatedStats = recalculateMapStats(guid, map);
  playersData[guid].maps[map] = {
    ...recalculatedStats,
    gamesPlayed: gamesPlayed
  };
  const mapStats = playersData[guid].maps[map];
  playersData[guid].stats = recalculatePlayerTotalStats(playersData[guid].maps);

  // Update bank balance from file
  try {
    const bankFile = path.join(BANK_DIR, `${guid}.txt`);
    if (fs.existsSync(bankFile)) {
      const content = fs.readFileSync(bankFile, 'utf-8');
      const balanceMatch = content.match(/Balance:\s*(\d+)/);
      if (balanceMatch) {
        if (!playersData[guid].economy) {
          playersData[guid].economy = { balance: 0, transactions: [] };
        }
        playersData[guid].economy.balance = parseInt(balanceMatch[1], 10);
      }
    }
  } catch (e) {
    console.warn(`Error reading bank balance for ${guid}:`, e.message);
  }

  _savePlayersData(playersData);
}

function processRecentMatchesFromDir() {
  try {
    const recentMatches = [];
    if (!fs.existsSync(RECENT_DIR)) {
      console.log('❌ Directorio de recent matches no encontrado:', RECENT_DIR);
      return;
    }
    const guidDirs = fs.readdirSync(RECENT_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const guid of guidDirs) {
      const guidPath = path.join(RECENT_DIR, guid);

      // Iterate over map directories inside guid directory
      const mapDirs = fs.readdirSync(guidPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const map of mapDirs) {
        const mapPath = path.join(guidPath, map);
        const files = fs.readdirSync(mapPath)
          .filter(file => file.endsWith('.txt'))
          .sort(); // Ordenar alfabéticamente

        for (const file of files) {
          try {
            const filePath = path.join(mapPath, file);
            const fileName = path.basename(file, '.txt');
            const parts = fileName.split('_recent_');
            if (parts.length !== 2) {
              if (!fileName.endsWith('_index.txt')) { // Ignorar archivos de índice
                continue;
              }
              continue;
            }
            // map is already known from directory, but let's verify or use it
            const fileMap = parts[0];

            const matchNumber = parseInt(parts[1]);
            if (isNaN(matchNumber)) {
              continue;
            }
            const content = fs.readFileSync(filePath, 'utf-8');
            const stats = _parseStatsFromFileContent(content);
            const fileStats = fs.statSync(filePath);
            const realTimestamp = Math.floor(fileStats.birthtime.getTime());

            processPlayerStats(guid, stats.playerName, fileMap, stats.round, stats.kills, stats.headshots, stats.revives, stats.downs, stats.score);

            const matchData = {
              ...stats,
              guid,
              map: fileMap,
              timestamp: realTimestamp,
              fileName: file
            };
            recentMatches.push(matchData);
          } catch (error) {
            console.warn(`❌ Error procesando archivo ${file}:`, error.message);
          }
        }
      }
    }

    if (recentMatches.length === 0) {
      return;
    }
    recentMatches.sort((a, b) => b.timestamp - a.timestamp);

    // Save player specific recent matches
    const matchesByPlayer = {};
    for (const match of recentMatches) {
      if (!match.playerName) continue;
      if (!matchesByPlayer[match.playerName]) {
        matchesByPlayer[match.playerName] = [];
      }
      matchesByPlayer[match.playerName].push(match);
    }

    for (const playerName in matchesByPlayer) {
      const playerDir = _getPlayerDir(playerName);
      _ensureDirExists(playerDir);
      const playerMatchesFile = path.join(playerDir, 'matches.json');
      // Limit to 50 per player
      const playerMatches = matchesByPlayer[playerName].slice(0, 50);
      fs.writeFileSync(playerMatchesFile, JSON.stringify(playerMatches, null, 2));
    }

  } catch (error) {
    console.error('❌ Error procesando recent matches:', error);
  }
}

function main() {
  const dirsToCreate = [
    PLUTONIUM_BASE_DIR,
    RECENT_DIR,
    DATA_DIR, // Directorio 'data' local
    PLAYERS_DIR // New players directory
  ];
  dirsToCreate.forEach(_ensureDirExists);

  processRecentMatchesFromDir();

  let timer;
  function onRecentChange(event, filename) {
    if (!filename) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      processRecentMatchesFromDir();
    }, WATCHER_DELAY);
  }

  if (fs.existsSync(RECENT_DIR)) {
    fs.watch(RECENT_DIR, { recursive: true }, onRecentChange);
  }
  console.log('Watchdog is running and collecting statistics...');
  process.on('SIGINT', () => {
    process.exit(0);
  });
}
main();
