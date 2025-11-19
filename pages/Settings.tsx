import React, { useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Sun, Moon, Check, Globe } from 'lucide-react';
import { useGSAP } from '../utils/gsap';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  // GSAP hooks
  const gsap = useGSAP();
  const themeSectionRef = useRef<HTMLDivElement>(null);
  const languageSectionRef = useRef<HTMLDivElement>(null);

  // Animaciones de scroll para las secciones
  useEffect(() => {
    if (themeSectionRef.current) {
      gsap.animateSlideInLeft(themeSectionRef.current, 0, "top 85%");
    }
    if (languageSectionRef.current) {
      gsap.animateSlideInRight(languageSectionRef.current, 0.2, "top 85%");
    }
  }, [gsap]);

  // Manejadores de hover para botones
  const handleThemeButtonHover = React.useCallback((element: HTMLElement, isHover: boolean) => {
    gsap.animateButtonHover(element, isHover);
  }, [gsap]);

  const handleLanguageButtonHover = React.useCallback((element: HTMLElement, isHover: boolean) => {
    gsap.animateButtonHover(element, isHover);
  }, [gsap]);

  // Manejadores de hover para elementos internos
  const handleIconHover = React.useCallback((element: HTMLElement, isHover: boolean) => {
    const scale = isHover ? 1.1 : 1;
    gsap.to(element, { scale, duration: 0.3, ease: "power2.out" });
  }, [gsap]);

  const handleFlagHover = React.useCallback((element: HTMLElement, isHover: boolean) => {
    const scale = isHover ? 1.1 : 1;
    gsap.to(element, { scale, duration: 0.3, ease: "power2.out" });
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
    {
      id: 'es' as const,
      name: 'Español',
      flag: '🇪🇸',
      nativeName: 'Español',
    },
    {
      id: 'en' as const,
      name: 'English',
      flag: '🇺🇸',
      nativeName: 'English',
    },
    {
      id: 'pt' as const,
      name: 'Português',
      flag: '🇧🇷',
      nativeName: 'Português',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative z-10 px-3 sm:px-6 md:px-8 pt-8 sm:pt-12 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              {t('settings.title')}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              {t('settings.subtitle')}
            </p>
          </div>

          {/* Theme Selection */}
          <div ref={themeSectionRef} className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-50"></div>
                <Sun className="relative w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {t('settings.theme.title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                const isActive = theme === themeOption.id;

                return (
                  <button
                    key={themeOption.id}
                    onClick={() => setTheme(themeOption.id)}
                    onMouseEnter={(e) => handleThemeButtonHover(e.currentTarget, true)}
                    onMouseLeave={(e) => handleThemeButtonHover(e.currentTarget, false)}
                    className={`
                      relative group text-left
                      bg-gradient-to-br ${themeOption.gradient}
                      backdrop-blur-xl border-2
                      ${isActive
                        ? 'border-purple-500 shadow-2xl shadow-purple-500/20'
                        : 'border-slate-700/50 hover:border-slate-600'
                      }
                      rounded-2xl sm:rounded-3xl p-6 sm:p-8
                      hover:shadow-2xl
                    `}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}

                    {/* Icon */}
                    <div className="mb-6">
                      <div
                        className="inline-flex p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"
                        onMouseEnter={(e) => handleIconHover(e.currentTarget, true)}
                        onMouseLeave={(e) => handleIconHover(e.currentTarget, false)}
                      >
                        <div className={`p-2 rounded-full bg-gradient-to-r ${themeOption.accent}`}>
                          <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className={`
                        text-xl sm:text-2xl font-black mb-2
                        ${themeOption.id === 'dark' ? 'text-white' : 'text-slate-900'}
                      `}>
                        {themeOption.name}
                      </h3>
                      <p className={`
                        text-sm sm:text-base leading-relaxed
                        ${themeOption.id === 'dark' ? 'text-slate-400' : 'text-slate-600'}
                      `}>
                        {themeOption.description}
                      </p>
                    </div>

                  </button>
                );
              })}
            </div>

            {/* Language Selection */}
            <div ref={languageSectionRef} className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50"></div>
                  <Globe className="relative w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {t('settings.language.title')}
                </h2>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6">
                {t('settings.language.subtitle')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {languages.map((lang) => {
                  const isActive = language === lang.id;

                  return (
                    <button
                      key={lang.id}
                      onClick={() => setLanguage(lang.id)}
                      onMouseEnter={(e) => handleLanguageButtonHover(e.currentTarget, true)}
                      onMouseLeave={(e) => handleLanguageButtonHover(e.currentTarget, false)}
                      className={`
                        relative group text-center
                        bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900
                        backdrop-blur-xl border-2
                        ${isActive
                          ? 'border-blue-500 shadow-2xl shadow-blue-500/20'
                          : 'border-slate-300 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-600'
                        }
                        rounded-2xl p-6
                        hover:shadow-xl
                      `}
                    >
                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      {/* Flag */}
                      <div
                        className="text-5xl mb-4"
                        onMouseEnter={(e) => handleFlagHover(e.currentTarget, true)}
                        onMouseLeave={(e) => handleFlagHover(e.currentTarget, false)}
                      >
                        {lang.flag}
                      </div>

                      {/* Language Name */}
                      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                        {lang.nativeName}
                      </h3>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Version */}
            <div className="mt-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Versión 1.0.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

