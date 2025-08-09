import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Copy, Check, Download, Clock, List, Search, Tag } from 'lucide-react';
import { BiographyContent } from '../../types';

interface YouTubeScriptOutputProps {
  results: BiographyContent;
  customization: any;
}

export default function YouTubeScriptOutput({ results, customization }: YouTubeScriptOutputProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'seo' | 'production'>('script');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(results.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const handleDownload = (format: 'txt' | 'docx' | 'json') => {
    let content = '';
    let fileName = '';
    let mimeType = '';

    switch (format) {
      case 'txt':
        content = results.content;
        fileName = `youtube-script-${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
        break;
      case 'docx':
        // For now, export as text. Could enhance with actual DOCX generation later
        content = results.content;
        fileName = `youtube-production-${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
        break;
      case 'json':
        const productionData = {
          targetLength: customization.targetLength,
          videoFormat: customization.videoFormat,
          engagementStyle: customization.engagementStyle,
          structureElements: customization.structureElements,
          script: results.content,
          generatedAt: new Date().toISOString()
        };
        content = JSON.stringify(productionData, null, 2);
        fileName = `youtube-package-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Parse script content for YouTube-specific elements
  const parseYouTubeScript = (content: string) => {
    const lines = content.split('\n');
    const parsed = {
      chapters: [] as Array<{time: string, title: string}>,
      titles: [] as string[],
      description: '',
      tags: [] as string[],
      engagementPoints: [] as string[],
      wordCount: 0,
      estimatedDuration: 0
    };

    // Calculate word count and estimated duration
    parsed.wordCount = content.split(' ').filter(word => word.length > 0).length;
    parsed.estimatedDuration = Math.round(parsed.wordCount / 150); // 150 words per minute

    let currentSection = '';
    let descriptionLines: string[] = [];
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase().trim();
      
      if (lowerLine.includes('title suggestions') || lowerLine.includes('title:')) {
        currentSection = 'titles';
      } else if (lowerLine.includes('description') && !lowerLine.includes('title')) {
        currentSection = 'description';
        descriptionLines = [];
      } else if (lowerLine.includes('tags') || lowerLine.includes('keywords')) {
        currentSection = 'tags';
      } else if (lowerLine.includes('seo') || lowerLine.includes('metadata')) {
        currentSection = 'seo';
      } else if (line.match(/\d+:\d+/)) {
        // Parse timestamps for chapters
        const timeMatch = line.match(/(\d+:\d+)/);
        if (timeMatch) {
          const timeStr = timeMatch[1];
          let title = line.replace(timeMatch[0], '').replace(/[-–:]/, '').trim();
          
          // Clean up chapter titles
          if (title.toLowerCase().startsWith('chapter')) {
            title = title.replace(/^chapter\s*\d*:?\s*/i, '').trim();
          }
          
          if (title.length > 0) {
            parsed.chapters.push({
              time: timeStr,
              title: title
            });
          }
        }
      } else if (currentSection === 'titles' && line.trim() && line.match(/^\d+\./) || line.includes('[') && line.includes(']')) {
        // Extract title suggestions
        let title = line.trim().replace(/^\d+\.?\s*/, '').replace(/^\[|\]$/g, '');
        if (title.length > 0) {
          parsed.titles.push(title);
        }
      } else if (currentSection === 'description' && line.trim() && !line.match(/^\d+\./) && !line.includes(':')) {
        descriptionLines.push(line.trim());
      } else if (currentSection === 'tags' && line.includes('#')) {
        const tags = line.match(/#\w+/g);
        if (tags) parsed.tags.push(...tags);
      } else if (lowerLine.includes('subscribe') || lowerLine.includes('like') || lowerLine.includes('comment') || lowerLine.includes('let me know')) {
        parsed.engagementPoints.push(line.trim());
      }
    });

    // Join description lines
    parsed.description = descriptionLines.join(' ').trim();

    return parsed;
  };

  const youtubeData = parseYouTubeScript(results.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-500">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">YouTube Video Script</h2>
              <p className="text-sm text-gray-600">
                {customization.targetLength} min • {customization.videoFormat} • {customization.engagementStyle}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white/50 rounded-full hover:bg-white/70 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'script', label: 'Script', icon: Clock },
          { id: 'seo', label: 'SEO Package', icon: Search },
          { id: 'production', label: 'Production', icon: List }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {activeTab === 'script' && (
          <div className="p-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{results.content}</div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="p-6 space-y-6">
            {/* Title Suggestions */}
            {youtubeData.titles.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Title Suggestions
                </h3>
                <div className="space-y-2">
                  {youtubeData.titles.map((title, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="font-medium text-gray-900">{title}</div>
                      <div className="text-sm text-red-600 mt-1">
                        {title.length} characters • {title.length > 60 ? 'May be truncated' : 'Good length'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Template */}
            {youtubeData.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Description Template</h3>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="whitespace-pre-wrap text-sm text-gray-700">{youtubeData.description}</div>
                </div>
              </div>
            )}

            {/* Tags */}
            {youtubeData.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Tags & Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {youtubeData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'production' && (
          <div className="p-6 space-y-6">
            {/* Chapter Breakdown */}
            {youtubeData.chapters.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <List className="w-4 h-4 mr-2" />
                  Chapter Breakdown
                </h3>
                <div className="space-y-2">
                  {youtubeData.chapters.map((chapter, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-mono">
                        {chapter.time}
                      </div>
                      <div className="font-medium text-gray-900">{chapter.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Engagement Points */}
            {youtubeData.engagementPoints.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Engagement Reminders</h3>
                <div className="space-y-2">
                  {youtubeData.engagementPoints.map((point, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-700">{point}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Production Stats */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Video Statistics</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-gray-900">{customization.targetLength}</div>
                  <div className="text-sm text-gray-600">Target Minutes</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className={`text-lg font-bold ${
                    youtubeData.estimatedDuration >= parseInt(customization.targetLength?.split('-')[0] || '8') &&
                    youtubeData.estimatedDuration <= parseInt(customization.targetLength?.split('-')[1] || '10')
                      ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {youtubeData.estimatedDuration}
                  </div>
                  <div className="text-sm text-gray-600">Est. Minutes</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-gray-900">{youtubeData.wordCount}</div>
                  <div className="text-sm text-gray-600">Words</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-gray-900">{youtubeData.chapters.length}</div>
                  <div className="text-sm text-gray-600">Chapters</div>
                </div>
              </div>
              
              {/* Duration Check Alert */}
              {(youtubeData.estimatedDuration < parseInt(customization.targetLength?.split('-')[0] || '8') ||
                youtubeData.estimatedDuration > parseInt(customization.targetLength?.split('-')[1] || '10')) && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="text-sm text-orange-800">
                    ⚠️ Script duration ({youtubeData.estimatedDuration} min) doesn't match target ({customization.targetLength} min).
                    Consider regenerating for better length optimization.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Download className="w-4 h-4 mr-2" />
          Export Options
        </h3>
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDownload('txt')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Script (.txt)</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDownload('docx')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Production Doc (.txt)</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDownload('json')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Full Package (.json)</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
} 