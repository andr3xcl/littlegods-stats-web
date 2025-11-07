import React from 'react';
import type { PlayerProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface PlayerSidebarProps {
  players: PlayerProfile[];
  selectedPlayer: PlayerProfile | null;
  onSelectPlayer: (player: PlayerProfile) => void;
}

const PlayerSidebar: React.FC<PlayerSidebarProps> = ({ players, selectedPlayer, onSelectPlayer }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filteredPlayers, setFilteredPlayers] = React.useState(players);
  const { t } = useLanguage();

  React.useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPlayers(players);
    } else {
      const filtered = players.filter(player =>
        player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (player.guid && player.guid.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPlayers(filtered);
    }
  }, [searchTerm, players]);

  return (
    <div className="w-80 h-screen sticky top-0 z-30 p-2 sm:p-4 md:p-6">
      {/* Floating Banner Container */}
      <div className="relative bg-gradient-to-br from-white/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-2xl border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl shadow-2xl transition-colors duration-300 overflow-hidden flex flex-col h-full">

        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-50"></div>

        {/* Header */}
        <div className="relative p-4 sm:p-6 border-b border-slate-300/50 dark:border-slate-700/50">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-50"></div>
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {t('nav.players')}
            </h2>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder={t('player.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-200/50 dark:bg-slate-900/50 border border-slate-300/50 dark:border-slate-600/50 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 text-sm backdrop-blur-sm"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Player List */}
        <div className="relative flex-1 overflow-y-auto p-2 sm:p-4">
          <div className="space-y-2">
            {filteredPlayers.map((player) => {
              const isSelected = selectedPlayer?.guid === player.guid || selectedPlayer?.username === player.username;
              return (
                <button
                  key={player.guid || player.username}
                  onClick={() => onSelectPlayer(player)}
                  className={`
                    group relative w-full flex items-center space-x-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 text-left overflow-hidden
                    ${isSelected
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/40 shadow-xl ring-2 ring-indigo-500/20'
                      : 'bg-slate-200/30 dark:bg-slate-800/30 border-2 border-transparent hover:border-slate-300/50 dark:hover:border-slate-600/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                    }
                  `}
                >
                  {/* Background glow for selected */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-50"></div>
                  )}

                  <div className="relative">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      isSelected ? 'border-indigo-400 shadow-lg' : 'border-white/20 dark:border-slate-600 group-hover:border-slate-300/50 dark:group-hover:border-slate-500/50'
                    }`}>
                      <img
                        src={player.avatarUrl || 'https://forum.plutonium.pw/assets/uploads/system/avatar-default.png'}
                        alt={player.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-3 border-white dark:border-slate-800 flex items-center justify-center shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <p className={`font-bold truncate text-sm sm:text-base ${isSelected ? 'text-indigo-400 dark:text-indigo-400' : 'text-slate-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100'}`}>
                      {player.username}
                    </p>
                    {player.guid && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate group-hover:text-slate-500 dark:group-hover:text-slate-300">
                        {t('player.guid')}: {player.guid}
                      </p>
                    )}
                  </div>

                  {/* Hover effect */}
                  <div className={`absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isSelected ? 'bg-gradient-to-r from-indigo-500/5 to-purple-500/5' : 'bg-slate-200/20 dark:bg-slate-700/20'
                  }`}></div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer with player count */}
        <div className="relative p-4 sm:p-6 border-t border-slate-300/50 dark:border-slate-700/50">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300/50 dark:via-slate-700/50 to-transparent"></div>
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center font-medium">
              {filteredPlayers.length} {filteredPlayers.length === 1 ? t('player.singular') : t('player.plural')}
              {searchTerm && ` - ${t('player.filtered')}`}
            </p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300/50 dark:via-slate-700/50 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSidebar;
