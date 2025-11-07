#!/usr/bin/env node

// WATCHDOG PERFECTO - Versión final que funciona
// Uso: node utils/watchdog.js

import fs from 'fs';
import path from 'path';

// Función para procesar datos desde recent matches
function processFromRecentMatches() {
  try {
    const recentDir = path.join(PLUTONIUM_BASE_DIR, 'recent');
    const recentMatches = [];

    if (!fs.existsSync(recentDir)) {
      console.log('⚠️ Directorio de recent matches no encontrado');
      return;
    }

    // Leer todos los subdirectorios (cada uno es un GUID)
    const guidDirs = fs.readdirSync(recentDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`🔍 Procesando recent matches para ${guidDirs.length} jugadores...`);

    for (const guid of guidDirs) {
      const guidPath = path.join(recentDir, guid);

      // Leer todos los archivos en el directorio del GUID
      const files = fs.readdirSync(guidPath)
        .filter(file => file.endsWith('.txt'))
        .sort(); // Ordenar alfabéticamente

      for (const file of files) {
        try {
          const filePath = path.join(guidPath, file);
          const fileName = path.basename(file, '.txt');

          // Parsear el nombre del archivo
          const parts = fileName.split('_recent_');
          if (parts.length !== 2) continue;

          const map = parts[0];
          const matchNumber = parseInt(parts[1]);

          // Leer contenido del archivo
          const content = fs.readFileSync(filePath, 'utf-8');
          const lines = content.split('\n');

          // Parsear datos del archivo
          let playerName = 'Unknown';
          let round = 1;
          let kills = 0;
          let headshots = 0;
          let revives = 0;
          let downs = 0;
          let score = 0;

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.includes('Nombre:') || trimmed.includes('Jugador:')) {
              const extractedName = trimmed.split(':')[1]?.trim();
              if (extractedName) {
                playerName = extractedName;
              }
            }
            if (trimmed.includes('Ronda:') || trimmed.includes('Round:')) {
              round = parseInt(trimmed.split(':')[1]?.trim()) || round;
            }
            if (trimmed.includes('Kills:') || trimmed.includes('Asesinatos:')) {
              kills = parseInt(trimmed.split(':')[1]?.trim()) || kills;
            }
            if (trimmed.includes('Headshots:')) {
              headshots = parseInt(trimmed.split(':')[1]?.trim()) || headshots;
            }
            if (trimmed.includes('Revives:') || trimmed.includes('Reanimaciones:')) {
              revives = parseInt(trimmed.split(':')[1]?.trim()) || revives;
            }
            if (trimmed.includes('Downs:') || trimmed.includes('Caídas:')) {
              downs = parseInt(trimmed.split(':')[1]?.trim()) || downs;
            }
            if (trimmed.includes('Score:') || trimmed.includes('Puntuación:')) {
              score = parseInt(trimmed.split(':')[1]?.trim()) || score;
            }
          }

          // Procesar estadísticas del jugador usando estos datos
          processPlayerStats(guid, playerName, map, round, kills, headshots, revives, downs, score);

          // Crear entrada de partida reciente
          recentMatches.push({
            playerName,
            guid,
            map,
            round,
            kills,
            headshots,
            revives,
            downs,
            score,
            timestamp: Date.now(),
            fileName: file
          });

          console.log(`✅ Recent: ${playerName} - ${map} (Partida ${matchNumber}) - ${kills}K/${downs}D`);

        } catch (error) {
          console.warn(`Error procesando archivo recent ${file}:`, error);
        }
      }
    }

    // Ordenar por timestamp descendente (más reciente primero)
    recentMatches.sort((a, b) => b.timestamp - a.timestamp);

    // Guardar TODAS las partidas procesadas (sin límite)
    const finalMatches = recentMatches;

    // Guardar en el archivo JSON
    fs.writeFileSync(RECENT_MATCHES_FILE, JSON.stringify(finalMatches, null, 2));
    console.log(`💾 Guardadas ${finalMatches.length} partidas recientes desde directorio`);

  } catch (error) {
    console.error('Error procesando recent matches desde directorio:', error);
  }
}

