import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Copy, Check, Download, Hash, User, MessageCircle } from 'lucide-react';
import { BiographyContent } from '../../types';

interface LinkedInPostOutputProps {
  results: BiographyContent;
  customization: any;
}

export default function LinkedInPostOutput({ results, customization }: LinkedInPostOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(results.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const handleDownload = (format: 'txt' | 'md') => {
    let content = '';
    let fileName = '';
    let mimeType = '';

    switch (format) {
      case 'txt':
        content = results.content;
        fileName = `linkedin-post-${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
        break;
      case 'md':
        content = `# LinkedIn Post\n\n${results.content}\n\n---\n\n**Post Details:**\n- Content Tone: ${customization.contentTone}\n- Post Length: ${customization.postLength}\n- Professional Focus: ${customization.professionalFocus}\n- Generated: ${new Date().toLocaleDateString()}`;
        fileName = `linkedin-post-${new Date().toISOString().split('T')[0]}.md`;
        mimeType = 'text/markdown';
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

  // Parse LinkedIn post content
  const parseLinkedInPost = (content: string) => {
    const lines = content.split('\n');
    const hashtags = content.match(/#\w+/g) || [];
    const characterCount = content.length;
    const wordCount = content.split(' ').filter(word => word.length > 0).length;
    
    // Estimate reading time (average reading speed: 200-250 words per minute)
    const readingTime = Math.ceil(wordCount / 225);
    
    // Determine target word count based on post length setting
    const targetWordCount = customization.postLength === 'short' ? { min: 50, max: 100 } :
                           customization.postLength === 'medium' ? { min: 150, max: 300 } :
                           { min: 400, max: 600 }; // long
    
    const isOptimalWordCount = wordCount >= targetWordCount.min && wordCount <= targetWordCount.max;
    
    return {
      hashtags,
      characterCount,
      wordCount,
      readingTime,
      isOptimalLength: characterCount >= 150 && characterCount <= 1300,
      isOptimalWordCount,
      targetWordCount
    };
  };

  const postData = parseLinkedInPost(results.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600">
              <Linkedin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">LinkedIn Post</h2>
              <p className="text-sm text-gray-600">
                {customization.contentTone} • {customization.postLength} • {customization.professionalFocus}
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

      {/* LinkedIn-style Preview */}
      <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Your Name</div>
              <div className="text-sm text-gray-500">Your Title • Now</div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="whitespace-pre-wrap text-gray-900 leading-relaxed mb-4">
            {results.content}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>👍 Like</span>
              <span>💬 Comment</span>
              <span>🔄 Repost</span>
              <span>📤 Send</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Optimization */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Content Analysis</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{postData.characterCount}</div>
            <div className="text-sm text-gray-600">Characters</div>
            <div className={`text-xs mt-1 ${
              postData.isOptimalLength ? 'text-green-600' : 'text-orange-600'
            }`}>
              {postData.isOptimalLength ? 'Optimal' : 'Check length'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-lg font-bold ${
              postData.isOptimalWordCount ? 'text-green-600' : 'text-orange-600'
            }`}>
              {postData.wordCount}
            </div>
            <div className="text-sm text-gray-600">Words</div>
            <div className="text-xs mt-1 text-gray-500">
              Target: {postData.targetWordCount.min}-{postData.targetWordCount.max}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{postData.readingTime}</div>
            <div className="text-sm text-gray-600">Min read</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{postData.hashtags.length}</div>
            <div className="text-sm text-gray-600">Hashtags</div>
          </div>
        </div>

        {/* Word Count Alert */}
        {!postData.isOptimalWordCount && (
          <div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-sm text-orange-800">
              ⚠️ Post length ({postData.wordCount} words) doesn't match {customization.postLength} target ({postData.targetWordCount.min}-{postData.targetWordCount.max} words).
              Consider regenerating for better length optimization.
            </div>
          </div>
        )}

        {/* Hashtags */}
        {postData.hashtags.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Hash className="w-4 h-4 mr-2" />
              Hashtags
            </h4>
            <div className="flex flex-wrap gap-2">
              {postData.hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Engagement Tips */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            LinkedIn Optimization Tips
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Best posting times: Tuesday-Thursday, 8-10 AM</li>
            <li>• Use 3-5 relevant hashtags for maximum reach</li>
            <li>• Include a call-to-action to encourage engagement</li>
            <li>• Tag relevant people or companies when appropriate</li>
            {!postData.isOptimalLength && (
              <li className="text-orange-700">• Consider adjusting length for better engagement</li>
            )}
            {!postData.isOptimalWordCount && (
              <li className="text-orange-700">• Post length should match {customization.postLength} format requirements</li>
            )}
          </ul>
        </div>
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
            <span>Post Text (.txt)</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDownload('md')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Markdown (.md)</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}