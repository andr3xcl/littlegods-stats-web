import React, { useState, useEffect } from 'react';
import { Target, Skull, Heart, Award, Map as MapIcon, Clock, ChevronLeft, ChevronRight, ChevronDown, X, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useGSAP } from '../utils/gsap';

interface WeaponData {
  name: string;
  displayName: string;
  kills: number;
}

interface PerkData {
  name: string;
  displayName: string;
  uses: number;
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
  weapons: Record<string, WeaponData>;
  perks: Record<string, PerkData>;
  bestWeapon?: {
    name: string;
    displayName: string;
    kills: number;
  };
}

interface RecentMatchesBannerProps {
  playerGuid: string;
}

const MAP_NAMES: Record<string, string> = {
  'nuked': 'Nuketown',
  'transit': 'TranZit',
  'farm': 'Farm',
  'town': 'Town',
  'prison': 'Mob of the Dead',
  'tomb': 'Origins',
  'buried': 'Processing',
  'rooftop': 'Highrise',
  'busdepot': 'Bus Depot'
};

const MAP_IMAGES: Record<string, string> = {
  'nuked': './data/images/load_maps/zm_nuked.jpg',
  'transit': './data/images/load_maps/zm_transit.jpg',
  'farm': './data/images/load_maps/zm_farm.jpg',
  'town': './data/images/load_maps/zm_town.jpg',
  'prison': './data/images/load_maps/zm_prison.jpg',
  'tomb': './data/images/load_maps/zm_tomb.jpg',
  'rooftop': './data/images/load_maps/zm_highrise.jpg',
  'processing': './data/images/load_maps/zm_buried.jpg',
  'busdepot': './data/images/load_maps/zm_busdepot.jpg'
};