// Función para obtener el conteo correcto de partidas jugadas desde archivos de índice
function getGamesPlayedCount(guid, map) {
  try {
    const indexFile = path.join(PLUTONIUM_BASE_DIR, 'recent', guid, `${map}_index.txt`);
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

// Función para recalcular todas las estadísticas de un mapa desde cero
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
    const guidPath = path.join(PLUTONIUM_BASE_DIR, 'recent', guid);

    if (!fs.existsSync(guidPath)) {
      return stats;
    }

    // Leer todos los archivos recent del mapa
    const files = fs.readdirSync(guidPath)
      .filter(file => file.startsWith(`${map}_recent_`) && file.endsWith('.txt'))
      .sort();

    for (const file of files) {
      try {
        const filePath = path.join(guidPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        let kills = 0, headshots = 0, revives = 0, downs = 0, score = 0, round = 1;

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.includes('Ronda:') || trimmed.includes('Round:')) {
            round = parseInt(trimmed.split(':')[1]?.trim()) || round;
          }
          if (trimmed.includes('Kills:') || trimmed.includes('Asesinatos:')) {
            kills = parseInt(trimmed.split(':')[1]?.trim()) || kills;
          }
          if (trimmed.includes('Headshots:')) {
            headshots = parseInt(trimmed.split(':')[1]?.trim()) || headshots;
          }
          if (trimmed.includes('Revives:') || trimmed.includes('Reanimaciones:')) {
            revives = parseInt(trimmed.split(':')[1]?.trim()) || revives;
          }
          if (trimmed.includes('Downs:') || trimmed.includes('Caídas:')) {
            downs = parseInt(trimmed.split(':')[1]?.trim()) || downs;
          }
          if (trimmed.includes('Score:') || trimmed.includes('Puntuación:') || trimmed.includes('Score Total:')) {
            score = parseInt(trimmed.split(':')[1]?.trim()) || score;
          }
        }

        // Actualizar estadísticas acumuladas
        stats.totalKills += kills;
        stats.totalHeadshots += headshots;
        stats.totalRevives += revives;
        stats.totalDowns += downs;
        stats.totalScore += score;

        // Actualizar topRound
        if (round > stats.topRound) {
          stats.topRound = round;
        }

      } catch (error) {
        console.warn(`Error procesando archivo ${file}:`, error);
      }
    }

    console.log(`📊 ${map}: ${files.length} archivos → ${stats.totalKills} kills, ${stats.totalDowns} downs`);

  } catch (error) {
    console.warn(`Error recalculando estadísticas para ${map}:`, error);
  }

  return stats;
}

// Función para recalcular estadísticas totales del jugador desde todos los mapas
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

// Función para procesar estadísticas de un jugador desde recent matches
function processPlayerStats(guid, playerName, map, round, kills, headshots, revives, downs, score) {
  // Cargar datos existentes
  let playersData = {};
  try {
    if (fs.existsSync(DATA_FILE)) {
      playersData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (error) {
    console.log('⚠️ Datos nuevos');
  }

  // Crear jugador si no existe
  if (!playersData[guid]) {
    playersData[guid] = {
      username: playerName,
      guid: guid,
      stats: { kills: 0, downs: 0, revives: 0, headshots: 0 },
      maps: {},
      economy: { balance: 0, transactions: [] }
    };
    console.log(`👤 Nuevo: ${playerName} (${guid})`);
  }

  // SIEMPRE actualizar el username si tenemos un nombre válido
  if (playerName && playerName !== 'Unknown' && playerName !== playersData[guid].username) {
    console.log(`📝 Actualizando username: ${playersData[guid].username} → ${playerName}`);
    playersData[guid].username = playerName;
  }

  // Actualizar mapa - RECALCULAR TODO desde cero para evitar duplicados
  const gamesPlayed = getGamesPlayedCount(guid, map);

  if (gamesPlayed === 0) {
    console.log(`⚠️ Sin datos de índice para ${map}, saltando...`);
    return;
  }

  // Recalcular TODAS las estadísticas del mapa desde cero
  const recalculatedStats = recalculateMapStats(guid, map);

  playersData[guid].maps[map] = {
    topRound: recalculatedStats.topRound,
    totalKills: recalculatedStats.totalKills,
    totalHeadshots: recalculatedStats.totalHeadshots,
    totalRevives: recalculatedStats.totalRevives,
    totalDowns: recalculatedStats.totalDowns,
    totalScore: recalculatedStats.totalScore,
    gamesPlayed: gamesPlayed,
    lastPlayed: new Date().toISOString().split('T')[0]
  };

  const mapStats = playersData[guid].maps[map];

  // Recalcular estadísticas TOTALES del jugador desde TODOS los mapas
  playersData[guid].stats = recalculatePlayerTotalStats(playersData[guid].maps);

  // Guardar partida reciente
  saveRecentMatch({
    playerName: playersData[guid].username,
    guid: guid,
    map: map,
    round: round,
    kills: kills,
    headshots: headshots,
    revives: revives,
    downs: downs,
    score: score,
    timestamp: Date.now(),
    fileName: `recent_${map}_${guid}`
  });

  console.log(`📊 Actualizado: ${playersData[guid].username} - ${map} (${gamesPlayed} partidas, ${mapStats.totalKills}K total, ${mapStats.totalDowns}D total)`);

  // Guardar
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(playersData, null, 2));
    console.log(`💾 Total: ${Object.keys(playersData).length} jugadores`);
  } catch (error) {
    console.error('❌ Error guardando:', error);
  }
}

