import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSound } from '../contexts/SoundContext';
import { useSettings } from '../contexts/SettingsContext';
import { Sun, Moon, Check, Globe, Settings as SettingsIcon, Volume2, VolumeX, Image as ImageIcon } from 'lucide-react';
import { useGSAP } from '../utils/gsap';
import SoundSettingsModal from '../components/features/settings/SoundSettingsModal';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { soundEnabled, setSoundEnabled } = useSound();
  const { mapImagePreference, setMapImagePreference } = useSettings();
  const [showSoundModal, setShowSoundModal] = useState(false);


  const gsap = useGSAP();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [gsap]);

  const themes = [
    {
      id: 'dark' as const,
      name: t('settings.theme.dark'),
      description: t('settings.theme.darkDesc'),
      icon: Moon,
      gradient: 'from-slate-800 to-slate-900',
      accent: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'light' as const,
      name: t('settings.theme.light'),
      description: t('settings.theme.lightDesc'),
      icon: Sun,
      gradient: 'from-slate-50 to-slate-100',
      accent: 'from-orange-400 to-yellow-400',
    },
  ];

  const languages = [
    { id: 'es' as const, name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
    { id: 'en' as const, name: 'English', flag: '🇺🇸', nativeName: 'English' },
    { id: 'pt' as const, name: 'Português', flag: '🇧🇷', nativeName: 'Português' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div ref={containerRef} className="max-w-4xl mx-auto">

        { }
        <div className="text-center mb-12">
          <div className="inline-flex p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 shadow-lg">
            <SettingsIcon className="w-8 h-8 text-slate-900 dark:text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            {t('settings.title')}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('settings.subtitle')}
          </p>
        </div>

        { }
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-1 bg-indigo-500 rounded-full"></span>
            {t('settings.theme.title')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isActive = theme === themeOption.id;

              return (
                <button
                  key={themeOption.id}
                  onClick={() => setTheme(themeOption.id)}
                  className={`
                    relative group text-left overflow-hidden
                    bg-gradient-to-br ${themeOption.gradient}
                    border-2 transition-all duration-300
                    ${isActive
                      ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-700/50 hover:border-indigo-500/50 hover:shadow-xl'
                    }
                    rounded-3xl p-8
                  `}
                >
                  {isActive && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${themeOption.accent} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <h3 className={`text-2xl font-black mb-2 ${themeOption.id === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {themeOption.name}
                  </h3>
                  <p className={`text-sm leading-relaxed ${themeOption.id === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {themeOption.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        { }
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-1 bg-purple-500 rounded-full"></span>
            {t('settings.language.title')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {languages.map((lang) => {
              const isActive = language === lang.id;

              return (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`
                    relative group text-center
                    bg-white dark:bg-slate-800
                    border-2 transition-all duration-300
                    ${isActive
                      ? 'border-purple-500 shadow-xl shadow-purple-500/20 scale-105 z-10'
                      : 'border-slate-200 dark:border-slate-700/50 hover:border-purple-500/50 hover:shadow-lg'
                    }
                    rounded-2xl p-6
                  `}
                >
                  {isActive && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {lang.flag}
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {lang.nativeName}
                  </h3>
                </button>
              );
            })}
          </div>
        </div>

        { }
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-1 bg-orange-500 rounded-full"></span>
            {t('settings.sound.title')}
          </h2>

          <button
            onClick={() => setShowSoundModal(true)}
            className="
              w-full relative group text-left overflow-hidden
              bg-gradient-to-br from-orange-600 to-orange-700
              border-2 border-orange-500/50 hover:border-orange-400
              transition-all duration-300
              hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-[1.02]
              rounded-3xl p-8
            "
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Volume2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-2 text-white">
                    {t('settings.sound.configure') || 'Configurar Audio'}
                  </h3>
                  <p className="text-sm leading-relaxed text-orange-100">
                    {t('settings.sound.configureDesc') || 'Personaliza música y efectos de sonido'}
                  </p>
                </div>
              </div>
              <div className="text-white/50 group-hover:text-white/80 transition-colors">
                <SettingsIcon className="w-6 h-6" />
              </div>
            </div>
          </button>
        </div>

        {}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-1 bg-green-500 rounded-full"></span>
            {t('settings.mapImages.title') || 'Imágenes de Mapas'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              onClick={() => setMapImagePreference('real')}
              className={`
                        relative group text-left overflow-hidden
                        bg-white dark:bg-slate-800
                        border-2 transition-all duration-300
                        ${mapImagePreference === 'real'
                  ? 'border-green-500 shadow-2xl shadow-green-500/20 scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-700/50 hover:border-green-500/50 hover:shadow-xl'
                }
                        rounded-3xl p-6
                    `}
            >
              {mapImagePreference === 'real' && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                {t('settings.mapImages.real') || 'Imágenes Reales'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('settings.mapImages.realDesc') || 'Muestra las imágenes originales de los mapas principales (ej. Tranzit para Diner).'}
              </p>
            </button>

            <button
              onClick={() => setMapImagePreference('bonus')}
              className={`
                        relative group text-left overflow-hidden
                        bg-white dark:bg-slate-800
                        border-2 transition-all duration-300
                        ${mapImagePreference === 'bonus'
                  ? 'border-green-500 shadow-2xl shadow-green-500/20 scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-700/50 hover:border-green-500/50 hover:shadow-xl'
                }
                        rounded-3xl p-6
                    `}
            >
              {mapImagePreference === 'bonus' && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                {t('settings.mapImages.bonus') || 'Imágenes Bonus'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('settings.mapImages.bonusDesc') || 'Muestra imágenes específicas para cada mapa bonus.'}
              </p>
            </button>
          </div>
        </div>

        <SoundSettingsModal
          isOpen={showSoundModal}
          onClose={() => setShowSoundModal(false)}
        />

        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Littlegods Stats Web v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
