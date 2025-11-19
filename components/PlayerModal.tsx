import React, { useRef, useEffect } from 'react';
import type { PlayerProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useGSAP } from '../utils/gsap';

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: PlayerProfile[];
  onSelectPlayer: (player: PlayerProfile) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const PlayerModal: React.FC<PlayerModalProps> = ({ isOpen, onClose, players, onSelectPlayer, searchTerm, setSearchTerm }) => {
  const { t } = useLanguage();

  // GSAP hooks y referencias
  const gsap = useGSAP();
  const modalRef = useRef<HTMLDivElement>(null);

  // Animación de entrada del modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.animateModalIn(modalRef.current);
    }
  }, [isOpen, gsap]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" 
      onClick={onClose}
      style={{ margin: 0 }}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('player.select')}</h2>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder={t('player.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            {players.map((player) => (
              <button
                key={player.guid || player.username}
                onClick={() => {
                  onSelectPlayer(player);
                  onClose();
                }}
                className="w-full flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-left"
              >
                <img src={player.avatarUrl || 'https://forum.plutonium.pw/assets/uploads/system/avatar-default.png'} alt={player.username} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{player.username}</p>
                  {player.guid && <p className="text-xs text-slate-600 dark:text-slate-400">{t('player.guid')}: {player.guid}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerModal;