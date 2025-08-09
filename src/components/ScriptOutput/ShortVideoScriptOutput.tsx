import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Copy, Check, Download, Hash, Clock, Zap, Eye } from 'lucide-react';
import { BiographyContent } from '../../types';

interface ShortVideoScriptOutputProps {
  results: BiographyContent;
  platform: string;
  customization: any;
}

export default function ShortVideoScriptOutput({ results, platform, customization }: ShortVideoScriptOutputProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'preview' | 'breakdown'>('script');

  const platformNames = {
    'tiktok': 'TikTok',
    'instagram-reels': 'Instagram Reels',
    'youtube-shorts': 'YouTube Shorts'
  };

  const platformName = platformNames[platform as keyof typeof platformNames] || platform;
  const platformColor = platform === 'tiktok' ? 'pink' : platform === 'instagram-reels' ? 'purple' : 'red';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(results.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const handleDownload = (format: 'txt' | 'pdf' | 'json') => {
    let content = '';
    let fileName = '';
    let mimeType = '';

    switch (format) {
      case 'txt':
        content = results.content;
        fileName = `${platformName.toLowerCase()}-script-${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
        break;
      case 'json':
        const scriptData = {
          platform: platformName,
          duration: customization.duration,
          contentStyle: customization.contentStyle,
          hookType: customization.hookType,
          callToAction: customization.callToAction,
          script: results.content,
          generatedAt: new Date().toISOString()
        };
        content = JSON.stringify(scriptData, null, 2);
        fileName = `${platformName.toLowerCase()}-script-data-${new Date().toISOString().split('T')[0]}.json`;
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

  // Parse script content for better display
  const parseScript = (content: string) => {
    const lines = content.split('\n');
    const parsed = {
      timestamps: [] as Array<{time: string, content: string}>,
      scenes: [] as string[],
      hashtags: [] as string[],
      caption: '',
      productionNotes: [] as string[]
    };

    lines.forEach(line => {
      if (line.match(/\[\d+:\d+[-–]\d+:\d+\]/)) {
        const timeMatch = line.match(/\[(\d+:\d+[-–]\d+:\d+)\]/);
        if (timeMatch) {
          parsed.timestamps.push({
            time: timeMatch[1],
            content: line.replace(timeMatch[0], '').trim()
          });
        }
      } else if (line.includes('#')) {
        const hashtags = line.match(/#\w+/g);
        if (hashtags) parsed.hashtags.push(...hashtags);
      } else if (line.toLowerCase().includes('caption:')) {
        parsed.caption = line.replace(/caption:/i, '').trim();
      } else if (line.startsWith('[') && line.endsWith(']') && !line.match(/\d+:\d+/)) {
        parsed.scenes.push(line);
      } else if (line.startsWith('(') && line.endsWith(')')) {
        parsed.productionNotes.push(line);
      }
    });

    return parsed;
  };

  const scriptData = parseScript(results.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${
        platformColor === 'pink' ? 'from-pink-50 to-purple-50 border-pink-200' :
        platformColor === 'purple' ? 'from-purple-50 to-indigo-50 border-purple-200' :
        'from-red-50 to-orange-50 border-red-200'
      } p-6 rounded-lg border`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              platformColor === 'pink' ? 'bg-pink-500' :
              platformColor === 'purple' ? 'bg-purple-500' :
              'bg-red-500'
            }`}>
              <Play className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{platformName} Script</h2>
              <p className="text-sm text-gray-600">
                {customization.duration}s • {customization.contentStyle} • {customization.hookType} hook
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
          { id: 'preview', label: 'Preview', icon: Eye },
          { id: 'breakdown', label: 'Breakdown', icon: Zap }
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

        {activeTab === 'preview' && (
          <div className="p-6 space-y-4">
            <div className={`aspect-[9/16] max-w-sm mx-auto bg-black rounded-2xl p-4 ${
              platformColor === 'pink' ? 'ring-2 ring-pink-500' :
              platformColor === 'purple' ? 'ring-2 ring-purple-500' :
              'ring-2 ring-red-500'
            }`}>
              <div className="text-white text-sm space-y-2 h-full flex flex-col justify-between">
                <div>
                  <div className="font-bold">{platformName} Preview</div>
                  <div className="text-xs opacity-75">{customization.duration} seconds</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-lg font-medium">
                    {scriptData.timestamps[0]?.content.slice(0, 50)}...
                  </div>
                  <div className="text-xs opacity-75">
                    Tap to see full script
                  </div>
                </div>
                <div className="flex justify-center space-x-4 text-xs">
                  <span>💖 Like</span>
                  <span>💬 Comment</span>
                  <span>📤 Share</span>
                </div>
              </div>
            </div>
            {scriptData.caption && (
              <div className="max-w-sm mx-auto">
                <h4 className="font-medium text-gray-900 mb-2">Caption Text:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{scriptData.caption}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className="p-6 space-y-6">
            {/* Timeline */}
            {scriptData.timestamps.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Timeline
                </h3>
                <div className="space-y-2">
                  {scriptData.timestamps.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`px-2 py-1 rounded text-xs font-mono ${
                        platformColor === 'pink' ? 'bg-pink-100 text-pink-700' :
                        platformColor === 'purple' ? 'bg-purple-100 text-purple-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.time}
                      </div>
                      <div className="text-sm text-gray-700">{item.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hashtags */}
            {scriptData.hashtags.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Hash className="w-4 h-4 mr-2" />
                  Hashtags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {scriptData.hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm ${
                        platformColor === 'pink' ? 'bg-pink-100 text-pink-700' :
                        platformColor === 'purple' ? 'bg-purple-100 text-purple-700' :
                        'bg-red-100 text-red-700'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content Stats */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Content Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-gray-900">{results.content.length}</div>
                  <div className="text-sm text-gray-600">Characters</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-gray-900">{results.content.split(' ').length}</div>
                  <div className="text-sm text-gray-600">Words</div>
                </div>
              </div>
            </div>

            {/* Production Notes */}
            {scriptData.productionNotes.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Production Notes
                </h3>
                <div className="space-y-2">
                  {scriptData.productionNotes.map((note, index) => (
                    <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-sm text-yellow-800">{note}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scene Descriptions */}
            {scriptData.scenes.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Scene Descriptions
                </h3>
                <div className="space-y-2">
                  {scriptData.scenes.map((scene, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-700">{scene}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            onClick={() => handleDownload('json')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Production Data (.json)</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
} 