// Función para procesar archivos del banco
function processBankFile(filePath) {
  const filename = path.basename(filePath, '.txt');
  const guid = filename;

  if (!guid) {
    console.log(`⚠️ Sin GUID en archivo bank: ${path.basename(filePath)}`);
    return;
  }

  // Cargar datos existentes
  let playersData = {};
  try {
    if (fs.existsSync(DATA_FILE)) {
      playersData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (error) {
    console.log('⚠️ Datos nuevos');
  }

  // Crear jugador si no existe
  if (!playersData[guid]) {
    playersData[guid] = {
      username: 'Unknown',
      guid: guid,
      stats: { kills: 0, downs: 0, revives: 0, headshots: 0 },
      maps: {},
      economy: { balance: 0, transactions: [] }
    };
    console.log(`👤 Nuevo (bank): ${guid}`);
  }

  // Leer balance del archivo
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let realBalance = 0;

    for (const line of lines) {
      if (line.includes('Balance:')) {
        realBalance = parseInt(line.split(':')[1].trim()) || 0;
        break;
      }
    }

    if (realBalance > 0) {
      playersData[guid].economy.balance = realBalance;
      // Agregar transacción solo si no existe
      const exists = playersData[guid].economy.transactions.some(t => t.amount === realBalance);
      if (!exists) {
        playersData[guid].economy.transactions.push({
          id: `bank_${guid}_${Date.now()}`,
          description: 'Saldo bancario actualizado',
          amount: realBalance,
          date: new Date().toISOString().split('T')[0]
        });
      }
      console.log(`💰 Balance actualizado: ${playersData[guid].username || guid} - $${realBalance}`);
    }
  } catch (error) {
    console.log(`⚠️ Error leyendo balance de ${path.basename(filePath)}`);
  }

  // Procesar transacciones bancarias
  processBankTransactionsFile(guid, playersData);

  // Guardar
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(playersData, null, 2));
    console.log(`💾 Total: ${Object.keys(playersData).length} jugadores`);
  } catch (error) {
    console.error('❌ Error guardando:', error);
  }
}

