import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { PwaPrompt } from './components/PwaPrompt';
import { InteractiveSystemTestModal, TestScenarioType } from './components/InteractiveSystemTestModal';
import { StorageService } from './services/storage';
import { Profile } from './types';

const LandingPage = React.lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const PublicShopPage = React.lazy(() => import('./pages/PublicShopPage').then(m => ({ default: m.PublicShopPage })));
const CustomerDashboardPage = React.lazy(() => import('./pages/CustomerDashboardPage').then(m => ({ default: m.CustomerDashboardPage })));
const ShopkeeperPanelPage = React.lazy(() => import('./pages/ShopkeeperPanelPage').then(m => ({ default: m.ShopkeeperPanelPage })));
const MarketerPage = React.lazy(() => import('./pages/MarketerPage').then(m => ({ default: m.MarketerPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const PrintPage = React.lazy(() => import('./pages/PrintPage').then(m => ({ default: m.PrintPage })));
const DatabaseStudioPage = React.lazy(() => import('./pages/DatabaseStudioPage').then(m => ({ default: m.DatabaseStudioPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const MarketerRegisterPage = React.lazy(() => import('./pages/MarketerRegisterPage').then(m => ({ default: m.MarketerRegisterPage })));

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">در حال بارگذاری...</p>
  </div>
);

export function App() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDark(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("theme-change", handleThemeChange);
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);

    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, [isDark]);

  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState<boolean>(false);
  const [testScenario, setTestScenario] = useState<TestScenarioType>('e2e_full');

  const toggleTheme = () => {
    const newTheme = !isDark; setIsDark(newTheme); localStorage.setItem("theme_preference_set", "true");
  };

  const handleStartTest = (scenario: TestScenarioType = 'e2e_full') => {
    setTestScenario(scenario);
    setIsTestRunnerOpen(true);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        <Navbar 
          currentUser={currentUser} 
          onThemeToggle={toggleTheme} 
          isDark={isDark} 
          onOpenTestRunner={() => handleStartTest('e2e_full')}
        />
        <main>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/shop/:slug" element={<PublicShopPage />} />
              <Route path="/dashboard" element={<CustomerDashboardPage />} />
              <Route path="/panel/:shopId" element={<ShopkeeperPanelPage />} />
              <Route path="/marketer" element={<MarketerPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/database" element={<DatabaseStudioPage />} />
              <Route path="/database" element={<DatabaseStudioPage />} />
              <Route path="/print/:shopId" element={<PrintPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/marketer-register" element={<MarketerRegisterPage />} />
              <Route path="/join-marketer" element={<MarketerRegisterPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </main>
        <BottomNav />
        <PwaPrompt />

        {/* Global Interactive System Test Runner Overlay */}
        <InteractiveSystemTestModal
          isOpen={isTestRunnerOpen}
          onClose={() => setIsTestRunnerOpen(false)}
          initialScenario={testScenario}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
