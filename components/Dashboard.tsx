
// FIX: Corrected the import statement for React hooks to resolve reference errors.
import React, { useState, useEffect } from 'react';
import { BusinessProfile, DailyActivity, SocialPost, Theme } from '../types';
import ActivityCard from './ActivityCard';
import { SearchIcon } from './icons/SearchIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CursorArrowRaysIcon } from './icons/CursorArrowRaysIcon';
import * as geminiService from '../services/geminiService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface Props {
  profile: BusinessProfile;
  activity: DailyActivity | null;
  onEditProfile: () => void;
  onUpdatePost: (post: SocialPost) => void;
  theme: Theme;
}

const Dashboard: React.FC<Props> = ({ profile, activity, onEditProfile, onUpdatePost, theme }) => {
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editablePrompt, setEditablePrompt] = useState("");
  const [isEditingText, setIsEditingText] = useState(false);
  const [editableText, setEditableText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [chartColors, setChartColors] = useState<string[]>([]);

  useEffect(() => {
    if (activity) {
        setEditablePrompt(activity.post.imagePrompt);
        setEditableText(activity.post.text);
    }
  }, [activity]);

  useEffect(() => {
    const updateChartColors = () => {
        const rootStyle = getComputedStyle(document.documentElement);
        const colors = [
            rootStyle.getPropertyValue('--chart-color-1').trim(),
            rootStyle.getPropertyValue('--chart-color-2').trim(),
            rootStyle.getPropertyValue('--chart-color-3').trim(),
        ];
        if (colors.every(color => color)) { 
            setChartColors(colors);
        }
    };
    // A small timeout to allow CSS variables to apply after a theme switch
    const timer = setTimeout(updateChartColors, 50);
    return () => clearTimeout(timer);
  }, [theme]);

  const handleRegenerateImage = async () => {
    if (!activity) return;
    setIsProcessingImage(true);
    setError(null);
    try {
        const newImageUrl = await geminiService.generateImage(activity.post.imagePrompt);
        onUpdatePost({ ...activity.post, imageUrl: newImageUrl });
    } catch (err) {
        console.error("Failed to regenerate image", err);
        setError(err instanceof Error ? err.message : 'Image regeneration failed.');
    } finally {
        setIsProcessingImage(false);
    }
  };

  const handleRegeneratePromptAndImage = async () => {
    if (!activity) return;
    setIsProcessingImage(true);
    setError(null);
    try {
        const newPrompt = await geminiService.regenerateImagePrompt(profile, activity.keywords[0].keyword);
        const newImageUrl = await geminiService.generateImage(newPrompt);
        onUpdatePost({ ...activity.post, imageUrl: newImageUrl, imagePrompt: newPrompt });
    } catch (err) {
        console.error("Failed to regenerate prompt and image", err);
        setError(err instanceof Error ? err.message : 'Failed to generate a new prompt and image.');
    } finally {
        setIsProcessingImage(false);
    }
  };

  const handleGenerateWithNewPrompt = async () => {
      if (!activity || !editablePrompt) return;
      setIsProcessingImage(true);
      setError(null);
      try {
          const newImageUrl = await geminiService.generateImage(editablePrompt);
          onUpdatePost({ ...activity.post, imageUrl: newImageUrl, imagePrompt: editablePrompt });
          setIsEditingPrompt(false);
      } catch (err) {
          console.error("Failed to regenerate image with new prompt", err);
          setError(err instanceof Error ? err.message : 'Image generation with new prompt failed.');
      } finally {
          setIsProcessingImage(false);
      }
  };

  const handleSaveText = () => {
    if (!activity) return;
    onUpdatePost({ ...activity.post, text: editableText });
    setIsEditingText(false);
  };

  const handleCancelEditText = () => {
      setIsEditingText(false);
      setEditableText(activity?.post.text || "");
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="glass-card p-6 rounded-2xl flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{profile.name}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{profile.description}</p>
        </div>
        <button onClick={onEditProfile} className="btn-secondary text-sm font-semibold py-2 px-4 rounded-lg transition" style={{ color: 'var(--text-primary)'}}>
          Edit Profile
        </button>
      </div>
      
      {activity ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Social Post - Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <ActivityCard title="Today's Social Post" icon={<MegaphoneIcon />}>
              <div className="space-y-4">
                <div className="relative aspect-square">
                    <img src={activity.post.imageUrl} alt="AI generated social media graphic" className="rounded-lg object-cover w-full h-full shadow-2xl shadow-black/50"/>
                    {isProcessingImage && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg transition-opacity duration-300">
                            <SparklesIcon className="w-12 h-12 text-blue-400 animate-pulse" />
                            <p className="mt-2 text-sm" style={{ color: 'var(--text-primary)'}}>Generating new image...</p>
                        </div>
                    )}
                </div>
                
                {isEditingText ? (
                    <div className="space-y-3">
                        <label htmlFor="postText" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)'}}>Edit Post Content:</label>
                        <textarea
                            id="postText"
                            value={editableText}
                            onChange={(e) => setEditableText(e.target.value)}
                            rows={6}
                            className="w-full form-input rounded-lg px-3 py-2 focus:outline-none transition"
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={handleCancelEditText} className="btn-secondary text-sm font-semibold py-2 px-4 rounded-lg transition" style={{ color: 'var(--text-primary)'}}>
                                Cancel
                            </button>
                            <button onClick={handleSaveText} className="btn-primary text-sm text-white font-semibold py-2 px-4 rounded-lg transition">
                                Save Changes
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                         <div className="flex justify-between items-center">
                            <h4 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)'}}>Post Content:</h4>
                            <button onClick={() => setIsEditingText(true)} className="btn-secondary text-xs py-1 px-3 rounded-md transition hover:bg-white/20">Edit</button>
                         </div>
                        <p className="whitespace-pre-wrap font-sans text-base" style={{ color: 'var(--text-secondary)'}}>{activity.post.text}</p>
                    </div>
                )}
                
                <div className="p-4 bg-white/5 rounded-lg border border-dashed border-white/20">
                  <p className="font-semibold text-center italic" style={{ color: 'var(--accent-primary)' }}>"{activity.post.interactiveQuestion}"</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2 text-center flex items-center justify-center gap-2" style={{ color: 'var(--text-secondary)'}}>
                    <CursorArrowRaysIcon className="w-5 h-5" />
                    Suggested Call-to-Action
                  </h4>
                  <button disabled className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg opacity-50 cursor-not-allowed shadow-md">
                    {activity.post.ctaSuggestion}
                  </button>
                </div>


                {isEditingPrompt ? (
                    <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)'}}>
                        <label htmlFor="imagePrompt" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)'}}>Edit Image Prompt:</label>
                        <textarea
                            id="imagePrompt"
                            value={editablePrompt}
                            onChange={(e) => setEditablePrompt(e.target.value)}
                            rows={4}
                            className="w-full form-input rounded-lg px-3 py-2 focus:outline-none transition"
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setIsEditingPrompt(false)} className="btn-secondary text-sm font-semibold py-2 px-4 rounded-lg transition" style={{ color: 'var(--text-primary)'}}>
                                Cancel
                            </button>
                            <button onClick={handleGenerateWithNewPrompt} disabled={isProcessingImage || !editablePrompt} className="btn-primary text-sm disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-1.5">
                                <SparklesIcon className="w-4 h-4" />
                                Generate
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2 pt-4 border-t" style={{ borderColor: 'var(--border-color)'}}>
                        <div className="p-3 bg-white/5 rounded-lg">
                           <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--accent-primary)' }}>Image Prompt:</h4>
                           <p className="text-xs italic" style={{ color: 'var(--text-secondary)'}}>"{activity.post.imagePrompt}"</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                             <button onClick={handleRegeneratePromptAndImage} disabled={isProcessingImage} className="btn-secondary text-sm font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed" style={{ color: 'var(--text-primary)'}}>
                                <SparklesIcon className="w-4 h-4" />
                                New Idea
                            </button>
                             <button onClick={handleRegenerateImage} disabled={isProcessingImage} className="btn-secondary text-sm font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed" style={{ color: 'var(--text-primary)'}}>
                                <RefreshIcon className={`w-4 h-4 ${isProcessingImage ? 'animate-spin' : ''}`} />
                                Retry
                            </button>
                        </div>
                         <button onClick={() => setIsEditingPrompt(true)} disabled={isProcessingImage} className="btn-secondary w-full text-sm font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50" style={{ color: 'var(--text-primary)'}}>
                            Edit Prompt & Generate
                        </button>
                    </div>
                )}
                {error && <p className="text-sm text-red-400 mt-2 text-center">{error}</p>}
              </div>
            </ActivityCard>
          </div>
          
          {/* Keywords and SEO - Right Column */}
          <div className="lg:col-span-2 space-y-8">
            <ActivityCard title="Today's Trending Keywords" icon={<SearchIcon />}>
              <div className="space-y-4">
                {activity.keywords.map((kw, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <h4 className="font-bold" style={{ color: 'var(--accent-primary)' }}>{kw.keyword}</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)'}}>{kw.explanation}</p>
                  </div>
                ))}
                 <div className="h-64 mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activity.keywords} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="keyword" tick={{ fill: 'var(--text-secondary)' }} fontSize={12} />
                        <YAxis tick={{ fill: 'var(--text-secondary)' }} fontSize={12} domain={[0, 100]}/>
                        <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} />
                        <Bar dataKey="score" name="Popularity Score" radius={[4, 4, 0, 0]}>
                           {activity.keywords.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                           ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            </ActivityCard>
            
            <ActivityCard title="AI-Generated SEO Suggestions" icon={<ChartBarIcon />}>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>Meta Descriptions:</h4>
                  <ul className="list-disc list-inside space-y-2 pl-2" style={{ color: 'var(--text-secondary)'}}>
                    {activity.seo.metaDescriptions.map((desc, i) => <li key={i}>{desc}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>Meta Keywords:</h4>
                  <div className="flex flex-wrap gap-2">
                    {activity.seo.metaKeywords.map((kw, i) => (
                      <span key={i} className="bg-white/10 text-sm font-medium px-3 py-1 rounded-full" style={{ color: 'var(--text-secondary)'}}>{kw}</span>
                    ))}
                  </div>
                </div>
              </div>
            </ActivityCard>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 glass-card rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome!</h3>
          <p className="mt-2" style={{ color: 'var(--text-secondary)'}}>Click the button below to generate your first AI-powered update.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;