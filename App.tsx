import React, { useState, useCallback, useEffect } from 'react';
import { BusinessProfile, DailyActivity, AppStatus, SocialPost, Theme } from './types';
import BusinessProfileForm from './components/BusinessProfileForm';
import Dashboard from './components/Dashboard';
import Loader from './components/Loader';
import { SparklesIcon } from './components/icons/SparklesIcon';
import * as geminiService from './services/geminiService';
import ThemeSwitcher from './components/ThemeSwitcher';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.CONFIG);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleProfileSubmit = (profile: BusinessProfile) => {
    setBusinessProfile(profile);
    setStatus(AppStatus.READY);
  };
  
  const handleEditProfile = () => {
    setStatus(AppStatus.CONFIG);
    setDailyActivity(null);
  };

  const handleUpdatePost = (post: SocialPost) => {
    if (!dailyActivity) return;
    setDailyActivity(prevState => {
        if (!prevState) return null;
        return {
            ...prevState,
            post: post,
        }
    });
  };

  const handleGenerateUpdate = useCallback(async () => {
    if (!businessProfile) return;

    setStatus(AppStatus.LOADING);
    setError(null);
    setDailyActivity(null);

    try {
      const keywords = await geminiService.getTrendingKeywords(businessProfile);
      const seo = await geminiService.generateSEOSuggestions(businessProfile, keywords);
      const post = await geminiService.createSocialPost(businessProfile, keywords[0].keyword);

      setDailyActivity({
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        keywords,
        seo,
        post,
      });
      setStatus(AppStatus.READY);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please check the console.');
      setStatus(AppStatus.ERROR);
    }
  }, [businessProfile]);

  const renderContent = () => {
    switch (status) {
      case AppStatus.CONFIG:
        return <BusinessProfileForm onSubmit={handleProfileSubmit} initialProfile={businessProfile} />;
      case AppStatus.LOADING:
        return <Loader message="Our AI is crafting your daily update... This may take a moment." />;
      case AppStatus.READY:
        return businessProfile && <Dashboard theme={theme} profile={businessProfile} activity={dailyActivity} onEditProfile={handleEditProfile} onUpdatePost={handleUpdatePost} />;
      case AppStatus.ERROR:
        return (
          <div className="text-center text-red-400 p-8 glass-card rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Generation Failed</h2>
            <p>{error}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)'}}>AI Content Automator</h1>
          </div>
          <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />
        </header>
        
        <main>
          {renderContent()}
        </main>
      </div>

      {(status === AppStatus.READY || status === AppStatus.LOADING) && businessProfile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-sm border-t border-white/10 flex justify-center z-50">
          <button
            onClick={handleGenerateUpdate}
            disabled={status === AppStatus.LOADING}
            className="w-full max-w-md btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
          >
            <SparklesIcon className="w-5 h-5" />
            Generate Today's Update
          </button>
        </div>
      )}
    </div>
  );
};

export default App;