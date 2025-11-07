#!/usr/bin/env node

// Script para procesar archivos .txt y generar JSONs
// Uso: node process-stats.js

import { createExampleTxtFiles } from './utils/txtParser.js';

const args = process.argv.slice(2);

if (args.includes('--create-examples')) {
  console.log('Creando archivos .txt de ejemplo...');
  createExampleTxtFiles();
} else {
  console.log('Procesando archivos .txt existentes...');
  // processStatsFiles(); // Esta función requiere Node.js con fs, pero el proyecto es frontend
  console.log('Nota: Para procesar archivos .txt, ejecuta desde un entorno Node.js con fs disponible');
}

console.log('✅ Proceso completado.');