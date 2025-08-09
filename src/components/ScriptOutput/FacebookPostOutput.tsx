import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Copy, Check, Download, Users, MessageCircle, Share2 } from 'lucide-react';
import { BiographyContent } from '../../types';

interface FacebookPostOutputProps {
  results: BiographyContent;
  customization: any;
}

export default function FacebookPostOutput({ results, customization }: FacebookPostOutputProps) {
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

  const handleDownload = (format: 'txt' | 'json') => {
    let content = '';
    let fileName = '';
    let mimeType = '';

    switch (format) {
      case 'txt':
        content = results.content;
        fileName = `facebook-post-${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
        break;
      case 'json':
        const postData = {
          audienceType: customization.audienceType,
          engagementGoal: customization.engagementGoal,
          contentTone: customization.contentTone,
          content: results.content,
          variations: generateVariations(results.content),
          generatedAt: new Date().toISOString()
        };
        content = JSON.stringify(postData, null, 2);
        fileName = `facebook-content-${new Date().toISOString().split('T')[0]}.json`;
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

  // Generate content variations for A/B testing
  const generateVariations = (content: string) => {
    const sentences = content.split('.').filter(s => s.trim().length > 0);
    const firstSentence = sentences[0]?.trim() + '.';
    const restContent = sentences.slice(1).join('.').trim();

    return [
      content, // Original
      `🔥 ${firstSentence} ${restContent}`, // With emoji
      `${firstSentence}\n\n${restContent}`, // With line break
    ];
  };

  // Parse Facebook post content
  const parseFacebookPost = (content: string) => {
    const characterCount = content.length;
    const visibleCharacters = Math.min(characterCount, 250); // Facebook shows ~250 chars before "See More"
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
    const questionMarks = (content.match(/\?/g) || []).length;
    const exclamationMarks = (content.match(/!/g) || []).length;
    
    return {
      characterCount,
      visibleCharacters,
      emojiCount,
      questionMarks,
      exclamationMarks,
      hasCallToAction: content.toLowerCase().includes('share') || content.toLowerCase().includes('comment') || content.toLowerCase().includes('like'),
      engagementScore: calculateEngagementScore(content)
    };
  };

  const calculateEngagementScore = (content: string) => {
    let score = 0;
    const lowerContent = content.toLowerCase();
    
    // Positive factors
    if (content.length <= 250) score += 20; // Visible without "See More"
    if (lowerContent.includes('?')) score += 15; // Questions drive engagement
    if ((content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length > 0) score += 10; // Emojis
    if (lowerContent.includes('share') || lowerContent.includes('comment')) score += 15; // CTA
    if (lowerContent.includes('tag') || lowerContent.includes('mention')) score += 10; // Social elements
    
    // Negative factors
    if (content.length > 500) score -= 10; // Too long
    if (!content.includes('.') && !content.includes('!') && !content.includes('?')) score -= 5; // No punctuation
    
    return Math.max(0, Math.min(100, score));
  };

  const postData = parseFacebookPost(results.content);
  const variations = generateVariations(results.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600">
              <Facebook className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Facebook Post</h2>
              <p className="text-sm text-gray-600">
                {customization.audienceType} • {customization.engagementGoal} • {customization.contentTone}
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDownload('txt')}
              className="flex items-center space-x-2 px-3 py-1.5 bg-white/50 rounded-full hover:bg-white/70 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Facebook-style Preview */}
      <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Your Page/Profile</div>
              <div className="text-sm text-gray-500">Just now • 🌍</div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="whitespace-pre-wrap text-gray-900 leading-relaxed mb-4">
            {postData.characterCount > 250 ? (
              <>
                {results.content.slice(0, postData.visibleCharacters)}
                <span className="text-blue-600 cursor-pointer">... See More</span>
              </>
            ) : (
              results.content
            )}
          </div>
          
          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div className="flex items-center space-x-6 text-gray-600">
              <button className="flex items-center space-x-2 hover:text-blue-600">
                <span>👍</span>
                <span>Like</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-blue-600">
                <MessageCircle className="w-4 h-4" />
                <span>Comment</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-blue-600">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Analysis */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Content Analysis</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{postData.characterCount}</div>
            <div className="text-sm text-gray-600">Total Characters</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{postData.visibleCharacters}</div>
            <div className="text-sm text-gray-600">Visible Chars</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{postData.emojiCount}</div>
            <div className="text-sm text-gray-600">Emojis</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-lg font-bold ${
              postData.engagementScore >= 70 ? 'text-green-600' :
              postData.engagementScore >= 50 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {postData.engagementScore}
            </div>
            <div className="text-sm text-gray-600">Engagement Score</div>
          </div>
        </div>

        {/* Engagement Analysis */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Character limit optimization</span>
            <span className={`text-sm font-medium ${
              postData.characterCount <= 250 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {postData.characterCount <= 250 ? '✓ Optimal' : '⚠ May be truncated'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Engagement elements</span>
            <span className={`text-sm font-medium ${
              postData.questionMarks > 0 || postData.hasCallToAction ? 'text-green-600' : 'text-orange-600'
            }`}>
              {postData.questionMarks > 0 || postData.hasCallToAction ? '✓ Good' : '⚠ Add question/CTA'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Visual appeal</span>
            <span className={`text-sm font-medium ${
              postData.emojiCount > 0 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {postData.emojiCount > 0 ? '✓ Has emojis' : '⚠ Consider adding emojis'}
            </span>
          </div>
        </div>
      </div>

      {/* Content Variations */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Content Variations</h3>
        <div className="space-y-3">
          {variations.map((variation, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {index === 0 ? 'Original' : `Variation ${index}`}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(variation)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Copy
                </button>
              </div>
              <div className="text-sm text-gray-900 whitespace-pre-wrap">{variation}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Facebook Tips */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Facebook Optimization Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Post when your audience is most active (usually 1-3 PM)</li>
          <li>• Use emojis to increase visual appeal and engagement</li>
          <li>• Ask questions to encourage comments and boost algorithm reach</li>
          <li>• Keep important content within first 250 characters</li>
          <li>• Tag friends or relevant pages to increase reach</li>
        </ul>
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
            onClick={() => handleDownload('json')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Content Package (.json)</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
} 