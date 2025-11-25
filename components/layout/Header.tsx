import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGSAP } from '../../utils/gsap';

type NavView = 'Home' | 'Estadisticas' | 'Settings';
type PlayerSubView = 'Estadísticas';

interface HeaderProps {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
  activeSubView: PlayerSubView;
  onNavigateSubView: (view: PlayerSubView) => void;
}

const Header: React.FC<HeaderProps> = React.memo(({ activeView, onNavigate, activeSubView, onNavigateSubView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();

  // GSAP hooks y referencias
  const gsap = useGSAP();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = useMemo(() => [
    { name: 'Home', label: t('nav.home') },
    { name: 'Estadisticas', label: t('nav.players') },
    { name: 'Settings', label: t('nav.settings') },
  ], [t]);

  const handleNavigate = useCallback((view: NavView) => {
    onNavigate(view);
  }, [onNavigate]);

  const handleMobileNavigate = useCallback((view: NavView) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  }, [onNavigate]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Manejadores de hover para botones
  const handleButtonHover = useCallback((element: HTMLElement, isHover: boolean) => {
    gsap.animateButtonHover(element, isHover);
  }, [gsap]);

  const handleMenuButtonHover = useCallback((element: HTMLElement, isHover: boolean) => {
    gsap.animateButtonHover(element, isHover);
  }, [gsap]);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg py-2'
        : 'bg-transparent border-b border-transparent py-2'
        }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-12 sm:h-14">
          {/* Logo */}
          <div className="flex items-center group cursor-pointer" onClick={() => handleNavigate('Home')}>
            <h1 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-wider">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300">Littlegods</span>
              <span className="text-slate-800 dark:text-slate-100"> Stats</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = item.name === activeView;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.name as NavView)}
                  onMouseEnter={(e) => handleButtonHover(e.currentTarget, true)}
                  onMouseLeave={(e) => handleButtonHover(e.currentTarget, false)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300
                    ${isActive
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            onMouseEnter={(e) => handleMenuButtonHover(e.currentTarget, true)}
            onMouseLeave={(e) => handleMenuButtonHover(e.currentTarget, false)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-64 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-xl border border-slate-200 dark:border-slate-700 space-y-1">
            {navItems.map((item) => {
              const isActive = item.name === activeView;
              return (
                <button
                  key={item.name}
                  onClick={() => handleMobileNavigate(item.name as NavView)}
                  className={`
                    w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-left transition-all duration-200
                    ${isActive
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }
                  `}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

      </nav>
    </header>
  );
});

export default Header;