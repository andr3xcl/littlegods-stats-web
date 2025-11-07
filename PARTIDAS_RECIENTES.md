# 🎮 Sistema de Partidas Recientes

## Descripción

La tarjeta de partidas recientes muestra en tiempo real las últimas 5 partidas del jugador seleccionado en Black Ops 2 Zombies, ordenadas de más reciente a más antigua. Las partidas se actualizan automáticamente cada 3 segundos.

**Importante**: 
- La tarjeta **solo aparece en la sección de Jugadores**
- Se muestra en la **columna derecha** junto con "Overall Stats" y "Bank Account"
- Muestra **únicamente las partidas del jugador seleccionado**
- Diseño compacto y elegante similar a las demás tarjetas
- No aparece en la página de Home

## Características

### 📊 Información Mostrada por Partida

- **Imagen del mapa**: Muestra la imagen del mapa jugado
- **Nombre del mapa**: Nuketown Zombies, TranZit, Origins, etc.
- **Ronda alcanzada**: Máxima ronda alcanzada en la partida
- **Jugador**: Nombre del jugador
- **Hora**: Hora exacta de la partida
- **Estadísticas**:
  - 🎯 Kills (bajas)
  - 💀 Headshots (disparos en la cabeza)
  - 💚 Revives (reanimaciones)
  - 🏆 Score (puntuación total)
  - ⚠️ Downs (caídas) - solo si hay

### 🔥 Indicador Visual

La partida más reciente se destaca con:
- Borde naranja brillante
- Etiqueta "MÁS RECIENTE"
- Sombra especial

### 🔄 Actualización en Tiempo Real

El sistema lee del archivo `data/recent_matches.json` que es actualizado automáticamente por el watchdog cuando detecta cambios en los archivos de estadísticas.

## Cómo Funciona

### Nuevo Sistema (Directorio de Recent Matches)

1. **Script detecta archivos**: El script `process-recent.js` lee todos los archivos en `AppData\Local\Plutonium\storage\t6\raw\scriptdata\recent\GUID\*`
2. **Parsea nombres de archivo**: Los archivos siguen el formato `mapa_recent_N.txt` (ej: `rooftop_recent_1.txt`)
3. **Extrae datos**: Lee las estadísticas directamente del contenido de cada archivo
4. **Genera JSON**: Crea `recent_matches.json` con todas las partidas recientes
5. **Watchdog monitorea**: El watchdog detecta cambios en el directorio y actualiza automáticamente
6. **Frontend filtra**: El banner lee el archivo JSON y filtra por el GUID del jugador seleccionado

### Sistema Anterior (Archivos de Estadísticas)
- El watchdog también puede guardar partidas recientes cuando procesa archivos de estadísticas normales
- Se mantiene como respaldo y para compatibilidad

## Archivos Involucrados

### Scripts de Procesamiento
- `utils/process-recent.js`:
  - Script independiente para procesar recent matches desde el directorio
  - Se ejecuta manualmente o puede ser llamado por otros scripts
  - Procesa todos los archivos `mapa_recent_N.txt` de cada jugador
- `utils/watchdog.js`:
  - Función `processRecentMatchesFromDir()`: Procesa recent matches desde directorio
  - Monitorea cambios en tiempo real en el directorio de recent matches
  - Función `saveRecentMatch()`: Guarda partidas recientes del sistema anterior

### Frontend
- `components/RecentMatchesBanner.tsx`:
  - Componente que muestra el banner lateral
  - Acepta prop `playerGuid` para filtrar partidas
  - Se actualiza cada 3 segundos
  - Muestra imágenes de mapas y estadísticas
- `App.tsx`:
  - Controla cuándo mostrar el banner (solo en vista "Jugadores")
  - Pasa el GUID del jugador seleccionado al banner

### Datos
- `data/recent_matches.json`:
  - Archivo JSON generado con las últimas 50 partidas
  - Ordenadas por timestamp (más reciente primero)
  - Contiene datos de todos los jugadores

### Directorio de Plutonium
- `AppData\Local\Plutonium\storage\t6\raw\scriptdata\recent\`:
  - Cada subdirectorio es un GUID de jugador
  - Archivos: `mapa_recent_N.txt` (ej: `rooftop_recent_1.txt`)
  - Contienen estadísticas individuales de cada partida reciente

## Ejemplo de Datos

```json
[
  {
    "playerName": "andresito_21",
    "guid": "3465813",
    "map": "nuked",
    "round": 15,
    "kills": 234,
    "headshots": 56,
    "revives": 3,
    "downs": 2,
    "score": 15670,
    "timestamp": 1729982400000,
    "fileName": "nuked_3465813.txt"
  }
]
```

## Mapas Soportados

- Nuketown Zombies (`nuked`)
- TranZit (`transit`)
- Farm (`farm`)
- Town (`town`)
- Mob of the Dead (`prison`)
- Origins (`tomb`)
- Buried (`buried`)
- Die Rise (`rooftop`, `processing`)

## Cómo Usar el Nuevo Sistema

### Procesamiento Manual
```bash
# Procesar recent matches desde el directorio de Plutonium
node utils/process-recent.js
```

### Monitoreo Automático
```bash
# El watchdog ahora también monitorea el directorio de recent matches
node utils/watchdog.js
```

### Estructura de Archivos Esperada
```
AppData\Local\Plutonium\storage\t6\raw\scriptdata\recent\
├── 6076229\                    # GUID del jugador
│   ├── rooftop_recent_1.txt    # Partida 1 en rooftop
│   ├── rooftop_recent_2.txt    # Partida 2 en rooftop
│   ├── tomb_recent_1.txt       # Partida 1 en tomb
│   └── town_recent_1.txt       # Partida 1 en town
└── 1234567\                    # Otro jugador
    └── nuked_recent_1.txt      # Partida 1 en nuked
```

### Formato de Contenido de Archivos
Cada archivo `mapa_recent_N.txt` debe contener líneas como:
```
Nombre: Littlegods
Mapa: rooftop
Ronda: 5
Kills: 25
Headshots: 5
Revives: 2
Downs: 1
Score: 3500
```

## Ubicación y Visibilidad

- **Ubicación**: Lado izquierdo de la pantalla
- **Ancho**: 320px fijo
- **Scroll**: Vertical cuando hay muchas partidas
- **Visibilidad**:
  - ✅ Visible en sección "Jugadores" cuando hay un jugador seleccionado
  - ❌ NO visible en la página "Home"
  - 🔄 Se actualiza al cambiar de jugador

---

**Nota**: El sistema NO acumula estadísticas. Cada entrada representa UNA SOLA partida con sus estadísticas individuales.