// Función para procesar archivos de transacciones bancarias (nuevo formato por carpetas)
function processBankTransactionsFile(guid, playersData) {
  const playerTransactionsDir = path.join(PLUTONIUM_BASE_DIR, 'bank_transactions', guid);

  if (!fs.existsSync(playerTransactionsDir)) {
    return; // No hay directorio de transacciones
  }

  try {
    // Inicializar array de transacciones si no existe
    if (!playersData[guid].economy.transactions) {
      playersData[guid].economy.transactions = [];
    }

    // Leer todos los archivos de transacciones en el directorio del jugador
    const transactionFiles = fs.readdirSync(playerTransactionsDir)
      .filter(file => file.endsWith('.txt') && file !== 'bank_index.txt' && (
        file.startsWith('deposit_') ||
        file.startsWith('withdraw_') ||
        file.startsWith('deposit_from_player_') ||
        file.startsWith('pay_to_player_')
      ))
      .sort();

    for (const transactionFile of transactionFiles) {
      try {
        const filePath = path.join(playerTransactionsDir, transactionFile);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        // Parsear datos de la transacción
        let transactionData = {
          id: '',
          type: '',
          number: 0,
          playerName: '',
          playerId: '',
          timestamp: 0,
          amount: 0,
          balanceBefore: 0,
          balanceAfter: 0,
          description: ''
        };

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.includes('Tipo: ')) {
            transactionData.type = trimmed.split(': ')[1];
          }
          if (trimmed.includes('Número: ')) {
            transactionData.number = parseInt(trimmed.split(': ')[1]) || 0;
          }
          if (trimmed.includes('Jugador: ')) {
            const playerNameRaw = trimmed.split(': ')[1] || '';
            // Si el nombre es "Jugador [GUID]", dejar vacío para que se actualice después
            if (playerNameRaw.startsWith('Jugador ')) {
              transactionData.playerName = '';
            } else {
              transactionData.playerName = playerNameRaw;
            }
          }
          if (trimmed.includes('Jugador ID: ')) {
            transactionData.playerId = trimmed.split(': ')[1];
          }
          if (trimmed.includes('Fecha/Hora: ')) {
            transactionData.timestamp = parseInt(trimmed.split(': ')[1]) || 0;
          }
          if (trimmed.includes('Monto: ')) {
            transactionData.amount = parseInt(trimmed.split(': ')[1]) || 0;
          }
          if (trimmed.includes('Balance Antes: ')) {
            transactionData.balanceBefore = parseInt(trimmed.split(': ')[1]) || 0;
          }
          if (trimmed.includes('Balance Después: ')) {
            transactionData.balanceAfter = parseInt(trimmed.split(': ')[1]) || 0;
          }
          if (trimmed.includes('Descripción: ')) {
            transactionData.description = trimmed.split(': ')[1] || '';
          }
        }

        // Si el jugador no tiene nombre establecido, usar el de la transacción
        if ((!playersData[guid].username || playersData[guid].username === 'Unknown') && transactionData.playerName) {
          playersData[guid].username = transactionData.playerName;
          console.log(`📝 Nombre actualizado desde transacción bancaria: ${transactionData.playerName} (${guid})`);
        }

        // Crear ID único para la transacción
        const transactionId = `txn_${guid}_${transactionData.type}_${transactionData.number}`;

        // Verificar si la transacción ya existe
        const exists = playersData[guid].economy.transactions.some(t => t.id === transactionId);
        if (!exists && transactionData.timestamp > 0) {
          const transaction = {
            id: transactionId,
            type: transactionData.type,
            amount: transactionData.amount,
            balanceBefore: transactionData.balanceBefore,
            balanceAfter: transactionData.balanceAfter,
            description: transactionData.description,
            date: new Date(transactionData.timestamp).toISOString(),
            timestamp: transactionData.timestamp,
            number: transactionData.number
          };

          playersData[guid].economy.transactions.push(transaction);
        }

      } catch (error) {
        console.warn(`⚠️ Error procesando archivo de transacción ${transactionFile}:`, error);
      }
    }

    // Ordenar transacciones por timestamp (más reciente primero)
    playersData[guid].economy.transactions.sort((a, b) => b.timestamp - a.timestamp);

    console.log(`💸 Procesadas ${playersData[guid].economy.transactions.length} transacciones bancarias para ${playersData[guid].username || guid}`);

  } catch (error) {
    console.warn(`⚠️ Error procesando directorio de transacciones bancarias para ${guid}:`, error);
  }
}