const WEAPON_IMAGES: Record<string, string> = {
  // Pistolas
  'M1911': './data/images/weapons/M1911_menu_icon_BOII.jpg',
  'Python': './data/images/weapons/Python_Menu_Icon_BOII.jpg',
  'Executioner': './data/images/weapons/Executioner_Menu_Icon_BOII.jpg',
  'KAP-40': './data/images/weapons/KAP-40_Menu_Icon_BOII.jpg',
  'Five-Seven': './data/images/weapons/Five-Seven.jpg',
  'Five-Seven Dual Wield': './data/images/weapons/Five_Seven_Dual_Wield_menu_icon_BOII.jpg',
  'B93R': './data/images/weapons/B23R_Menu_Icon_BOII.jpg',
  'Mauser C96': './data/images/weapons/Mauser_C96_menu_icon_BOII.jpg',

  // SMGs
  'MP5': './data/images/weapons/MP5_menu_icon_BOII.jpg',
  'PDW-57': './data/images/weapons/PDW-57_Menu_Icon_BOII.jpg',
  'AK-74u': './data/images/weapons/AK-74u_Menu_Icon_BOII.jpg',
  'Chicom CQB': './data/images/weapons/Chicom_CQB_Menu_Icon_BOII.jpg',
  'MP40': './data/images/weapons/MP40_menu_icon_BOII.jpg',
  'Skorpion': './data/images/weapons/Skorpion_EVO_Menu_Icon_BOII.jpg',
  'Evoskorpion': './data/images/weapons/Skorpion_EVO_Menu_Icon_BOII.jpg',
  'Chicago Typewriter': './data/images/weapons/M1927_Menu_Icon_BOII.jpg',
  'UZI': './data/images/weapons/Uzi_menu_icon_BOII.jpg',

  // Rifles de Asalto
  'M14': './data/images/weapons/M14_menu_icon_BOII.jpg',
  'FAL': './data/images/weapons/FAL_menu_icon_BOII.jpg',
  'Galil': './data/images/weapons/Galil_menu_icon_BOII.jpg',
  'M16': './data/images/weapons/Colt_M16A1_menu_icon_BOII.jpg',
  'TAR-21': './data/images/weapons/MTAR_Menu_Icon_BOII.jpg',
  'Type 25': './data/images/weapons/Type_25_Menu_Icon_BOII.jpg',
  'M8A1': './data/images/weapons/M8A1_Menu_Icon_BOII.jpg',
  'AN-94': './data/images/weapons/AN-94_menu_icon_BOII.jpg',
  'SCAR-H': './data/images/weapons/SCAR-H_Menu_Icon_BOII.jpg',
  'AK-47': './data/images/weapons/AK47_menu_icon_BOII.jpg',
  'M27': './data/images/weapons/M27_Menu_Icon_BOII.jpg',

  // LMGs
  'RPD': './data/images/weapons/RPD_Menu_Icon_BOII.jpg',
  'LSAT': './data/images/weapons/LSAT_Menu_Icon_BOII.jpg',
  'MG08': './data/images/weapons/MG08_menu_icon_Origins_BOII.jpg',
  'HAMR': './data/images/weapons/HAMR_Menu_Icon_BOII.jpg',

  // Escopetas
  'Remington 870 MCS': './data/images/weapons/R-870_MCS_Menu_Icon_BOII.jpg',
  'Olympia': './data/images/weapons/Olympia_menu_icon_BOII.jpg',
  'S12': './data/images/weapons/S12_Menu_Icon_BOII.jpg',
  'SMR': './data/images/weapons/SMR_Menu_Icon_BOII.jpg',
  'KSG': './data/images/weapons/KSG_Menu_Icon_BOII.jpg',

  // Snipers
  'DSR 50': './data/images/weapons/DSR_50_menu_icon_BOII.jpg',
  'Ballista': './data/images/weapons/Ballista_Menu_Icon_BOII.jpg',
  'Barrett M82A1': './data/images/weapons/Barrett_M82A1_menu_icon_BOII.jpg',
  'SVU-AS': './data/images/weapons/SVU-AS_Menu_Icon_BOII.jpg',

  // Lanzadores
  'RPG': './data/images/weapons/RPG_Menu_Icon_BOII.jpg',
  'War Machine': './data/images/weapons/War_Machine_Side_View_BOII.jpg',
  'Death Machine': './data/images/weapons/Death_Machine_menu_icon_BOII.jpg',

  // Wonder Weapons
  'Ray Gun': './data/images/weapons/Ray_Gun_Menu_Icon_BOII.jpg',
  'Ray Gun Mark II': './data/images/weapons/Ray_Gun_Mark_II_menu_icon_BOII.jpg',
  'Blundergat': './data/images/weapons/Blundergat_Menu_Icon_BOII.jpg',
  'Paralyzer': './data/images/weapons/Paralyzer_menu_icon_BOII.jpg',
  'Sliquifier': './data/images/weapons/Sliquifier_Menu_Icon_BOII.jpg',

  // Cuchillos
  'Ballistic Knife': './data/images/weapons/Spring_Knife_Create-a-Class_BOII.jpg',

  // Armas faltantes de la carpeta
  'Remington New Model Army': './data/images/weapons/Remington_New_Model_Army_menu_icon_BOII.jpg',
  'Katana': './data/images/weapons/Katana_menu_icon_WaW.jpg',
  'STG-44': './data/images/weapons/STG-44_menu_icon_BOII.jpg',
  'Staff of Fire': './data/images/weapons/Staff_of_Fire_Origins_menu_icon_BOII.jpg',
  'Staff of Ice': './data/images/weapons/Staff_of_Ice_Origins_menu_icon_BOII.jpg',
  'Staff of Lightning': './data/images/weapons/Staff_of_Lightning_Origins_menu_icon_BOII.jpg',
  'Staff of Wind': './data/images/weapons/Staff_of_Wind_Origins_menu_icon_BOII.jpg'
};

