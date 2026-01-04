import React, { useState, useEffect, Suspense } from 'react';
import { loadPlayersIndex, loadPlayerData, loadRecentMatches, loadEconomyData } from './constants';
import type { PlayerProfile, RecentMatch, EconomyData } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { SoundProvider } from './contexts/SoundContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Header from './components/layout/Header';

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

        const index = await loadPlayersIndex();


        const playerPromises = index.map(entry => loadPlayerData(entry.username));
        const players = (await Promise.all(playerPromises)).filter((p): p is PlayerProfile => p !== null);

        if (players.length > 0) {
          setPlayersData(players);

          if (!selectedPlayer || !players.find(p => p.guid === selectedPlayer.guid)) {
            setSelectedPlayer(players[0]);
          }
          setRecentMatches([]);
          setEconomyData({ balance: 0, transactions: [] });
        } else {
          console.warn('Players index is empty.');
        }
      } catch (error) {
        console.warn('Failed to load data:', error);
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

    switch (activeView) {
      case 'Home':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Home onNavigate={setActiveView} />
          </Suspense>
        );
      case 'Estadisticas':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Statistics
              player={selectedPlayer}
              players={playersData}
              onSelectPlayer={setSelectedPlayer}
            />
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
            <Home onNavigate={setActiveView} />
          </Suspense>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header
        activeView={activeView}
        onNavigate={setActiveView}
        activeSubView={activeSubView}
        onNavigateSubView={setActiveSubView}
      />

      {activeView === 'Estadisticas' ? (
        <main>
          {renderContent()}
        </main>
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
        <SoundProvider>
          <SettingsProvider>
            <AppContent />
          </SettingsProvider>
        </SoundProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;