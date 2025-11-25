import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useGSAP } from '../utils/gsap';
import { ArrowRight, BarChart3, Users, Globe } from 'lucide-react';












interface HomeProps {
  onNavigate: (view: 'Home' | 'Estadisticas' | 'Settings') => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const gsap = useGSAP();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current && titleRef.current && featuresRef.current) {
      const tl = gsap.createTimeline();

      tl.fromTo(titleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      )
        .fromTo(featuresRef.current.children,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power2.out" },
          "-=0.5"
        );
    }
  }, [gsap]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-slate-200/20 to-transparent dark:from-slate-800/20 dark:to-transparent opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div ref={heroRef} className="text-center max-w-4xl mx-auto">
          <div ref={titleRef} className="mb-8 sm:mb-12">


            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-tight">
              <span className="block text-slate-900 dark:text-white mb-2">Littlegods</span>
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl">
                Stats Web
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10">
              {t('home.description')}
              <span className="hidden sm:inline"> {t('home.description.extended')}</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => onNavigate('Estadisticas')}
                className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                Explorar Estadísticas
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-24">
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors group">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('home.feature.tracking')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {t('home.feature.tracking.desc')}
              </p>
            </div>

            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-colors group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('home.feature.profiles')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {t('home.feature.profiles.desc')}
              </p>
            </div>

            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 hover:border-pink-500/30 transition-colors group">
              <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('home.feature.rankings')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {t('home.feature.rankings.desc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;