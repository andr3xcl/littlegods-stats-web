#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';

let baseDir;

if (process.platform === 'win32') {
  baseDir = process.env.LOCALAPPDATA ||
    path.join(process.env.USERPROFILE, 'AppData', 'Local');
} else {
  
  baseDir = path.join(
    os.homedir(),
    'Games',
    'dosdevices',
    'c:',
    'users',
    'andresito',
    'AppData',
    'Local'
  );
}

const PLUTONIUM_BASE_DIR = path.join(
  baseDir,
  'Plutonium',
  'storage',
  't6',
  'raw',
  'scriptdata'
);
const BANK_DIR = path.join(PLUTONIUM_BASE_DIR, 'bank');
const RECENT_DIR = path.join(PLUTONIUM_BASE_DIR, 'recent');
const BANK_TRANSACTIONS_DIR = path.join(PLUTONIUM_BASE_DIR, 'bank_transactions');
const DATA_DIR = path.join(process.cwd(), 'data');
const PLAYERS_DIR = path.join(DATA_DIR, 'players');
const PLAYERS_INDEX_FILE = path.join(DATA_DIR, 'players.json');

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
    /upgraded\d*$/gi
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




    const playersIndex = Object.values(data).map(p => ({
      guid: p.guid,
      username: p.username,
      lastSeen: new Date().toISOString()
    }));
    fs.writeFileSync(PLAYERS_INDEX_FILE, JSON.stringify(playersIndex, null, 2));


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
    guid: '',
    map: '',
    round: 1,
    duration: '00:00:00',
    kills: 0,
    headshots: 0,
    revives: 0,
    downs: 0,
    score: 0,

    
    general: {},
    combat: {},
    survival: {},
    magicBox: {},
    powerups: {},
    perkCounts: {},
    equipment: {},
    mapSpecific: {},
    persistentUpgrades: {},
    mobOfTheDead: {},
    buried: {},
    origins: {},
    cheats: {},
    other: {},

    weapons: {},
    perks: {},
    bestWeapon: null,
    transactions: []
  };

  const lines = content.split('\n');
  let currentSection = null;
  let currentWeapon = null;

  const sectionMap = {
    '[GENERAL]': 'general',
    '[COMBAT]': 'combat',
    '[SURVIVAL & ECONOMY]': 'survival',
    '[MAGIC BOX & PAP]': 'magicBox',
    '[POWERUPS]': 'powerups',
    '[PERKS DRANK COUNTERS]': 'perkCounts',
    '[EQUIPMENT]': 'equipment',
    '[MAP SPECIFIC]': 'mapSpecific',
    '[PERSISTENT UPGRADES]': 'persistentUpgrades',
    '[OTHER]': 'other',
    '[WEAPON USAGE LIST]': 'weapons',
    'ARMAS USADAS EN LA PARTIDA:': 'weapons',
    '[BANK TRANSACTIONS]': 'transactions',
    '[MOB OF THE DEAD STATS]': 'mobOfTheDead',
    '[BURIED STATS]': 'buried',
    '[ORIGINS STATS]': 'origins',
    '[CHEAT FLAGS DETECTED]': 'cheats'
  };

  
  const toCamelCase = (str) => {
    return str
      .replace(/['"]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .trim()
      .split(/\s+/)
      .map((word, index) => {
        if (index === 0) return word.toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect Section Headers
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      if (sectionMap[trimmed]) {
        currentSection = sectionMap[trimmed];
        currentWeapon = null;
        continue;
      }
    } else if (sectionMap[trimmed]) {
      // Handle headers without brackets (e.g., "ARMAS USADAS EN LA PARTIDA:")
      currentSection = sectionMap[trimmed];
      currentWeapon = null;
      continue;
    }

    // Top Level Metadata
    if (!currentSection) {
      if (trimmed.startsWith('Jugador:')) stats.playerName = trimmed.split(':')[1].trim();
      else if (trimmed.startsWith('GUID:')) stats.guid = trimmed.split(':')[1].trim();
      else if (trimmed.startsWith('Mapa:')) stats.map = trimmed.split(':')[1].trim();
      else if (trimmed.startsWith('Ronda Alcanzada:')) stats.round = parseInt(trimmed.split(':')[1].trim()) || 1;
      else if (trimmed.startsWith('Duracion:')) {
        stats.duration = trimmed.replace('Duracion:', '').trim();
        // Parse duration to seconds
        const parts = stats.duration.split(':');
        if (parts.length === 3) {
          const hours = parseInt(parts[0], 10);
          const minutes = parseInt(parts[1], 10);
          const seconds = parseInt(parts[2], 10);
          if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
            stats.general.timePlayed = (hours * 3600) + (minutes * 60) + seconds;
          }
        }
      }
      else if (trimmed.startsWith('Score Total:')) stats.score = parseInt(trimmed.split(':')[1].trim()) || stats.score;
      continue;
    }

    // Handle Sections
    if (currentSection === 'transactions') {
      const txMatch = trimmed.match(/^\[([\d:]+)\]\s+(DEPOSIT|WITHDRAW):\s+(\d+)\s+-\s+Balance:\s+(\d+)/i);
      if (txMatch) {
        stats.transactions.push({
          time: txMatch[1],
          type: txMatch[2].toLowerCase(),
          amount: parseInt(txMatch[3]),
          balanceAfter: parseInt(txMatch[4])
        });
      }
    } else if (currentSection === 'weapons') {
      // Detect new format: weapon_name|kills|headshots|killTimes
      const newFormatMatch = trimmed.match(/^([^|]+)\|(\d+)\|(\d+)\|(.*)$/);

      if (newFormatMatch) {
        // NEW FORMAT: weapon_name|kills|headshots|killTimes
        const [, name, kills, headshots, killTimesStr] = newFormatMatch;
        const weaponData = {
          name: name.trim(),
          displayName: _getWeaponDisplayName(name.trim()),
          kills: parseInt(kills),
          headshots: parseInt(headshots),
          killTimes: []
        };

        // Parse killTimes: "00:01:23,1,1;00:01:45,0,1;..."
        if (killTimesStr && killTimesStr.trim()) {
          const killTimesArray = killTimesStr.split(';').filter(kt => kt.trim());
          for (const kt of killTimesArray) {
            const parts = kt.split(',');
            if (parts.length >= 3) {
              weaponData.killTimes.push({
                time: parts[0].trim(),
                isHeadshot: parts[1].trim() === '1',
                round: parseInt(parts[2].trim() || '1', 10)
              });
            }
          }
        }

        stats.weapons[name.trim()] = weaponData;
        currentWeapon = weaponData;

      } else {
        // OLD FORMAT: Backward compatibility
        const weaponHeaderMatch = trimmed.match(/^(.+?):\s*(\d+)\s*kills?$/i);
        if (weaponHeaderMatch) {
          const name = weaponHeaderMatch[1].trim();
          const kills = parseInt(weaponHeaderMatch[2]);
          currentWeapon = {
            name: name,
            displayName: _getWeaponDisplayName(name),
            kills: kills,
            headshots: 0,
            killTimes: []
          };
          stats.weapons[name] = currentWeapon;
        } else if (currentWeapon && trimmed.startsWith('kill')) {
          // kill 1: 00:03:22 | HS: 1 | R: 1
          const kMatch = trimmed.match(/^kill\s+\d+:\s*(\d{2}:\d{2}:\d{2})\s*(?:\|\s*HS:\s*(\d+))?\s*(?:\|\s*R:\s*(\d+))?/);
          if (kMatch) {
            const isHeadshot = kMatch[2] === '1';
            if (isHeadshot) currentWeapon.headshots++;
            currentWeapon.killTimes.push({
              time: kMatch[1].trim(),
              isHeadshot: isHeadshot,
              round: parseInt(kMatch[3] || '1', 10)
            });
          }
        }
      }
    } else {
      const parts = trimmed.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const valStr = parts.slice(1).join(':').trim();

        const valNum = Number(valStr);
        const value = (valStr === '' || isNaN(valNum)) ? valStr : valNum;

        if (stats[currentSection]) {
          const camelKey = toCamelCase(key);
          stats[currentSection][camelKey] = value;

          // Legacy Compatibility Mapping
          if (currentSection === 'general') {
            if (camelKey === 'kills') stats.kills = value;
            if (camelKey === 'deaths') stats.general.deaths = value;
            if (camelKey === 'downs') stats.downs = value;
            if (camelKey === 'revives') stats.revives = value;
            if (camelKey === 'scoreTotal') stats.score = value;
          }
          if (currentSection === 'combat') {
            if (camelKey === 'headshots') stats.headshots = value;
          }
          if (currentSection === 'perkCounts') {
            if (typeof value === 'number' && value > 0) {
              stats.perks[key] = {
                uses: value,
                displayName: _getPerkDisplayName(key)
              };
            }
          }
        }
      }
    }
  }

  // Calculate Best Weapon
  let maxKills = 0;
  for (const wKey in stats.weapons) {
    const w = stats.weapons[wKey];
    if (w.kills > maxKills) {
      maxKills = w.kills;
      stats.bestWeapon = {
        name: w.name,
        displayName: w.displayName,
        kills: w.kills
      };
    }
  }

  return stats;
}

