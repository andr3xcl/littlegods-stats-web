import React, { useRef, useMemo } from 'react';
import type { PlayerProfile } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUISounds } from '../../hooks/useUISounds';

interface PlayerSidebarProps {
  players: PlayerProfile[];
  selectedPlayer: PlayerProfile | null;
  onSelectPlayer: (player: PlayerProfile) => void;
}

const PlayerItem = React.memo(({ player, isSelected, onSelect, t }: { player: PlayerProfile, isSelected: boolean, onSelect: (p: PlayerProfile) => void, t: any }) => {
  const { playZoomIn } = useUISounds();

  return (
    <button
      onClick={() => {
        playZoomIn();
        onSelect(player);
      }}
      className={`
            group relative w-full flex items-center space-x-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left overflow-hidden transition-all duration-200
            ${isSelected
          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/40 shadow-xl ring-2 ring-indigo-500/20 scale-[1.02]'
          : 'bg-slate-200/30 dark:bg-slate-800/30 border-2 border-transparent hover:border-slate-300/50 dark:hover:border-slate-600/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:scale-[1.01]'
        }
            `}
    >
      {}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-50"></div>
      )}

      <div className="relative">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-colors duration-200 ${isSelected ? 'border-indigo-400 shadow-lg' : 'border-white/20 dark:border-slate-600 group-hover:border-slate-300/50 dark:group-hover:border-slate-500/50'
          }`}>
          <img
            src={player.avatarUrl || 'https://forum.plutonium.pw/assets/uploads/system/avatar-default.png'}
            alt={player.username}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        {isSelected && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-3 border-white dark:border-slate-800 flex items-center justify-center shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>
      <div className="relative flex-1 min-w-0">
        <p className={`font-bold truncate text-sm sm:text-base transition-colors duration-200 ${isSelected ? 'text-indigo-400 dark:text-indigo-400' : 'text-slate-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100'}`}>
          {player.username}
        </p>
        {player.guid && (
          <p className="text-xs text-slate-600 dark:text-slate-400 truncate group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors duration-200">
            {t('player.guid')}: {player.guid}
          </p>
        )}
      </div>

      {}
      <div className={`absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isSelected ? 'bg-gradient-to-r from-indigo-500/5 to-purple-500/5' : 'bg-slate-200/20 dark:bg-slate-700/20'
        }`}></div>
    </button>
  );
});

const PlayerSidebar: React.FC<PlayerSidebarProps> = ({ players, selectedPlayer, onSelectPlayer }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { t } = useLanguage();

  const filteredPlayers = useMemo(() => {
    if (searchTerm.trim() === '') {
      return players;
    }
    const lowerTerm = searchTerm.toLowerCase();
    return players.filter(player =>
      player.username.toLowerCase().includes(lowerTerm) ||
      (player.guid && player.guid.toLowerCase().includes(lowerTerm))
    );
  }, [searchTerm, players]);

  return (
    <div className="h-full">
      {}
      <div className="relative bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-md border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] sticky top-20">

        {}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-50"></div>

        {}
        <div className="relative p-4 border-b border-slate-300/50 dark:border-slate-700/50 shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-50"></div>
              <div className="relative w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {t('sidebar.players')}
            </h2>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
            <input
              type="text"
              placeholder={t('player.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="relative w-full bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-0 transition-all duration-300 text-sm font-medium"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {}
        <div className="relative flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          <div className="space-y-2">
            {filteredPlayers.map((player) => (
              <PlayerItem
                key={player.guid || player.username}
                player={player}
                isSelected={selectedPlayer?.guid === player.guid || selectedPlayer?.username === player.username}
                onSelect={onSelectPlayer}
                t={t}
              />
            ))}
          </div>
        </div>

        {}
        <div className="relative p-3 border-t border-slate-300/50 dark:border-slate-700/50 shrink-0 bg-white/30 dark:bg-slate-900/30">
          <div className="flex items-center justify-center gap-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
              {filteredPlayers.length} {filteredPlayers.length === 1 ? t('player.singular') : t('player.plural')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSidebar;
