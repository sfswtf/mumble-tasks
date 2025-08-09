import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Briefcase, Target, Hash } from 'lucide-react';
import { BiographyPreferences } from '../types';
import { PlatformPreview } from './PlatformPreview';

interface LinkedInPostCustomizationProps {
  preferences: BiographyPreferences;
  setPreferences: (update: (prev: BiographyPreferences) => BiographyPreferences) => void;
}

export const LinkedInPostCustomization: React.FC<LinkedInPostCustomizationProps> = ({
  preferences,
  setPreferences
}) => {
  const handleEngagementFeatureChange = (value: string, checked: boolean) => {
    const currentFeatures = preferences.engagementFeatures || [];
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        engagementFeatures: [...currentFeatures, value]
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        engagementFeatures: currentFeatures.filter(feature => feature !== value)
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
          <Linkedin className="w-5 h-5 text-blue-600 mr-2" />
          LinkedIn Post Settings
        </h3>
        <p className="text-sm text-gray-600">
          Optimized for professional networking and thought leadership
        </p>
      </div>

      {/* Content Tone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Briefcase className="w-4 h-4 mr-2" />
          Content Tone
        </label>
        <select
          value={preferences.contentTone || ''}
          onChange={(e) => setPreferences(prev => ({ ...prev, contentTone: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select content tone</option>
          <option value="professional_insights">💼 Professional Insights</option>
          <option value="thought_leadership">🏆 Thought Leadership</option>
          <option value="personal_brand">👤 Personal Brand Story</option>
          <option value="industry_analysis">📊 Industry Analysis</option>
        </select>
      </div>

      {/* Post Length */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Post Length
        </label>
        <div className="space-y-3">
          {[
            { value: 'short', label: 'Short & Punchy', description: '1-2 paragraphs' },
            { value: 'medium', label: 'Medium Detail', description: '3-4 paragraphs' },
            { value: 'long', label: 'Long-form Deep Dive', description: '5+ paragraphs' }
          ].map((option) => (
            <motion.label
              key={option.value}
              whileHover={{ scale: 1.01 }}
              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                preferences.postLength === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <input
                type="radio"
                name="postLength"
                value={option.value}
                checked={preferences.postLength === option.value}
                onChange={(e) => setPreferences(prev => ({ ...prev, postLength: e.target.value }))}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-500">{option.description}</div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                preferences.postLength === option.value
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {preferences.postLength === option.value && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                )}
              </div>
            </motion.label>
          ))}
        </div>
      </div>

      {/* Engagement Features */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Hash className="w-4 h-4 mr-2" />
          Engagement Features
        </label>
        <div className="space-y-3">
          {[
            { value: 'industry_hashtags', label: 'Industry-relevant hashtags', default: true },
            { value: 'personal_story', label: 'Personal story elements', default: false },
            { value: 'question_comments', label: 'Question for comments', default: true },
            { value: 'call_connections', label: 'Call for connections/discussion', default: false }
          ].map((option) => {
            const isChecked = preferences.engagementFeatures?.includes(option.value) ?? option.default;
            
            return (
              <motion.label
                key={option.value}
                whileHover={{ scale: 1.01 }}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isChecked
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleEngagementFeatureChange(option.value, e.target.checked)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isChecked
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {isChecked && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </motion.label>
            );
          })}
        </div>
      </div>

      {/* Professional Focus */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2" />
          Professional Focus
        </label>
        <select
          value={preferences.professionalFocus || ''}
          onChange={(e) => setPreferences(prev => ({ ...prev, professionalFocus: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select professional focus</option>
          <option value="career_development">Career development</option>
          <option value="industry_trends">Industry trends</option>
          <option value="business_insights">Business insights</option>
          <option value="leadership_lessons">Leadership lessons</option>
        </select>
      </div>

      {/* Real-time Platform Preview */}
      <PlatformPreview platform="linkedin" preferences={preferences} />
    </div>
  );
}; 