// API Endpoint para obtener transacciones bancarias de un jugador específico
function getBankTransactionsAPI(playerGuid) {
  const playerTransactionsDir = path.join(PLUTONIUM_BASE_DIR, 'bank_transactions', playerGuid);

  if (!fs.existsSync(playerTransactionsDir)) {
    return { transactions: [], summary: { totalDeposits: 0, totalWithdrawals: 0, netBalance: 0 } };
  }

  try {
    const transactions = [];

    // Leer todos los archivos de transacciones
    const transactionFiles = fs.readdirSync(playerTransactionsDir)
      .filter(file => file.endsWith('.txt') && file !== 'bank_index.txt' && (
        file.startsWith('deposit_') ||
        file.startsWith('withdraw_') ||
        file.startsWith('deposit_from_player_') ||
        file.startsWith('pay_to_player_')
      ))
      .sort();

    let totalDeposits = 0;
    let totalWithdrawals = 0;

    for (const transactionFile of transactionFiles) {
      try {
        const filePath = path.join(playerTransactionsDir, transactionFile);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        // Parsear datos de la transacción
        let transactionData = {
          id: '',
          type: '',
          number: 0,
          playerName: '',
          playerId: '',
          timestamp: 0,
          amount: 0,
          balanceBefore: 0,
          balanceAfter: 0,
          description: ''
        };

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.includes('Tipo: ')) {
            transactionData.type = trimmed.split(': ')[1];
          }
          if (trimmed.includes('Número: ')) {
            transactionData.number = parseInt(trimmed.split(': ')[1]) || 0;
          }
          if (trimmed.includes('Jugador: ')) {
            const playerNameRaw = trimmed.split(': ')[1] || '';
            // Si el nombre es "Jugador [GUID]", dejar vacío para que se actualice después
            if (playerNameRaw.startsWith('Jugador ')) {
              transactionData.playerName = '';
            } else {
              transactionData.playerName = playerNameRaw;
            }
          }
          if (trimmed.includes('Jugador ID: ')) {
            transactionData.playerId = trimmed.split(': ')[1];
          }
          if (trimmed.includes('Fecha/Hora: ')) {
            transactionData.timestamp = parseInt(trimmed.split(': ')[1]) || 0;
          }
          if (trimmed.includes('Monto: ')) {
            transactionData.amount = parseInt(trimmed.split(': ')[1]) || 0;
          }
          if (trimmed.includes('Balance Antes: ')) {
            transactionData.balanceBefore = parseInt(trimmed.split(': ')[1]) || 0;
          }
          if (trimmed.includes('Balance Después: ')) {
            transactionData.balanceAfter = parseInt(trimmed.split(': ')[1]) || 0;
          }
          if (trimmed.includes('Descripción: ')) {
            transactionData.description = trimmed.split(': ')[1] || '';
          }
        }

        // Crear ID único para la transacción
        const transactionId = `txn_${playerGuid}_${transactionData.type}_${transactionData.number}`;

        if (transactionData.timestamp > 0) {
          const transaction = {
            id: transactionId,
            type: transactionData.type,
            amount: transactionData.amount,
            balanceBefore: transactionData.balanceBefore,
            balanceAfter: transactionData.balanceAfter,
            description: transactionData.description,
            date: new Date(transactionData.timestamp).toISOString(),
            timestamp: transactionData.timestamp,
            number: transactionData.number
          };

          transactions.push(transaction);

          // Actualizar contadores
          if (transactionData.type === 'deposit' || transactionData.type === 'deposit_from_player') {
            totalDeposits += transactionData.amount;
          } else if (transactionData.type === 'withdraw' || transactionData.type === 'pay_to_player') {
            totalWithdrawals += transactionData.amount;
          }
        }

      } catch (error) {
        console.warn(`⚠️ Error procesando archivo de transacción ${transactionFile}:`, error);
      }
    }

    // Ordenar transacciones por timestamp (más reciente primero)
    transactions.sort((a, b) => b.timestamp - a.timestamp);

    const summary = {
      totalDeposits,
      totalWithdrawals,
      netBalance: totalDeposits - totalWithdrawals,
      transactionCount: transactions.length
    };

    return { transactions, summary };

  } catch (error) {
    console.warn(`⚠️ Error procesando directorio de transacciones bancarias para ${playerGuid}:`, error);
    return { transactions: [], summary: { totalDeposits: 0, totalWithdrawals: 0, netBalance: 0 } };
  }
}

