import React from 'react';
import { Clock, Users, Hash, MessageSquare } from 'lucide-react';
import { BiographyPreferences } from '../types';

interface PlatformPreviewProps {
  platform: string;
  preferences: BiographyPreferences;
}

export const PlatformPreview: React.FC<PlatformPreviewProps> = ({ platform, preferences }) => {
  const getPlatformInfo = () => {
    const shortVideoPlatforms = ['tiktok', 'instagram-reels', 'youtube-shorts'];
    
    if (shortVideoPlatforms.includes(platform)) {
      return {
        name: platform === 'tiktok' ? 'TikTok' : 
              platform === 'instagram-reels' ? 'Instagram Reels' : 'YouTube Shorts',
        limits: {
          duration: preferences.duration ? `${preferences.duration} seconds` : 'Not set',
          characterLimit: '150 characters for caption',
          hashtagLimit: '3-5 hashtags recommended'
        },
        color: 'purple'
      };
    } else if (platform === 'youtube') {
      return {
        name: 'YouTube',
        limits: {
          duration: preferences.targetLength ? `${preferences.targetLength} minutes` : '7-11 minutes recommended',
          titleLimit: '60 characters for title',
          descriptionLimit: '125 characters visible in preview'
        },
        color: 'red'
      };
    } else if (platform === 'linkedin') {
      return {
        name: 'LinkedIn',
        limits: {
          characterLimit: preferences.postLength === 'short' ? '1-2 paragraphs' :
                         preferences.postLength === 'medium' ? '3-4 paragraphs' :
                         preferences.postLength === 'long' ? '5+ paragraphs' : 'Not set',
          hashtagLimit: '3-5 professional hashtags',
          engagementTip: 'Questions increase comments by 50%'
        },
        color: 'blue'
      };
    } else if (platform === 'facebook') {
      return {
        name: 'Facebook',
        limits: {
          characterLimit: '250 characters visible without "See More"',
          optimalLength: '40-80 characters for highest engagement',
          imageRecommendation: 'Include image for 2.3x more engagement'
        },
        color: 'blue'
      };
    }
    
    return {
      name: platform,
      limits: {},
      color: 'gray'
    };
  };

  const platformInfo = getPlatformInfo();

  return (
    <div className={`bg-gradient-to-br from-${platformInfo.color}-50 to-${platformInfo.color}-100 p-4 rounded-lg border border-${platformInfo.color}-200`}>
      <div className="flex items-center mb-3">
        <Clock className={`w-5 h-5 text-${platformInfo.color}-600 mr-2`} />
        <h4 className={`font-medium text-${platformInfo.color}-900`}>
          {platformInfo.name} Optimization Preview
        </h4>
      </div>
      
      <div className="space-y-2 text-sm">
        {Object.entries(platformInfo.limits).map(([key, value]) => (
          <div key={key} className={`flex justify-between text-${platformInfo.color}-700`}>
            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>

      {/* Show selected preferences summary */}
      {Object.keys(preferences).length > 2 && (
        <div className={`mt-3 pt-3 border-t border-${platformInfo.color}-200`}>
          <h5 className={`font-medium text-${platformInfo.color}-900 mb-2`}>Your Settings:</h5>
          <div className="space-y-1 text-xs">
            {preferences.duration && (
              <div className={`text-${platformInfo.color}-600`}>
                Duration: {preferences.duration} seconds
              </div>
            )}
            {preferences.contentStyle && (
              <div className={`text-${platformInfo.color}-600`}>
                Style: {preferences.contentStyle}
              </div>
            )}
            {preferences.hookType && (
              <div className={`text-${platformInfo.color}-600`}>
                Hook: {preferences.hookType.replace('_', ' ')}
              </div>
            )}
            {preferences.targetLength && (
              <div className={`text-${platformInfo.color}-600`}>
                Length: {preferences.targetLength} minutes
              </div>
            )}
            {preferences.videoFormat && (
              <div className={`text-${platformInfo.color}-600`}>
                Format: {preferences.videoFormat}
              </div>
            )}
            {preferences.contentTone && (
              <div className={`text-${platformInfo.color}-600`}>
                Tone: {preferences.contentTone.replace('_', ' ')}
              </div>
            )}
            {preferences.postLength && (
              <div className={`text-${platformInfo.color}-600`}>
                Length: {preferences.postLength}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 