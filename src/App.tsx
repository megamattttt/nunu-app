import React, { useCallback, useEffect, useState } from 'react';
import TabBar, { type Page } from './components/TabBar';
import { RewardOverlay, ResumeOverlay, Toast } from './components/Overlays';
import ShareCard from './components/ShareCard';
import { useGame } from './state/store';
import Login from './screens/Login';
import FirstRun from './screens/onboarding/FirstRun';
import Guide from './screens/onboarding/Guide';
import Home from './screens/Home';
import Quests from './screens/Quests';
import Duels from './screens/Duels';
import Profile from './screens/Profile';
import Discover from './screens/routes/Discover';
import NewQuest from './screens/routes/NewQuest';
import Validate from './screens/routes/Validate';
import Path from './screens/routes/Path';
import Feed from './screens/routes/Feed';
import Shop from './screens/routes/Shop';
import AvatarStudio from './screens/routes/AvatarStudio';
import Diorama from './screens/routes/Diorama';
import Journal from './screens/routes/Journal';
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

  if (!s.logged) return (<><Login /><Toast /><ResumeOverlay /></>);
  // Parcours obligatoire de première connexion : avatar → guide → compétence → première quête.
  if (!s.seen.onboarding) return (<><FirstRun /><Toast /><RewardOverlay /><ShareCard /><ResumeOverlay /></>);
  // Le guide rejouable prend tout l'écran : pas de dock à réserver.
  if (route?.name === 'guide') return (<><Guide onDone={back} onQuit={back} /><Toast /><ResumeOverlay /></>);

  const ROUTES: Record<string, JSX.Element> = {
    discover: <Discover nav={nav} />,
    newquest: <NewQuest nav={nav} />,
    validate: <Validate nav={nav} />,
    path: <Path nav={nav} />,
    feed: <Feed nav={nav} />,
    shop: <Shop nav={nav} />,
    avatar: <AvatarStudio nav={nav} />,
    diorama: <Diorama nav={nav} />,
    journal: <Journal nav={nav} />,
    banner: <Banner nav={nav} />,
    quiz: <DuelQuiz nav={nav} />
  };

  const PAGES: Record<Page, JSX.Element> = {
    home: <Home nav={nav} />,
    quests: <Quests nav={nav} />,
    duels: <Duels nav={nav} />,
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
          // Le dock est fixe : on réserve sa hauteur + une marge pour que
          // la dernière section d'un écran ne passe jamais dessous.
          paddingBottom: 'var(--dock-space)',
          animation: 'nuPage .3s cubic-bezier(.2,1,.3,1)'
        }}
      >
        {route ? ROUTES[route.name] || PAGES[page] : PAGES[page]}
      </main>
      <TabBar page={page} onGo={go} badge={{ duels: openInvits || undefined }} />
      <Toast />
      <RewardOverlay />
      <ShareCard />
      <ResumeOverlay />
    </>
  );
}
