import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, Clock, Users, ListChecks } from 'lucide-react';
import { BiographyPreferences } from '../types';
import { PlatformPreview } from './PlatformPreview';

interface YouTubeVideoCustomizationProps {
  preferences: BiographyPreferences;
  setPreferences: (update: (prev: BiographyPreferences) => BiographyPreferences) => void;
}

export const YouTubeVideoCustomization: React.FC<YouTubeVideoCustomizationProps> = ({
  preferences,
  setPreferences
}) => {
  const handleStructureElementChange = (value: string, checked: boolean) => {
    const currentElements = preferences.structureElements || [];
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        structureElements: [...currentElements, value]
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        structureElements: currentElements.filter(element => element !== value)
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
          <Youtube className="w-5 h-5 text-red-500 mr-2" />
          YouTube Video Settings
        </h3>
        <p className="text-sm text-gray-600">
          Optimized for 7-11 minute YouTube videos with high engagement and retention
        </p>
      </div>

      {/* Target Length */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Target Video Length
        </label>
        <div className="space-y-3">
          {[
            { value: '7-8', label: '7-8 minutes', description: 'Concise, focused' },
            { value: '8-10', label: '8-10 minutes', description: 'Detailed explanation' },
            { value: '10-11', label: '10-11 minutes', description: 'Comprehensive deep-dive' }
          ].map((option) => (
            <motion.label
              key={option.value}
              whileHover={{ scale: 1.01 }}
              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                preferences.targetLength === option.value
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <input
                type="radio"
                name="targetLength"
                value={option.value}
                checked={preferences.targetLength === option.value}
                onChange={(e) => setPreferences(prev => ({ ...prev, targetLength: e.target.value }))}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-500">{option.description}</div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                preferences.targetLength === option.value
                  ? 'border-red-500 bg-red-500'
                  : 'border-gray-300'
              }`}>
                {preferences.targetLength === option.value && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                )}
              </div>
            </motion.label>
          ))}
        </div>
      </div>

      {/* Video Format */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Video Format
        </label>
        <select
          value={preferences.videoFormat || ''}
          onChange={(e) => setPreferences(prev => ({ ...prev, videoFormat: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">Select video format</option>
          <option value="tutorial">🎓 Tutorial - Step-by-step guide</option>
          <option value="educational">📚 Educational - Informative content</option>
          <option value="commentary">💬 Commentary - Opinion, reaction</option>
          <option value="storytelling">📖 Storytelling - Narrative-driven</option>
        </select>
      </div>

      {/* Engagement Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Users className="w-4 h-4 mr-2" />
          Engagement Style
        </label>
        <select
          value={preferences.engagementStyle || ''}
          onChange={(e) => setPreferences(prev => ({ ...prev, engagementStyle: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">Select engagement style</option>
          <option value="casual">😊 Casual & Friendly</option>
          <option value="professional">👔 Professional & Polished</option>
          <option value="enthusiastic">🎯 Enthusiastic & Energetic</option>
          <option value="conversational">💬 Conversational & Intimate</option>
        </select>
      </div>

      {/* Structure Elements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
          <ListChecks className="w-4 h-4 mr-2" />
          Video Structure Elements
        </label>
        <div className="space-y-3">
          {[
            { value: 'intro_hook', label: 'Strong intro hook (0-15 seconds)', default: true },
            { value: 'chapter_breaks', label: 'Chapter breaks with timestamps', default: true },
            { value: 'engagement_prompts', label: 'Mid-video engagement prompts', default: true },
            { value: 'strong_conclusion', label: 'Strong conclusion with CTA', default: true }
          ].map((option) => {
            const isChecked = preferences.structureElements?.includes(option.value) ?? option.default;
            
            return (
              <motion.label
                key={option.value}
                whileHover={{ scale: 1.01 }}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isChecked
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleStructureElementChange(option.value, e.target.checked)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isChecked
                    ? 'border-red-500 bg-red-500'
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

      {/* Real-time Platform Preview */}
      <PlatformPreview platform="youtube" preferences={preferences} />
    </div>
  );
}; 