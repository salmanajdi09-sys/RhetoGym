import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/i18n';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import Landing from '@/pages/Landing';
import Drills from '@/pages/Drills';
import RebuttalBlitz from '@/pages/RebuttalBlitz';
import Soapbox from '@/pages/Soapbox';
import ThinkFast from '@/pages/ThinkFast';
import Review from '@/pages/Review';
import About from '@/pages/About';
import Feedback from '@/pages/Feedback';
import Contact from '@/pages/Contact';
import SpeakingTips from '@/pages/SpeakingTips';
import FloatingStreakBadge from '@/components/FloatingStreakBadge';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <>
      <FloatingStreakBadge />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/train" element={<Drills />} />
          <Route path="/drills/rebuttal-blitz" element={<RebuttalBlitz />} />
          <Route path="/drills/think-fast" element={<ThinkFast />} />
          <Route path="/soapbox" element={<Soapbox />} />
          <Route path="/review" element={<Review />} />
          <Route path="/about" element={<About />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/tips" element={<SpeakingTips />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
      <Analytics />
      <SpeedInsights />
    </LanguageProvider>
  )
}

export default App