const PERK_IMAGES: Record<string, string> = {
  'Juggernog': './data/images/perks_machine/Juggernog_Machine_Render.jpg',
  'Quick Revive': './data/images/perks_machine/Quick_Revive_Machine_Render.jpg',
  'Speed Cola': './data/images/perks_machine/Speed_Cola_Machine_Render.jpg',
  'Double Tap': './data/images/perks_machine/Double_Tap_II_machine_BOII.jpg',
  'Stamin-Up': './data/images/perks_machine/Stamin-Up_Machine_Render.jpg',
  'PhD Flopper': './data/images/perks_machine/PhD_Flopper_Machine_Render.jpg',
  'Deadshot Daiquiri': './data/images/perks_machine/Deadshot_Daiquiri_Machine_Render.jpg',
  'Mule Kick': './data/images/perks_machine/Mule_Kick_Machine_Render.jpg',
  'Electric Cherry': './data/images/perks_machine/Electric_Cherry_machine_BOII.jpg',
  'Who\'s Who': './data/images/perks_machine/Tombstone_Machine_BOII.jpg',
  'Tombstone': './data/images/perks_machine/Tombstone_Machine_BOII.jpg',
  'Vulture Aid Elixir': './data/images/perks_machine/Vulture_Aid_Elixir_Machine.jpg',
  'Widow\'s Wine': './data/images/perks_machine/Widow%27s_Wine_model_BO3.jpg'
};

