import React, { useCallback, useMemo } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type NavView = 'Home' | 'Jugadores' | 'Settings';
type PlayerSubView = 'Estadísticas';

interface HeaderProps {
    activeView: NavView;
    onNavigate: (view: NavView) => void;
    activeSubView: PlayerSubView;
    onNavigateSubView: (view: PlayerSubView) => void;
}

const Header: React.FC<HeaderProps> = React.memo(({ activeView, onNavigate, activeSubView, onNavigateSubView }) => {
   const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
   const { t } = useLanguage();

  const navItems = useMemo(() => [
    { name: 'Home', label: t('nav.home') },
    { name: 'Jugadores', label: t('nav.players') },
    { name: 'Settings', label: t('nav.settings') },
  ], [t]);

  const subNavItems = useMemo(() => [
    { name: 'Estadísticas', label: t('nav.statistics') },
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

  return (
    <header className="bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-slate-300 dark:border-slate-700 sticky top-0 z-40 shadow-lg transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-wider">
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Littlegods</span> 
              <span className="text-slate-800 dark:text-slate-100"> Stats</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navItems.map((item) => {
              const isActive = item.name === activeView;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.name)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wider
                    transition-all duration-300
                    ${isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 dark:text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-300 dark:border-slate-700 py-3 space-y-2">
            {navItems.map((item) => {
              const isActive = item.name === activeView;
              return (
                <button
                  key={item.name}
                  onClick={() => handleMobileNavigate(item.name)}
                  className={`
                    w-full px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-left
                    transition-all duration-300
                    ${isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 dark:text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100'
                    }
                  `}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

      </nav>
    </header>
  );
});

export default Header;