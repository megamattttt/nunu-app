import React, { useCallback, useEffect, useState } from 'react';
import TabBar, { type Page } from './components/TabBar';
import { RewardOverlay, Toast } from './components/Overlays';
import { useGame } from './state/store';
import Login from './screens/Login';
import Home from './screens/Home';
import Quests from './screens/Quests';
import Duels from './screens/Duels';
import League from './screens/League';
import Profile from './screens/Profile';
import Discover from './screens/routes/Discover';
import NewQuest from './screens/routes/NewQuest';
import Validate from './screens/routes/Validate';
import Feed from './screens/routes/Feed';
import Shop from './screens/routes/Shop';
import AvatarStudio from './screens/routes/AvatarStudio';
import Diorama from './screens/routes/Diorama';
import Banner from './screens/routes/Banner';
import DuelQuiz from './screens/routes/DuelQuiz';

export type Route = { name: string; data?: any } | null;
export type Nav = {
  page: Page; route: Route;
  go: (p: Page) => void;
  open: (name: string, data?: any) => void;
  back: () => void;
};

export default function App() {
  const { s } = useGame();
  const [page, setPage] = useState<Page>('home');
  const [stack, setStack] = useState<Route[]>([]);
  const route = stack[stack.length - 1] || null;

  const go = useCallback((p: Page) => { setStack([]); setPage(p); window.scrollTo(0, 0); }, []);
  const open = useCallback((name: string, data?: any) => { setStack((st) => [...st, { name, data }]); window.scrollTo(0, 0); }, []);
  const back = useCallback(() => { setStack((st) => st.slice(0, -1)); }, []);

  // Bouton retour Android / geste iOS.
  useEffect(() => {
    const onPop = () => { if (stack.length) back(); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [stack.length, back]);

  const nav: Nav = { page, route, go, open, back };

  if (!s.logged) return (<><Login /><Toast /></>);

  const ROUTES: Record<string, JSX.Element> = {
    discover: <Discover nav={nav} />,
    newquest: <NewQuest nav={nav} />,
    validate: <Validate nav={nav} />,
    feed: <Feed nav={nav} />,
    shop: <Shop nav={nav} />,
    avatar: <AvatarStudio nav={nav} />,
    diorama: <Diorama nav={nav} />,
    banner: <Banner nav={nav} />,
    quiz: <DuelQuiz nav={nav} />
  };

  const PAGES: Record<Page, JSX.Element> = {
    home: <Home nav={nav} />,
    quests: <Quests nav={nav} />,
    duels: <Duels nav={nav} />,
    league: <League nav={nav} />,
    profile: <Profile nav={nav} />
  };

  const openInvits = s.invitsOpen.length;

  return (
    <>
      <main
        key={route ? route.name + stack.length : page}
        style={{
          flex: 1, minHeight: '100dvh',
          paddingTop: 'var(--safe-top)',
          paddingBottom: 'calc(var(--nav-h) + var(--safe-bottom))',
          animation: 'nuPage .3s cubic-bezier(.2,1,.3,1)'
        }}
      >
        {route ? ROUTES[route.name] || PAGES[page] : PAGES[page]}
      </main>
      <TabBar page={page} onGo={go} badge={{ duels: openInvits || undefined }} />
      <Toast />
      <RewardOverlay />
    </>
  );
}