// Función para obtener el nombre base de un arma (sin sufijos de upgrade)
function getWeaponBaseName(weaponName: string): string {
  // Si ya es un nombre base conocido, devolverlo
  if (WEAPON_IMAGES[weaponName]) {
    return weaponName;
  }

  // Convertir a minúsculas para procesamiento
  let cleanName = weaponName.toLowerCase().trim();

  // Primero remover palabras de upgrade del nombre display (como "Upgraded", "Extended", etc.)
  const displayUpgradeWords = [
    /\s+upgraded\d*/gi,     // " Upgraded", " Upgraded2", "Upgraded4", etc.
    /\s+extended\s+clip/gi, // " Extended Clip"
    /\s+extended\d*/gi,     // " Extended", etc.
    /\s+dual\s+wield/gi,    // " Dual Wield"
    /\s+wield/gi,           // " Wield"
    /\+rangefinder/gi,      // "+rangefinder"
    /\+steadyaim/gi,        // "+steadyaim"
    /\+stalker/gi,          // "+stalker"
    /\+extclip/gi,          // "+extclip"
    /\+reflex\d*/gi,        // "+reflex" o "+reflex2"
    /\s+extclip/gi,         // " extclip" (for cases like "Extclip+reflex")
    /\s+reflex/gi           // " reflex" (for cases like "+reflex")
  ];

  for (const pattern of displayUpgradeWords) {
    cleanName = cleanName.replace(pattern, '');
  }

  // Luego remover sufijos técnicos de upgrade y attachments
  const upgradePatterns = [
    /_upgraded_zm/gi,      // "_upgraded_zm"
    /_reflex_zm/gi,        // "_reflex_zm"
    /_extclip_zm/gi,       // "_extclip_zm"
    /_stalker_zm/gi,       // "_stalker_zm"
    /_akimbo_zm/gi,        // "_akimbo_zm"
    /_steadyaim_zm/gi,     // "_steadyaim_zm"
    /_dualclip_zm/gi,      // "_dualclip_zm"
    /_zm/gi,               // "_zm" general
    /\+reflex\d*/gi,       // "+reflex" o "+reflex2"
    /\+rangefinder/gi,     // "+rangefinder"
    /\+steadyaim/gi,       // "+steadyaim"
    /\+stalker/gi,         // "+stalker"
    /\+extclip/gi          // "+extclip"
  ];

  // Aplicar todos los patrones de limpieza
  for (const pattern of upgradePatterns) {
    cleanName = cleanName.replace(pattern, '');
  }

  // Limpiar espacios extra y capitalizar
  cleanName = cleanName.replace(/\s+/g, ' ').trim();

  // Mapeos específicos para nombres base del juego
  const baseMappings: Record<string, string> = {
    'galil': 'Galil',
    'c96': 'Mauser C96',
    'mauser_c96': 'Mauser C96',
    'mg08': 'MG08',
    'm1911': 'M1911',
    'python': 'Python',
    'judge': 'Executioner',
    'kard': 'KAP-40',
    'fiveseven': 'Five-Seven',
    'fivesevendw': 'Five-Seven Dual Wield',
    'beretta93r': 'B93R',
    'mp5': 'MP5',
    'pdw57': 'PDW-57',
    'ak74u': 'AK-74u',
    'ak-74u': 'AK-74u',
    'qcw05': 'Chicom CQB',
    'mp40': 'MP40',
    'evoskorpion': 'Evoskorpion',
    'thompson': 'Chicago Typewriter',
    'uzi': 'UZI',
    'ak74u_zm': 'AK-74u',
    'ak74u_extclip_zm': 'AK-74u',
    'evoskorpion_zm': 'Evoskorpion',
    'mp40_stalker_zm': 'MP40',
    'mp40_zm': 'MP40',
    'qcw05_zm': 'Chicom CQB',
    'pdw57_zm': 'PDW-57',
    'thompson_zm': 'Chicago Typewriter',
    'uzi_zm': 'UZI',
    'fnfal_zm': 'FAL',
    'm14_zm': 'M14',
    'saritch_zm': 'SMR',
    'm16_zm': 'M16',
    'tar21_zm': 'TAR-21',
    'gl_tar21_zm': 'TAR-21',
    'type95_zm': 'Type 25',
    'xm8_zm': 'M8A1',
    'scar_zm': 'SCAR-H',
    'ak47_zm': 'AK-47',
    'hk416_zm': 'M27',
    'type95': 'Type 25',
    'xm8': 'M8A1',
    'an94': 'AN-94',
    'scar': 'SCAR-H',
    'ak47': 'AK-47',
    'm27': 'M27',
    'hk416': 'M27',
    'rpd': 'RPD',
    'lsat': 'LSAT',
    'hamr': 'HAMR',
    '870mcs': 'Remington 870 MCS',
    'rottweil72': 'Olympia',
    'saiga12': 'S12',
    'srm1216': 'SMR',
    'ksg': 'KSG',
    'dsr50': 'DSR 50',
    'ballista': 'Ballista',
    'barretm82': 'Barrett M82A1',
    'svu': 'SVU-AS',
    'usrpg': 'RPG',
    'm32': 'War Machine',
    'minigun_alcatraz': 'Death Machine',
    'ray_gun': 'Ray Gun',
    'raygun_mark2': 'Ray Gun Mark II',
    'blundergat': 'Blundergat',
    'blundersplat': 'Acidgat',
    'slowgun': 'Paralyzer',
    'slipgun': 'Sliquifier',
    'knife_ballistic': 'Ballistic Knife',
    'knife_ballistic_bowie': 'Ballistic Knife',
    'knife_ballistic_no_melee': 'Ballistic Knife',
    'rnma_zm': 'Remington New Model Army',
    'rnma': 'Remington New Model Army',
    'katana': 'Katana',
    'stg44': 'STG-44',
    'staff_fire_zm': 'Staff of Fire',
    'staff_water_zm': 'Staff of Ice',
    'staff_lightning_zm': 'Staff of Lightning',
    'staff_air_zm': 'Staff of Wind',
    'staff_fire': 'Staff of Fire',
    'staff_water': 'Staff of Ice',
    'staff_lightning': 'Staff of Lightning',
    'staff_air': 'Staff of Wind',
    'stg44_zm': 'STG-44',
    'katana_zm': 'Katana'
  };

  // Buscar el nombre base
  if (baseMappings[cleanName]) {
    return baseMappings[cleanName];
  }

  // Capitalizar como fallback (para armas que no están mapeadas)
  const capitalized = cleanName
    .split(' ')
    .map(word => {
      // Manejar casos especiales como "ak-74u" -> "AK-74u"
      if (word.includes('-')) {
        return word.split('-').map(part =>
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join('-');
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  // Si existe en las imágenes, devolverlo
  if (WEAPON_IMAGES[capitalized]) {
    return capitalized;
  }

  // Último fallback - devolver el nombre original capitalizado
  return capitalized;
}

export default function RecentMatchesBanner({ playerGuid }: RecentMatchesBannerProps) {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedMatches, setExpandedMatches] = useState<Set<number>>(new Set());
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { t } = useLanguage();

  // GSAP hooks
  const gsap = useGSAP();

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await fetch('./data/recent_matches.json');
        if (response.ok) {
          const allMatches: MatchData[] = await response.json();
          // Filtrar solo las partidas del jugador seleccionado
          const playerMatches = allMatches.filter(match => match.guid === playerGuid);
          setMatches(playerMatches);
          // Resetear el índice si cambia el jugador
          setCurrentIndex(0);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error cargando partidas recientes:', error);
        setLoading(false);
      }
    };

    loadMatches();

    // Actualizar cada 3 segundos para ver cambios en tiempo real
    const interval = setInterval(loadMatches, 3000);

    return () => clearInterval(interval);
  }, [playerGuid]);

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(matches.length / ITEMS_PER_PAGE);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  };

  const toggleMatchExpansion = (matchIndex: number) => {
    setExpandedMatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(matchIndex)) {
        newSet.delete(matchIndex);
      } else {
        newSet.add(matchIndex);
      }
      return newSet;
    });
  };

  const openWeaponsModal = (match: MatchData) => {
    setSelectedMatch(match);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMatch(null);
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="text-slate-600 dark:text-slate-400 text-sm text-center py-8">{t('matches.loading')}</div>
      </div>
    );
  }

  if (matches.length === 0) {
    return null; // No mostrar nada si no hay partidas
  }

  return (
    <div className="relative">
      {/* Header elegante responsive */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500 blur-xl opacity-50"></div>
            <Clock className="relative w-5 h-5 sm:w-7 sm:h-7 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('matches.title')}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 hidden sm:block">{matches.length} {t('matches.registered')}</p>
          </div>
        </div>
        
        {/* Botones de navegación premium */}
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={handlePrevious}
            className="group relative p-2 sm:p-3 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 hover:from-orange-500 hover:to-orange-600 border border-slate-300 dark:border-slate-600 hover:border-orange-500 rounded-lg sm:rounded-xl disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/20"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-300 group-hover:text-white" />
          </button>
          <button
            onClick={handleNext}
            className="group relative p-2 sm:p-3 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 hover:from-orange-500 hover:to-orange-600 border border-slate-300 dark:border-slate-600 hover:border-orange-500 rounded-lg sm:rounded-xl disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/20"
            disabled={currentIndex >= totalPages - 1}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-300 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Carrusel horizontal - Responsive: 1 en móvil, 3 en tablet, 5 en desktop */}
      <div className="relative overflow-hidden">
        <div
          className="flex gap-3 sm:gap-4"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div key={pageIndex} className="flex-shrink-0 w-full flex gap-3 sm:gap-4">
              {matches
                .slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE)
                .map((match, index) => {
                  const globalIndex = pageIndex * ITEMS_PER_PAGE + index;
                  const isExpanded = expandedMatches.has(globalIndex);

                  return (
                  <div
                    key={`${match.fileName}-${index}`}
                    className="flex-shrink-0 w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-10.67px)] group"
                  >
                    <div className="relative bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-xl border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl hover:shadow-orange-500/20 hover:border-orange-500/50 hover:-translate-y-1 sm:hover:-translate-y-2">
                      
                      {/* Banner del mapa compacto */}
                      <div className="relative h-32 sm:h-36 md:h-40 overflow-hidden">
                        <img
                          src={MAP_IMAGES[match.map] || './data/images/Nuketown_menu_selection_BO2.jpg'}
                          alt={MAP_NAMES[match.map]}
                          className="w-full h-full object-cover group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100" />
                        
                        {/* Tag de zombies */}
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 sm:py-1 rounded-full border border-orange-500/30">
                            <MapIcon className="w-3 h-3 text-orange-400" />
                            <span className="text-xs text-orange-400 font-bold uppercase hidden sm:inline">{t('stats.zombies')}</span>
                          </div>
                        </div>
                        
                        {/* Badge de ronda */}
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-1 rounded-lg font-black text-xs shadow-lg">
                            R{match.round}
                          </div>
                        </div>
                        
                        {/* Nombre del mapa */}
                        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                          <h4 className="text-base sm:text-lg font-black text-white drop-shadow-lg truncate">
                            {MAP_NAMES[match.map]}
                          </h4>
                        </div>
                      </div>

                      {/* Estadísticas compactas responsive */}
                      <div className="p-3 sm:p-4 space-y-2">
                        {/* Fecha */}
                        <div className="text-xs text-slate-600 dark:text-slate-400 text-center mb-2 sm:mb-3">
                          {new Date(match.timestamp).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>

                        {/* Botón de expandir/colapsar */}
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => toggleMatchExpansion(globalIndex)}
                            className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium transition-colors"
                          >
                            {isExpanded ? t('stats.collapse') : t('stats.expand')}
                            <ChevronDown
                              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </div>

                        {/* Todas las estadísticas - solo cuando está expandido */}
                        {isExpanded && (
                          <div className="space-y-2 mt-3">
                            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-center">
                                <Target className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 mx-auto mb-1" />
                                <p className="text-xs text-slate-600 dark:text-slate-400">{t('stats.kills')}</p>
                                <p className="text-base sm:text-lg font-black text-red-500 dark:text-red-400">{match.kills}</p>
                              </div>

                              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 text-center">
                                <Skull className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 mx-auto mb-1" />
                                <p className="text-xs text-slate-600 dark:text-slate-400">{t('stats.headshots')}</p>
                                <p className="text-base sm:text-lg font-black text-yellow-600 dark:text-yellow-400">{match.headshots}</p>
                              </div>

                              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
                                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mx-auto mb-1" />
                                <p className="text-xs text-slate-600 dark:text-slate-400">{t('stats.revives')}</p>
                                <p className="text-base sm:text-lg font-black text-green-600 dark:text-green-400">{match.revives}</p>
                              </div>

                              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-center">
                                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mx-auto mb-1" />
                                <p className="text-xs text-slate-600 dark:text-slate-400">{t('stats.score')}</p>
                                <p className="text-sm font-black text-blue-600 dark:text-blue-400">{match.score.toLocaleString()}</p>
                              </div>
                            </div>

                            {/* Mejor arma */}
                            {match.bestWeapon && (
                              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2">
                                <div className="flex items-center gap-2">
                                  <div className="relative w-8 h-8 flex-shrink-0">
                                    <img
                                      src={WEAPON_IMAGES[getWeaponBaseName(match.bestWeapon.displayName)] || './data/images/Nuketown_menu_selection_BO2.jpg'}
                                      alt={match.bestWeapon.displayName}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-600 dark:text-slate-400">{t('stats.bestWeapon')}</p>
                                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400 truncate">
                                      {match.bestWeapon.displayName}
                                    </p>
                                    <p className="text-xs text-orange-500 dark:text-orange-300">
                                      {match.bestWeapon.kills} kills
                                    </p>
                                  </div>
                                  {Object.keys(match.weapons).length > 1 && (
                                    <button
                                      onClick={() => openWeaponsModal(match)}
                                      className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-xs font-medium underline"
                                    >
                                      {t('stats.viewAll')}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Perks */}
                            {Object.keys(match.perks).length > 0 && (
                              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{t('stats.perks')}</p>
                                <div className="flex flex-wrap gap-1">
                                  {(Object.values(match.perks) as PerkData[]).slice(0, 4).map((perk, index) => (
                                    <div key={index} className="relative w-6 h-6 flex-shrink-0" title={`${perk.displayName} (${perk.uses} uso${perk.uses !== 1 ? 's' : ''})`}>
                                      <img
                                        src={PERK_IMAGES[perk.displayName] || './data/images/Nuketown_menu_selection_BO2.jpg'}
                                        alt={perk.displayName}
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                  ))}
                                  {Object.keys(match.perks).length > 4 && (
                                    <button
                                      onClick={() => openWeaponsModal(match)}
                                      className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-500/30"
                                      title={t('stats.viewAllPerks')}
                                    >
                                      +
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Downs o estado de desconexión */}
                            <div className={`border rounded-lg p-2 text-center ${
                              match.downs > 0
                                ? 'bg-red-500/10 border-red-500/20'
                                : 'bg-blue-500/10 border-blue-500/20'
                            }`}>
                              <span className={`text-xs font-bold ${
                                match.downs > 0
                                  ? 'text-red-500 dark:text-red-400'
                                  : 'text-blue-500 dark:text-blue-400'
                              }`}>
                                {match.downs > 0 ? `${match.downs} ${t('matches.downs.count')}` : t('matches.disconnect')}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores de página */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 rounded-full ${
              index === currentIndex 
                ? 'w-6 sm:w-8 bg-orange-500' 
                : 'w-1.5 sm:w-2 bg-slate-400 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500'
            }`}
          />
        ))}
      </div>

      {/* Modal para armas y perks */}
      {showModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 shadow-xl ring-4 ring-white/20 dark:ring-slate-600/30">
                      <img
                        src={MAP_IMAGES[selectedMatch.map] || './data/images/Nuketown_menu_selection_BO2.jpg'}
                        alt={MAP_NAMES[selectedMatch.map]}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-black px-2 py-1 rounded-full shadow-lg">
                      R{selectedMatch.round}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                      {MAP_NAMES[selectedMatch.map]}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {new Date(selectedMatch.timestamp).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-red-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedMatch.kills}</span>
                        <span className="text-slate-500 dark:text-slate-400">{t('stats.kills')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedMatch.score.toLocaleString()}</span>
                        <span className="text-slate-500 dark:text-slate-400">{t('stats.score')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {/* Armas */}
              {Object.keys(selectedMatch.weapons).length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1"></div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-orange-500" />
                      {t('stats.weapons')}
                    </h4>
                    <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1"></div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {(Object.values(selectedMatch.weapons) as WeaponData[])
                      .sort((a, b) => b.kills - a.kills)
                      .map((weapon, index) => (
                        <div key={index} className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 transition-all duration-200 group">
                          <div className="relative w-14 h-14 mx-auto mb-3">
                            <img
                              src={WEAPON_IMAGES[getWeaponBaseName(weapon.displayName)] || './data/images/Nuketown_menu_selection_BO2.jpg'}
                              alt={weapon.displayName}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200"
                            />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                              {index + 1}
                            </div>
                          </div>
                          <p className="text-sm font-bold text-orange-800 dark:text-orange-200 truncate mb-1">
                            {weapon.displayName}
                          </p>
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                              {weapon.kills}
                            </span>
                            <span className="text-xs text-orange-600 dark:text-orange-400">
                              {t('stats.kills').toLowerCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Perks */}
              {Object.keys(selectedMatch.perks).length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent flex-1"></div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-500" />
                      {t('stats.perks')}
                    </h4>
                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent flex-1"></div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {(Object.values(selectedMatch.perks) as PerkData[]).map((perk, index) => (
                      <div key={index} className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 transition-all duration-200 group">
                        <div className="relative w-12 h-12 mx-auto mb-3">
                          <img
                            src={PERK_IMAGES[perk.displayName] || './data/images/Nuketown_menu_selection_BO2.jpg'}
                            alt={perk.displayName}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200"
                          />
                        </div>
                        <p className="text-sm font-bold text-purple-800 dark:text-purple-200 truncate mb-1">
                          {perk.displayName}
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                          {perk.uses} {perk.uses === 1 ? t('stats.use') : t('stats.uses')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