// Función integrada de process-recent.js para mantener compatibilidad
function processRecentMatchesFromDir() {
  try {
    const recentDir = path.join(PLUTONIUM_BASE_DIR, 'recent');
    const recentMatches = [];

    if (!fs.existsSync(recentDir)) {
      console.log('❌ Directorio de recent matches no encontrado:', recentDir);
      console.log('💡 Asegúrate de que Plutonium esté instalado y hayas jugado algunas partidas');
      return;
    }

    // Leer todos los subdirectorios (cada uno es un GUID)
    const guidDirs = fs.readdirSync(recentDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`🔍 Procesando recent matches para ${guidDirs.length} jugadores...`);

    for (const guid of guidDirs) {
      const guidPath = path.join(recentDir, guid);

      // Leer todos los archivos en el directorio del GUID
      const files = fs.readdirSync(guidPath)
        .filter(file => file.endsWith('.txt'))
        .sort(); // Ordenar alfabéticamente

      console.log(`📁 Procesando ${files.length} archivos para GUID ${guid}`);

      for (const file of files) {
        try {
          const filePath = path.join(guidPath, file);
          const fileName = path.basename(file, '.txt');

          // Parsear el nombre del archivo
          const parts = fileName.split('_recent_');
          if (parts.length !== 2) {
            console.log(`⚠️ Nombre de archivo inválido: ${fileName} (se esperaba formato mapa_recent_N)`);
            continue;
          }

          const map = parts[0];
          const matchNumber = parseInt(parts[1]);

          if (isNaN(matchNumber)) {
            console.log(`⚠️ Número de partida inválido en: ${fileName}`);
            continue;
          }

          // Leer contenido del archivo
          const content = fs.readFileSync(filePath, 'utf-8');
          const lines = content.split('\n');

          // Parsear datos del archivo
          let playerName = 'Unknown';
          let round = 1;
          let kills = 0;
          let headshots = 0;
          let revives = 0;
          let downs = 0;
          let score = 0;

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.includes('Nombre:') || trimmed.includes('Jugador:')) {
              playerName = trimmed.split(':')[1]?.trim() || playerName;
            }
            if (trimmed.includes('Ronda:') || trimmed.includes('Round:')) {
              round = parseInt(trimmed.split(':')[1]?.trim()) || round;
            }
            if (trimmed.includes('Kills:') || trimmed.includes('Asesinatos:')) {
              kills = parseInt(trimmed.split(':')[1]?.trim()) || kills;
            }
            if (trimmed.includes('Headshots:')) {
              headshots = parseInt(trimmed.split(':')[1]?.trim()) || headshots;
            }
            if (trimmed.includes('Revives:') || trimmed.includes('Reanimaciones:')) {
              revives = parseInt(trimmed.split(':')[1]?.trim()) || revives;
            }
            if (trimmed.includes('Downs:') || trimmed.includes('Caídas:')) {
              downs = parseInt(trimmed.split(':')[1]?.trim()) || downs;
            }
            if (trimmed.includes('Score:') || trimmed.includes('Puntuación:') || trimmed.includes('Score Total:')) {
              score = parseInt(trimmed.split(':')[1]?.trim()) || score;
            }
          }

          // Procesar estadísticas del jugador usando estos datos
          processPlayerStats(guid, playerName, map, round, kills, headshots, revives, downs, score);

          // Crear entrada de partida reciente
          const matchData = {
            playerName,
            guid,
            map,
            round,
            kills,
            headshots,
            revives,
            downs,
            score,
            timestamp: Date.now(),
            fileName: file
          };

          recentMatches.push(matchData);
          console.log(`✅ Procesada: ${playerName} (${guid}) - ${map} - Partida ${matchNumber} - Ronda ${round} - ${kills} kills`);

        } catch (error) {
          console.warn(`❌ Error procesando archivo ${file}:`, error.message);
        }
      }
    }

    if (recentMatches.length === 0) {
      console.log('⚠️ No se encontraron partidas recientes para procesar');
      return;
    }

    // Ordenar por timestamp descendente (más reciente primero)
    recentMatches.sort((a, b) => b.timestamp - a.timestamp);

    // Mantener solo las últimas 50 partidas (como en process-recent.js)
    const finalMatches = recentMatches.slice(0, 50);

    // Crear directorio data si no existe
    const dataDir = path.dirname(RECENT_MATCHES_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Guardar en el archivo JSON
    fs.writeFileSync(RECENT_MATCHES_FILE, JSON.stringify(finalMatches, null, 2));
    console.log(`💾 Guardadas ${finalMatches.length} partidas recientes en ${RECENT_MATCHES_FILE}`);

    // Mostrar resumen
    const players = [...new Set(finalMatches.map(m => m.playerName))];
    const maps = [...new Set(finalMatches.map(m => m.map))];
    console.log(`📊 Jugadores: ${players.join(', ')}`);
    console.log(`🗺️ Mapas: ${maps.join(', ')}`);

  } catch (error) {
    console.error('❌ Error procesando recent matches:', error);
  }
}

// Función para guardar partidas recientes
function saveRecentMatch(matchData) {
  try {
    let recentMatches = [];
    if (fs.existsSync(RECENT_MATCHES_FILE)) {
      recentMatches = JSON.parse(fs.readFileSync(RECENT_MATCHES_FILE, 'utf-8'));
    }

    // Agregar nueva partida al inicio
    recentMatches.unshift(matchData);

    // Mantener TODAS las partidas (sin límite)

    fs.writeFileSync(RECENT_MATCHES_FILE, JSON.stringify(recentMatches, null, 2));
  } catch (error) {
    console.log('⚠️ Error guardando partida reciente:', error);
  }
}



