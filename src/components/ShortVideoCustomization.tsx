import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, Zap } from 'lucide-react';
import { BiographyPreferences } from '../types';
import { PlatformPreview } from './PlatformPreview';

interface ShortVideoCustomizationProps {
  preferences: BiographyPreferences;
  setPreferences: (update: (prev: BiographyPreferences) => BiographyPreferences) => void;
  platform: string;
}

export const ShortVideoCustomization: React.FC<ShortVideoCustomizationProps> = ({
  preferences,
  setPreferences,
  platform
}) => {
  const platformNames = {
    'tiktok': 'TikTok',
    'instagram-reels': 'Instagram Reels',
    'youtube-shorts': 'YouTube Shorts'
  };

  const platformName = platformNames[platform as keyof typeof platformNames] || platform;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
          <Zap className="w-5 h-5 text-purple-500 mr-2" />
          {platformName} Content Settings
        </h3>
        <p className="text-sm text-gray-600">
          Optimized for {platformName} - Focus on immediate engagement and visual storytelling
        </p>
      </div>

      {/* Duration Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Video Duration
        </label>
        <div className="space-y-3">
          {[
            { value: '15-30', label: '15-30 seconds', description: 'Quick hook' },
            { value: '30-60', label: '30-60 seconds', description: 'Story + point' },
            { value: '60-90', label: '60-90 seconds', description: 'Detailed explanation' }
          ].map((option) => (
            <motion.label
              key={option.value}
              whileHover={{ scale: 1.01 }}
              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                preferences.duration === option.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <input
                type="radio"
                name="duration"
                value={option.value}
                checked={preferences.duration === option.value}
                onChange={(e) => setPreferences(prev => ({ ...prev, duration: e.target.value }))}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-500">{option.description}</div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                preferences.duration === option.value
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300'
              }`}>
                {preferences.duration === option.value && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                )}
              </div>
            </motion.label>
          ))}
        </div>
      </div>

      {/* Content Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Content Style
        </label>
        <select
          value={preferences.contentStyle || ''}
          onChange={(e) => setPreferences(prev => ({ ...prev, contentStyle: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Select content style</option>
          <option value="educational">📚 Educational - How-to, tips, facts</option>
          <option value="entertainment">🎉 Entertainment - Fun, trending, comedy</option>
          <option value="trending">📈 Trending - Current events, viral topics</option>
          <option value="personal">💭 Personal Story - Authentic, relatable</option>
        </select>
      </div>

      {/* Hook Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2" />
          Hook Strategy
        </label>
        <select
          value={preferences.hookType || ''}
          onChange={(e) => setPreferences(prev => ({ ...prev, hookType: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Select hook type</option>
          <option value="question">❓ Question - "Did you know that..."</option>
          <option value="bold_statement">⚡ Bold Statement - "This changed everything..."</option>
          <option value="surprising_fact">🤯 Surprising Fact - "Most people don't realize..."</option>
          <option value="story_opening">📖 Story Opening - "Let me tell you about..."</option>
        </select>
      </div>

      {/* Call to Action */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Call-to-Action
        </label>
        <select
          value={preferences.callToAction || ''}
          onChange={(e) => setPreferences(prev => ({ ...prev, callToAction: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Select call-to-action</option>
          <option value="follow">Follow for more content</option>
          <option value="like_share">Like and share this</option>
          <option value="comment">Comment your thoughts</option>
          <option value="link_bio">Visit link in bio</option>
        </select>
      </div>

      {/* Real-time Platform Preview */}
      <PlatformPreview platform={platform} preferences={preferences} />
    </div>
  );
}; 