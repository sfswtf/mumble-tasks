import React from 'react';
import { BiographyContent } from '../../types';
import ShortVideoScriptOutput from './ShortVideoScriptOutput';
import YouTubeScriptOutput from './YouTubeScriptOutput';
import LinkedInPostOutput from './LinkedInPostOutput';
import FacebookPostOutput from './FacebookPostOutput';
import ProfessionalDocumentOutput from './ProfessionalDocumentOutput';

interface ScriptOutputRendererProps {
  results: BiographyContent;
  platform: string;
  customization: any;
}

export default function ScriptOutputRenderer({ results, platform, customization }: ScriptOutputRendererProps) {
  if (!results?.content) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <p className="text-gray-600">No content available</p>
      </div>
    );
  }

  // Determine which output component to render based on platform
  if (['tiktok', 'instagram-reels', 'youtube-shorts'].includes(platform)) {
    return <ShortVideoScriptOutput results={results} platform={platform} customization={customization} />;
  }
  
  if (platform === 'youtube') {
    return <YouTubeScriptOutput results={results} customization={customization} />;
  }
  
  if (platform === 'linkedin') {
    return <LinkedInPostOutput results={results} customization={customization} />;
  }
  
  if (platform === 'facebook') {
    return <FacebookPostOutput results={results} customization={customization} />;
  }
  
  if (platform === 'professional-documents') {
    const documentType = customization.documentType || 'email';
    return (
      <ProfessionalDocumentOutput 
        results={results} 
        documentType={documentType}
        customization={customization}
        language={customization.language || 'en'}
      />
    );
  }

  // Fallback to generic display for unknown platforms
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="prose max-w-none">
        <div className="whitespace-pre-wrap text-gray-700">{results.content}</div>
      </div>
    </div>
  );
} 