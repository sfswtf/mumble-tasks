import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ListTodo, 
  Users, 
  BookOpen, 
  ArrowRight, 
  Newspaper, 
  Video, 
  Monitor, 
  Briefcase, 
  Facebook, 
  Twitter, 
  FileText 
} from 'lucide-react';

interface BiographyTypeSelectorProps {
  onTypeSelect: (type: string) => void;
  language: string;
  resetKey?: number; // Add resetKey to force component reset
}

interface PlatformOption {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  icon: React.ComponentType<any>;
  emoji: string;
}

const getTranslations = (language: string) => {
  const translations = {
    en: {
      title: 'What would you like to create?',
      types: {
        tasks: {
          title: 'Task List',
          description: 'Convert your voice memos into actionable tasks and summaries'
        },
        meeting: {
          title: 'Meeting Notes',
          description: 'Capture key points, decisions, and action items from meetings'
        },
        'content-creator': {
          title: 'Content Creator',
          description: 'Transform your voice into engaging content for 6+ social platforms: TikTok, YouTube, LinkedIn, Facebook, Twitter, and blogs'
        },
        article: {
          title: 'Article',
          description: 'Convert your thoughts into well-organized articles'
        }
      },
      platformSelection: {
        title: 'Choose your platform',
        subtitle: 'Select the social media platform you want to create content for',
        platforms: {
          'short-videos': {
            title: 'Short Videos',
            subtitle: 'TikTok, Instagram Reels, YouTube Shorts',
            duration: '15-90 seconds'
          },
          'youtube-videos': {
            title: 'YouTube Videos',
            subtitle: 'Medium-form content',
            duration: '7-11 minutes'
          },
          'linkedin-posts': {
            title: 'LinkedIn Posts',
            subtitle: 'Professional networking',
            duration: '1-3 minute read'
          },
          'facebook-posts': {
            title: 'Facebook Posts',
            subtitle: 'Community engagement',
            duration: '30 seconds - 2 minutes'
          },
          'twitter-threads': {
            title: 'Twitter/X Threads',
            subtitle: 'Multi-part stories',
            duration: '5-10 tweets'
          },
          'blog-posts': {
            title: 'Blog Posts',
            subtitle: 'Long-form content',
            duration: '3-7 minute read'
          }
        }
      }
    },
    no: {
      title: 'Hva vil du lage?',
      types: {
        tasks: {
          title: 'Oppgaveliste',
          description: 'Gjør talenotater om til handlinger og sammendrag'
        },
        meeting: {
          title: 'Møtenotater',
          description: 'Fang opp hovedpunkter, beslutninger og handlingspunkter fra møter'
        },
        'content-creator': {
          title: 'Innholdsproduksjon',
          description: 'Gjør stemmen din om til engasjerende innhold for 6+ plattformer: TikTok, YouTube, LinkedIn, Facebook, Twitter og blogger'
        },
        article: {
          title: 'Artikkel',
          description: 'Gjør tankene dine om til velorganiserte artikler'
        }
      },
      platformSelection: {
        title: 'Velg plattform',
        subtitle: 'Velg sosial medie-plattformen du vil lage innhold for',
        platforms: {
          'short-videos': {
            title: 'Korte videoer',
            subtitle: 'TikTok, Instagram Reels, YouTube Shorts',
            duration: '15-90 sekunder'
          },
          'youtube-videos': {
            title: 'YouTube-videoer',
            subtitle: 'Mellomlangt innhold',
            duration: '7-11 minutter'
          },
          'linkedin-posts': {
            title: 'LinkedIn-innlegg',
            subtitle: 'Profesjonell nettverksbygging',
            duration: '1-3 minutters lesing'
          },
          'facebook-posts': {
            title: 'Facebook-innlegg',
            subtitle: 'Samfunnsengasjement',
            duration: '30 sekunder - 2 minutter'
          },
          'twitter-threads': {
            title: 'Twitter/X-tråder',
            subtitle: 'Flerdelte historier',
            duration: '5-10 tweets'
          },
          'blog-posts': {
            title: 'Blogginnlegg',
            subtitle: 'Langt innhold',
            duration: '3-7 minutters lesing'
          }
        }
      }
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

const typeIcons = {
  tasks: ListTodo,
  meeting: Users,
  article: Newspaper,
  'content-creator': Video
};

const platformConfigs: Record<string, PlatformOption> = {
  'short-videos': {
    id: 'short-videos',
    title: 'Short Videos',
    subtitle: 'TikTok, Instagram Reels, YouTube Shorts',
    duration: '15-90 seconds',
    icon: Video,
    emoji: '🎬'
  },
  'youtube-videos': {
    id: 'youtube-videos',
    title: 'YouTube Videos',
    subtitle: 'Medium-form content',
    duration: '7-11 minutes',
    icon: Monitor,
    emoji: '📺'
  },
  'linkedin-posts': {
    id: 'linkedin-posts',
    title: 'LinkedIn Posts',
    subtitle: 'Professional networking',
    duration: '1-3 minute read',
    icon: Briefcase,
    emoji: '💼'
  },
  'facebook-posts': {
    id: 'facebook-posts',
    title: 'Facebook Posts',
    subtitle: 'Community engagement',
    duration: '30 seconds - 2 minutes',
    icon: Facebook,
    emoji: '👥'
  },
  'twitter-threads': {
    id: 'twitter-threads',
    title: 'Twitter/X Threads',
    subtitle: 'Multi-part stories',
    duration: '5-10 tweets',
    icon: Twitter,
    emoji: '🐦'
  },
  'blog-posts': {
    id: 'blog-posts',
    title: 'Blog Posts',
    subtitle: 'Long-form content',
    duration: '3-7 minute read',
    icon: FileText,
    emoji: '📝'
  }
};

export default function BiographyTypeSelector({ onTypeSelect, language, resetKey }: BiographyTypeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [showPlatforms, setShowPlatforms] = useState(false);
  const t = getTranslations(language);

  useEffect(() => {
    setSelectedMode(null);
    setShowPlatforms(false);
  }, [resetKey]);

  const handleModeSelect = (type: string) => {
    if (type === 'content-creator') {
      setSelectedMode(type);
      setShowPlatforms(true);
    } else {
      onTypeSelect(type);
    }
  };

  const handlePlatformSelect = (platform: string) => {
    // Pass both the mode and platform info
    onTypeSelect(`content-creator:${platform}`);
  };

  const handleBackToModes = () => {
    setShowPlatforms(false);
    setSelectedMode(null);
  };

  if (showPlatforms && selectedMode === 'content-creator') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={handleBackToModes}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            {language === 'no' ? 'Tilbake' : 'Back'}
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-gray-800">
            {t.platformSelection.title}
          </h2>
          <p className="text-center text-gray-600 mb-8">
            {t.platformSelection.subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(platformConfigs).map((platformKey) => {
            const platform = platformConfigs[platformKey];
            const platformTranslation = t.platformSelection.platforms[platformKey as keyof typeof t.platformSelection.platforms];
            const Icon = platform.icon;
            
            return (
              <motion.button
                key={platform.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePlatformSelect(platform.id)}
                className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-red-500 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-2xl">{platform.emoji}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                      <Icon className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {platformTranslation.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {platformTranslation.subtitle}
                    </p>
                    <div className="text-xs text-gray-500 mb-4 bg-gray-50 px-2 py-1 rounded">
                      {platformTranslation.duration}
                    </div>
                    <div className="flex items-center font-medium text-sm text-red-600">
                      <span>{language === 'no' ? 'Velg' : 'Select'}</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">
        {t.title}
      </h2>
      
      <div className="space-y-6">
        {/* Top row: Three smaller cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.keys(t.types) as Array<keyof typeof t.types>)
            .filter(type => type !== 'content-creator')
            .map((type) => {
            const Icon = typeIcons[type];
            const isTask = type === 'tasks';
            const isMeeting = type === 'meeting';
            const isArticle = type === 'article';
            
            return (
              <motion.button
                key={type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleModeSelect(type)}
                className={`bg-white rounded-xl shadow-lg p-5 text-left hover:shadow-xl transition-all duration-300 border-2 border-transparent min-h-[180px] ${
                  isTask ? 'hover:border-blue-500' : 
                  isMeeting ? 'hover:border-green-500' :
                  'hover:border-orange-500'
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2.5 rounded-lg ${
                      isTask ? 'bg-blue-100' : 
                      isMeeting ? 'bg-green-100' :
                      'bg-orange-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isTask ? 'text-blue-600' : 
                        isMeeting ? 'text-green-600' :
                        'text-orange-600'
                      }`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t.types[type].title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 flex-grow leading-relaxed">
                    {t.types[type].description}
                  </p>
                  
                  <div className={`flex items-center font-medium text-sm mt-auto ${
                    isTask ? 'text-blue-600' : 
                    isMeeting ? 'text-green-600' :
                    'text-orange-600'
                  }`}>
                    <span>{language === 'no' ? 'Velg' : 'Select'}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Bottom row: Content Creation - Full width prominent card */}
        {(Object.keys(t.types) as Array<keyof typeof t.types>)
          .filter(type => type === 'content-creator')
          .map((type) => {
          const Icon = typeIcons[type];
          
          return (
            <motion.button
              key={type}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleModeSelect(type)}
              className="w-full bg-gradient-to-br from-white to-red-50 rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-red-500 relative"
            >
              
              <div className="flex items-start space-x-6">
                <div className="p-4 rounded-lg bg-red-100 flex-shrink-0">
                  <Icon className="w-8 h-8 text-red-600" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                    {t.types[type].title}
                  </h3>
                  <p className="text-base text-gray-600 mb-4 leading-relaxed max-w-3xl">
                    {t.types[type].description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-sm bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium">📱 TikTok</span>
                    <span className="text-sm bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium">📺 YouTube</span>
                    <span className="text-sm bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium">💼 LinkedIn</span>
                    <span className="text-sm bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium">👥 Facebook</span>
                    <span className="text-sm bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium">🐦 Twitter</span>
                    <span className="text-sm bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium">📝 Blog</span>
                  </div>
                  
                  <div className="flex items-center font-medium text-base text-red-600">
                    <span>{language === 'no' ? 'Velg' : 'Select'}</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}