function getGamesPlayedCount(guid, map) {
  try {

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
    totalDowns: 0,
    totalScore: 0,
    totalTimePlayed: 0
  };
  try {

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
        stats.totalTimePlayed += parsedStats.general && parsedStats.general.timePlayed ? parsedStats.general.timePlayed : 0;
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
    revives: 0,
    headshots: 0,
    totalTimePlayed: 0
  };
  for (const mapName in maps) {
    const mapStats = maps[mapName];
    totalStats.kills += mapStats.totalKills || 0;
    totalStats.downs += mapStats.totalDowns || 0;
    totalStats.revives += mapStats.totalRevives || 0;
    totalStats.revives += mapStats.totalRevives || 0;
    totalStats.headshots += mapStats.totalHeadshots || 0;
    totalStats.totalTimePlayed += mapStats.totalTimePlayed || 0;
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
      username: playerName,
      guid: guid,
      stats: { kills: 0, downs: 0, revives: 0, headshots: 0, totalTimePlayed: 0 },
      maps: {},
      economy: { balance: 0, transactions: [] }

    };
  }
  if (playerName && playerName !== 'Unknown' && playerName !== playersData[guid].username) {
    playersData[guid].username = playerName;
  }
  const gamesPlayed = getGamesPlayedCount(guid, map);
  if (gamesPlayed === 0) {
    return;
  }
  const recalculatedStats = recalculateMapStats(guid, map);
  playersData[guid].maps[map] = {
    ...recalculatedStats,
    gamesPlayed: gamesPlayed
  };
  const mapStats = playersData[guid].maps[map];
  playersData[guid].stats = recalculatePlayerTotalStats(playersData[guid].maps);


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


      const mapDirs = fs.readdirSync(guidPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const map of mapDirs) {
        const mapPath = path.join(guidPath, map);
        const files = fs.readdirSync(mapPath)
          .filter(file => file.endsWith('.txt'))
          .sort();

        for (const file of files) {
          try {
            const filePath = path.join(mapPath, file);
            const fileName = path.basename(file, '.txt');
            const parts = fileName.split('_recent_');
            if (parts.length !== 2) {
              if (!fileName.endsWith('_index.txt')) {
                continue;
              }
              continue;
            }

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
    DATA_DIR,
    PLAYERS_DIR
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
