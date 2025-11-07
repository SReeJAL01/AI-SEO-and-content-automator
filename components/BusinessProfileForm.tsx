import React, { useState } from 'react';
import { BusinessProfile } from '../types';

interface Props {
  onSubmit: (profile: BusinessProfile) => void;
  initialProfile: BusinessProfile | null;
}

const BusinessProfileForm: React.FC<Props> = ({ onSubmit, initialProfile }) => {
  const [profile, setProfile] = useState<BusinessProfile>(
    initialProfile || {
      name: '',
      description: '',
      targetAudience: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.name && profile.description && profile.targetAudience) {
      onSubmit(profile);
    }
  };

  const isFormValid = profile.name && profile.description && profile.targetAudience;

  return (
    <div className="max-w-2xl mx-auto glass-card rounded-2xl p-8">
      <h2 className="text-3xl font-bold text-center text-white mb-2">Setup Your Business Profile</h2>
      <p className="text-center text-zinc-400 mb-8">Tell our AI about your business so it can work its magic.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">Business Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            placeholder="e.g., 'Innovate Solutions Inc.'"
            className="w-full form-input rounded-lg px-4 py-2 text-white focus:outline-none transition"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">What does your business do?</label>
          <textarea
            id="description"
            name="description"
            value={profile.description}
            onChange={handleChange}
            rows={3}
            placeholder="e.g., 'We provide cutting-edge AI-driven analytics for startups.'"
            className="w-full form-input rounded-lg px-4 py-2 text-white focus:outline-none transition"
            required
          />
        </div>
        
        <div>
          <label htmlFor="targetAudience" className="block text-sm font-medium text-zinc-300 mb-2">Who is your target audience?</label>
          <input
            type="text"
            id="targetAudience"
            name="targetAudience"
            value={profile.targetAudience}
            onChange={handleChange}
            placeholder="e.g., 'Tech entrepreneurs and small business owners'"
            className="w-full form-input rounded-lg px-4 py-2 text-white focus:outline-none transition"
            required
          />
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Save Profile & Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessProfileForm;