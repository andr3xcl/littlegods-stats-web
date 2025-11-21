
import React, { useRef, useEffect } from 'react';
import type { PlayerProfile } from '../types';
import { useGSAP } from '../utils/gsap';

interface PlayerBannerProps {
  player: PlayerProfile;
}

const PlayerBanner: React.FC<PlayerBannerProps> = ({ player }) => {
  // GSAP hooks y referencias
  const gsap = useGSAP();
  const pulseRef = useRef<HTMLDivElement>(null);

  // Animación del pulso del indicador de estado
  useEffect(() => {
    if (pulseRef.current) {
      gsap.animatePulse(pulseRef.current, 2);
    }
  }, [gsap]);

  return (
    <div className="relative w-full h-80 overflow-hidden">
      {}
      <div className="absolute inset-0 bg-slate-900"></div>
      <img
        src={player.bannerUrl}
        alt="Player Banner"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-30"
      />

      {}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

      {}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-8">
        <div className="text-center">
          {}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-xl opacity-50 scale-110"></div>
            <img
              src={player.avatarUrl}
              alt="Player Avatar"
              className="relative w-32 h-32 rounded-full border-4 border-white/20 object-cover shadow-2xl"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-slate-900 flex items-center justify-center">
              <div ref={pulseRef} className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>

          {}
          <h1 className="text-6xl md:text-7xl font-black mb-8">
            <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
              {player.username}
            </span>
          </h1>
        </div>
      </div>

    </div>
  );
};

export default PlayerBanner;