// Configuración
const PLUTONIUM_BASE_DIR = path.join(process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Local'), 'Plutonium', 'storage', 't6', 'raw', 'scriptdata');
const BANK_DIR = path.join(PLUTONIUM_BASE_DIR, 'bank');
const DATA_FILE = path.join(process.cwd(), 'data/data_player.json');
const RECENT_MATCHES_FILE = path.join(process.cwd(), 'data/recent_matches.json');

console.log('🎯 WATCHDOG COMPLETO - RECENT MATCHES + BANK ACTIVADO');
console.log(`💾 Data: ${DATA_FILE}`);
console.log(`📁 Recent: ${path.join(PLUTONIUM_BASE_DIR, 'recent')}`);
console.log(`📁 Bank: ${BANK_DIR}`);
console.log(`📁 Bank Transactions: ${path.join(PLUTONIUM_BASE_DIR, 'bank_transactions')}`);
console.log(`📄 Recent JSON: ${RECENT_MATCHES_FILE}`);

// Crear directorios
[BANK_DIR, path.dirname(DATA_FILE)].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Procesar archivos de bank existentes
if (fs.existsSync(BANK_DIR)) {
  const bankFiles = fs.readdirSync(BANK_DIR);
  console.log(`\n🔍 Procesando ${bankFiles.length} archivos de bank...`);
  for (const file of bankFiles) {
    if (file.endsWith('.txt')) {
      processBankFile(path.join(BANK_DIR, file));
    }
  }
  console.log(`✅ Archivos de bank procesados.\n`);
}

// Procesamiento inicial desde recent matches (usa la función integrada de process-recent.js)
processRecentMatchesFromDir();

console.log('\n🚀 Modo: Cambios en tiempo real activado\n');

// Watchers
let timer;
const DELAY = 500;

// Función para procesar cambios en el directorio de bank
function onBankChange(event, filename, dir) {
  if (!filename || !filename.endsWith('.txt')) return;

  console.log(`\n🎯 Archivo bank cambió: ${filename}`);

  clearTimeout(timer);
  timer = setTimeout(() => {
    processBankFile(path.join(dir, filename));
    console.log('✅ Archivo bank procesado\n');
  }, DELAY);
}

// Función para procesar cambios en el directorio de recent matches
function onRecentChange(event, filename, dir) {
  if (!filename) return;

  console.log(`🎯 Archivo recent cambió: ${filename}`);

  clearTimeout(timer);
  timer = setTimeout(() => {
    processRecentMatchesFromDir();
    console.log('✅ Recent matches procesados\n');
  }, DELAY);
}

// Monitorear directorio de bank
if (fs.existsSync(BANK_DIR)) {
  fs.watch(BANK_DIR, (e, f) => onBankChange(e, f, BANK_DIR));
  console.log('👁️ Monitoreando banco...');
}

// Monitorear directorio de recent matches
const RECENT_DIR = path.join(PLUTONIUM_BASE_DIR, 'recent');
if (fs.existsSync(RECENT_DIR)) {
  // Usar watch recursivo para detectar cambios en subdirectorios
  fs.watch(RECENT_DIR, { recursive: true }, (e, f) => onRecentChange(e, f, RECENT_DIR));
  console.log('👁️ Monitoreando recent matches...');
}

console.log('\n🎉 WATCHDOG COMPLETO LISTO');
console.log('💡 Lee datos REALES del directorio AppData/Local/Plutonium/');
console.log('💡 Funciona desde CUALQUIER ubicación del proyecto');
console.log('💡 Procesa balances del directorio bank/');
console.log('💡 Registra transacciones en carpetas organizadas por GUID');
console.log('💡 Estadísticas se ACUMULAN correctamente');
console.log('💡 Genera recent_matches.json automáticamente');
console.log('💡 Monitoreo continuo de cambios');
console.log('💡 Sin límites de almacenamiento');
console.log('💡 Ctrl+C para detener\n');

// Mantener vivo
process.on('SIGINT', () => {
  console.log('\n👋 Watchdog Recent Matches + Bank detenido');
  process.exit(0);
});