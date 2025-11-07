import React from 'react';
import { SkullIcon, UserDownIcon, HeartPlusIcon, CrosshairIcon } from '../components/icons';
import { useLanguage } from '../contexts/LanguageContext';

const Home: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Hero Section - Mobile Optimized */}
      <div className="relative z-10 px-3 sm:px-6 md:px-8 pt-8 sm:pt-12 md:pt-20 pb-16 sm:pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto">
          {/* Main Title */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-block mb-4 sm:mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl blur-lg sm:blur-xl opacity-50 scale-110"></div>
                <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl">
                  <span className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider">Black Ops 2 Plutonium</span>
                </div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-4 sm:mb-6 md:mb-8 leading-tight px-2">
              <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 dark:from-white dark:via-blue-100 dark:to-indigo-200 bg-clip-text text-transparent drop-shadow-2xl">
                Littlegods
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
                Stats
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-slate-700 dark:text-slate-300 mb-10 sm:mb-12 md:mb-16 max-w-3xl mx-auto leading-relaxed px-4">
              {t('home.description')}
              <span className="hidden sm:inline"> {t('home.description.extended')}</span>
            </p>
          </div>

          {/* Feature Grid - Mobile Optimized */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16 md:mb-20">
            {/* Map Performance Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-slate-100/80 to-slate-200/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-xl border-2 border-red-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover:border-red-400/40 transition-all duration-500 hover:scale-105">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl">
                      <SkullIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3">{t('home.feature.tracking')}</h3>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                      {t('home.feature.tracking.desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-slate-100/80 to-slate-200/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-xl border-2 border-blue-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover:border-blue-400/40 transition-all duration-500 hover:scale-105">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl">
                      <CrosshairIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3">{t('home.feature.detailed')}</h3>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                      {t('home.feature.detailed.desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Economy Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-slate-100/80 to-slate-200/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-xl border-2 border-yellow-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover:border-yellow-400/40 transition-all duration-500 hover:scale-105">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl">
                      <HeartPlusIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3">{t('home.feature.economy')}</h3>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                      {t('home.feature.economy.desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Multiplayer Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-slate-100/80 to-slate-200/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-xl border-2 border-green-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover:border-green-400/40 transition-all duration-500 hover:scale-105">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl">
                      <UserDownIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3">{t('home.feature.history')}</h3>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                      {t('home.feature.history.desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-3xl font-black text-white mb-4">Littlegods Stats</h2>
                <p className="text-slate-200 max-w-2xl">
                  {t('home.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;