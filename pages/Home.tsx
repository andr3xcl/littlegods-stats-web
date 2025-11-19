import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Home: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-6 sm:mb-8 md:mb-10 leading-tight">
          <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 dark:from-white dark:via-blue-100 dark:to-indigo-200 bg-clip-text text-transparent drop-shadow-2xl">
            Littlegods
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
            Stats
          </span>
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
          {t('home.description')}
          <span className="hidden sm:inline"> {t('home.description.extended')}</span>
        </p>
      </div>
    </div>
  );
};

export default Home;