import React, { useState, useEffect, Suspense } from 'react';
import { loadPlayersData, loadPlayerData, loadRecentMatches, loadEconomyData } from './constants';
import type { PlayerProfile, RecentMatch, EconomyData } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Header from './components/Header';
import PlayerSidebar from './components/PlayerSidebar';

// Lazy load page components for code splitting
const Home = React.lazy(() => import('./pages/Home'));
const Statistics = React.lazy(() => import('./pages/Statistics'));
const RecentMatches = React.lazy(() => import('./pages/RecentMatches'));
const Economy = React.lazy(() => import('./pages/Economy'));
const Settings = React.lazy(() => import('./pages/Settings'));

type NavView = 'Home' | 'Estadisticas' | 'Settings';
type PlayerSubView = 'Estadísticas';

const AppContent: React.FC = () => {
  const [playersData, setPlayersData] = useState<PlayerProfile[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [economyData, setEconomyData] = useState<EconomyData>({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<NavView>('Home');
  const [activeSubView, setActiveSubView] = useState<PlayerSubView>('Estadísticas');
  const { t } = useLanguage();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar datos desde data_player.json
        const response = await fetch('./data/data_player.json');
        if (response.ok) {
          const allPlayerData = await response.json();
          const playerGuids = Object.keys(allPlayerData);
          const players = playerGuids.map(guid => allPlayerData[guid]);

          setPlayersData(players);
          setSelectedPlayer(players[0] || null);
          setRecentMatches([]); // Mantener datos mock por ahora
          setEconomyData({ balance: 0, transactions: [] }); // Mantener datos mock por ahora
        } else {
          throw new Error('No se pudo cargar data_player.json');
        }
      } catch (error) {
        console.warn('Failed to load data from files, using mock data:', error);
        // Ya tenemos los datos mock por defecto
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-slate-400 text-lg">{t('general.loading')}</div>
        </div>
      );
    }

    const LoadingFallback = () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400 text-lg">{t('general.loading')}</div>
      </div>
    );

    switch(activeView) {
      case 'Home':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Home />
          </Suspense>
        );
      case 'Estadisticas':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Statistics player={selectedPlayer} />
          </Suspense>
        );
      case 'Settings':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Settings />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Home />
          </Suspense>
        );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header
        activeView={activeView}
        onNavigate={setActiveView}
        activeSubView={activeSubView}
        onNavigateSubView={setActiveSubView}
      />

      {activeView === 'Estadisticas' ? (
        <div className="flex">
          <PlayerSidebar
            players={playersData}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={setSelectedPlayer}
          />
          <div className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <main>
                {renderContent()}
              </main>

              <footer className="text-center mt-8 sm:mt-12 text-slate-400 dark:text-slate-500 text-xs sm:text-sm px-4">
                <p>{t('footer.text')}</p>
              </footer>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <main>
              {renderContent()}
            </main>

            <footer className="text-center mt-8 sm:mt-12 text-slate-400 dark:text-slate-500 text-xs sm:text-sm px-4">
              <p>{t('footer.text')}</p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;