import React, { useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useGSAP } from '../utils/gsap';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: any;
}

const ProfileModal: React.FC<ProfileModalProps> = React.memo(({ isOpen, onClose, player }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  const gsap = useGSAP();
  const modalRef = useRef<HTMLDivElement>(null);
  const hasAnimatedModal = useRef(false);

  const getThemeClasses = (classes: { light: string; dark: string }) => {
    return theme === 'dark' ? classes.dark : classes.light;
  };

  useEffect(() => {
    if (isOpen && modalRef.current && !hasAnimatedModal.current) {
      gsap.animateModalIn(modalRef.current);
      hasAnimatedModal.current = true;
    }
    if (!isOpen) {
      hasAnimatedModal.current = false;
    }
  }, [isOpen, gsap]);

  const handlePlutoniumRedirect = () => {
    if (player?.username) {
      const plutoniumUrl = `https://forum.plutonium.pw/user/${player.username}`;
      window.open(plutoniumUrl, '_blank');
    }
  };

  if (!isOpen || !player) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 ${getThemeClasses({
        light: 'bg-black/85 backdrop-blur-xl',
        dark: 'bg-black/95 backdrop-blur-xl'
      })}`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`w-full max-w-md max-h-[95vh] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border ${getThemeClasses({
          light: 'bg-white border-slate-300/60',
          dark: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-700/60'
        })}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <div className={`relative h-32 sm:h-40 overflow-hidden ${getThemeClasses({
            light: 'rounded-t-2xl sm:rounded-t-3xl',
            dark: 'rounded-t-2xl sm:rounded-t-3xl'
          })}`}>
            <div className={`absolute inset-0 ${getThemeClasses({
              light: 'bg-gradient-to-br from-blue-400 to-purple-600',
              dark: 'bg-gradient-to-br from-indigo-500 to-purple-600'
            })}`}></div>

            <div className={`absolute inset-0 ${getThemeClasses({
              light: 'bg-black/10',
              dark: 'bg-black/20'
            })}`}></div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className={`absolute top-4 right-4 sm:top-6 sm:right-6 z-20 rounded-full p-3 bg-black/50 hover:bg-black/70 text-white border border-white/30 hover:border-white/50 transition-all duration-200 hover:scale-110 cursor-pointer`}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <img
                  src={player.avatarUrl || 'https://forum.plutonium.pw/assets/uploads/system/avatar-default.png'}
                  alt={player.username}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/80 dark:border-slate-700/80 object-cover shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>

        <div className={"p-6 space-y-6 " + getThemeClasses({
          light: 'scrollbar-thin scrollbar-thumb-slate-400/50 scrollbar-track-slate-200/20',
          dark: 'scrollbar-thin scrollbar-thumb-slate-600/50 scrollbar-track-transparent'
        })}>
          <div className="text-center space-y-4">
            <div>
              <h1 className={"text-2xl sm:text-3xl font-black mb-2 " + getThemeClasses({
                light: 'text-slate-900',
                dark: 'text-white'
              })}>
                {player.username}
              </h1>
              <p className={"text-sm " + getThemeClasses({
                light: 'text-slate-600',
                dark: 'text-slate-400'
              })}>
                {t('profile.playerDescription')}
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handlePlutoniumRedirect}
                className={"w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-white transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl " + getThemeClasses({
                  light: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-blue-500/20 hover:shadow-purple-500/30',
                  dark: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/20 hover:shadow-purple-500/30'
                })}
              >
                <ExternalLink className="w-5 h-5" />
                {t('profile.viewForumProfile')}
              </button>

              <p className={"text-xs text-center " + getThemeClasses({
                light: 'text-slate-600',
                dark: 'text-slate-400'
              })}>
                {t('profile.opensInNewTab')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProfileModal;