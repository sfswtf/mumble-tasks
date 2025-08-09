import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Users, MessageCircle, Smile } from 'lucide-react';
import { BiographyPreferences } from '../types';
import { PlatformPreview } from './PlatformPreview';

interface FacebookPostCustomizationProps {
  preferences: BiographyPreferences;
  setPreferences: (update: (prev: BiographyPreferences) => BiographyPreferences) => void;
}

export const FacebookPostCustomization: React.FC<FacebookPostCustomizationProps> = ({
  preferences,
  setPreferences
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
          <Facebook className="w-5 h-5 text-blue-600 mr-2" />
          Facebook Post Settings
        </h3>
        <p className="text-sm text-gray-600">
          Optimized for Facebook's diverse audience and community-building
        </p>
      </div>

      {/* Audience Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Users className="w-4 h-4 mr-2" />
          Target Audience
        </label>
        <select
          value={preferences.audienceType || ''}
          onChange={(e) => setPreferences(prev => ({ ...prev, audienceType: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select audience type</option>
          <option value="friends_family">👨‍👩‍👧‍👦 Friends & Family</option>
          <option value="business_page">🏢 Business Page</option>
          <option value="community_group">👥 Community Group</option>
          <option value="targeted_audience">🎯 Targeted Audience</option>
        </select>
      </div>

      {/* Engagement Goal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
          <MessageCircle className="w-4 h-4 mr-2" />
          Engagement Goal
        </label>
        <select
          value={preferences.engagementGoal || ''}
          onChange={(e) => setPreferences(prev => ({ ...prev, engagementGoal: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select engagement goal</option>
          <option value="discussion">💬 Discussion Starter</option>
          <option value="story_sharing">📖 Story Sharing</option>
          <option value="question_post">❓ Question Post</option>
          <option value="announcement">🎉 Announcement/Update</option>
        </select>
      </div>

      {/* Content Tone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Smile className="w-4 h-4 mr-2" />
          Content Tone
        </label>
        <select
          value={preferences.contentTone || ''}
          onChange={(e) => setPreferences(prev => ({ ...prev, contentTone: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select content tone</option>
          <option value="casual_friendly">😊 Casual & Friendly</option>
          <option value="inspiring_uplifting">✨ Inspiring & Uplifting</option>
          <option value="informative_helpful">📚 Informative & Helpful</option>
          <option value="entertaining_fun">🎭 Entertaining & Fun</option>
        </select>
      </div>

      {/* Post Purpose */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Platform-Specific Tips</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Facebook favors posts that spark conversation</li>
          <li>• Use emojis and visual elements to increase engagement</li>
          <li>• Consider asking questions to encourage comments</li>
          <li>• Personal stories perform well on Facebook</li>
        </ul>
      </div>

      {/* Real-time Platform Preview */}
      <PlatformPreview platform="facebook" preferences={preferences} />
    </div>
  );
}; 