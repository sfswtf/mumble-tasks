import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Palette, Users, FileText, MessageSquare } from 'lucide-react';
import { BiographyPreferences } from '../types';
import { Tooltip } from './Tooltip';
import { ShortVideoCustomization } from './ShortVideoCustomization';
import { YouTubeVideoCustomization } from './YouTubeVideoCustomization';
import { LinkedInPostCustomization } from './LinkedInPostCustomization';
import { FacebookPostCustomization } from './FacebookPostCustomization';

interface BiographyCustomizationProps {
  onCustomize: (preferences: BiographyPreferences) => void;
  selectedType: string;
  platform?: string;
  language?: string;
}

const getCustomizationTranslations = (language: string) => {
  const translations = {
    en: {
      title: 'Customize Your Content',
      selectedMode: 'Selected Mode',
      continue: 'Continue',
      articleConfig: {
        title: '📚 Article Configuration',
        description: 'Create comprehensive articles from your audio content with professional formatting and structure.',
        articleType: 'Article Type',
        targetLength: 'Target Length',
        writingStyle: 'Writing Style',
        targetAudience: 'Target Audience',
        additionalNotes: 'Additional Notes',
        placeholder: 'Specific angle, key arguments, expert sources to mention, publication guidelines, etc.',
        lengthOptions: {
          short: 'Short (800-1,200 words)',
          medium: 'Medium (1,500-2,500 words)',
          long: 'Long (3,000-5,000 words)'
        },
        articleTypes: {
          opinion_piece: 'Opinion Piece',
          news_analysis: 'News Analysis',
          financial_article: 'Financial Analysis',
          tech_review: 'Technology Review',
          movie_review: 'Movie Review',
          book_review: 'Book Review',
          music_review: 'Music Review',
          product_review: 'Product Review',
          industry_analysis: 'Industry Analysis',
          educational_article: 'Educational Article',
          how_to_guide: 'How-To Guide',
          case_study: 'Case Study',
          interview_article: 'Interview Article',
          investigative_piece: 'Investigative Piece'
        },
        writingStyles: {
          informative: 'Informative & Objective',
          persuasive: 'Persuasive & Argumentative',
          analytical: 'Analytical & Critical',
          conversational: 'Conversational & Engaging',
          formal: 'Formal & Academic',
          investigative: 'Investigative & Questioning',
          narrative: 'Narrative & Storytelling'
        },
        audiences: {
          general_public: 'General Public',
          industry_professionals: 'Industry Professionals',
          academics: 'Academics & Researchers',
          investors: 'Investors & Financial Professionals',
          consumers: 'Consumers & Buyers',
          students: 'Students & Learners',
          executives: 'Business Executives',
          technical_audience: 'Technical Specialists'
        },
        hint: 'Choose the type of article that best matches your content'
      },
      generic: {
        tone: 'Tone',
        tonePlaceholder: 'e.g., Professional, Casual, Academic...',
        writingStyle: 'Writing Style',
        stylePlaceholder: 'e.g., Descriptive, Narrative, Technical...',
        targetAudience: 'Target Audience',
        audiencePlaceholder: 'e.g., General readers, Professionals, Students...',
        additionalNotes: 'Additional Notes',
        notesPlaceholder: 'Any specific requirements or preferences...',
        genericSettings: 'Generic Script Settings',
        platformUnknown: 'Platform: {platform} - Using generic customization options'
      }
    },
    no: {
      title: 'Tilpass innholdet ditt',
      selectedMode: 'Valgt modus',
      continue: 'Fortsett',
      articleConfig: {
        title: '📚 Artikkelkonfigurasjon',
        description: 'Lag omfattende artikler fra lydinnholdet ditt med profesjonell formatering og struktur.',
        articleType: 'Artikkeltype',
        targetLength: 'Ønsket lengde',
        writingStyle: 'Skriverstil',
        targetAudience: 'Målgruppe',
        additionalNotes: 'Tilleggsnotater',
        placeholder: 'Spesifikk vinkling, hovedargumenter, ekspertkilder å nevne, publiseringsretningslinjer, osv.',
        lengthOptions: {
          short: 'Kort (800-1 200 ord)',
          medium: 'Middels (1 500-2 500 ord)',
          long: 'Lang (3 000-5 000 ord)'
        },
        articleTypes: {
          opinion_piece: 'Meningsartikkel',
          news_analysis: 'Nyhetsanalyse',
          financial_article: 'Finansanalyse',
          tech_review: 'Teknologianmeldelse',
          movie_review: 'Filmanmeldelse',
          book_review: 'Bokanmeldelse',
          music_review: 'Musikkanmeldelse',
          product_review: 'Produktanmeldelse',
          industry_analysis: 'Bransjeanalyse',
          educational_article: 'Utdanningsartikkel',
          how_to_guide: 'Veiledning',
          case_study: 'Casestudie',
          interview_article: 'Intervjuartikkel',
          investigative_piece: 'Undersøkende artikkel'
        },
        writingStyles: {
          informative: 'Informativ og objektiv',
          persuasive: 'Overbevisende og argumenterende',
          analytical: 'Analytisk og kritisk',
          conversational: 'Samtalepreget og engasjerende',
          formal: 'Formell og akademisk',
          investigative: 'Undersøkende og spørrende',
          narrative: 'Fortellende'
        },
        audiences: {
          general_public: 'Allmennheten',
          industry_professionals: 'Bransjeprofesjonelle',
          academics: 'Akademikere og forskere',
          investors: 'Investorer og finansprofesjonelle',
          consumers: 'Forbrukere og kjøpere',
          students: 'Studenter og elever',
          executives: 'Bedriftsledere',
          technical_audience: 'Tekniske spesialister'
        },
        hint: 'Velg artikkeltypen som best matcher innholdet ditt'
      },
      generic: {
        tone: 'Tone',
        tonePlaceholder: 'f.eks., Profesjonell, Uformell, Akademisk...',
        writingStyle: 'Skriverstil',
        stylePlaceholder: 'f.eks., Beskrivende, Fortellende, Teknisk...',
        targetAudience: 'Målgruppe',
        audiencePlaceholder: 'f.eks., Allmenne lesere, Profesjonelle, Studenter...',
        additionalNotes: 'Tilleggsnotater',
        notesPlaceholder: 'Spesifikke krav eller preferanser...',
        genericSettings: 'Generelle skriptinnstillinger',
        platformUnknown: 'Plattform: {platform} - Bruker generelle tilpasningsalternativer'
      }
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

const PROMPT_TYPES = [
  { value: 'professional', label: 'Professional Writing', description: 'Create formal, business-appropriate content' },
  { value: 'creative', label: 'Creative Writing', description: 'Generate imaginative and engaging narratives' },
  { value: 'technical', label: 'Technical Documentation', description: 'Write detailed technical specifications and guides' },
  { value: 'midjourney', label: 'Midjourney Image Generation', description: 'Create prompts for AI image generation' },
  { value: 'code', label: 'Code Generation', description: 'Generate code snippets and implementations' },
  { value: 'data-analysis', label: 'Data Analysis', description: 'Create prompts for data analysis and visualization' },
  { value: 'chatbot', label: 'Chatbot Responses', description: 'Design conversational flows and responses' }
];

const TASK_TYPES = [
  { value: 'todo', label: 'Daily To-Do List', description: 'Organize your daily tasks and priorities' },
  { value: 'shopping', label: 'Shopping List', description: 'Create structured shopping lists with categories' },
  { value: 'project', label: 'Project Tasks', description: 'Break down projects into manageable tasks' },
  { value: 'study', label: 'Study Plan', description: 'Create organized study schedules and materials' },
  { value: 'workout', label: 'Workout Routine', description: 'Design personalized workout plans' },
  { value: 'meal', label: 'Meal Planning', description: 'Plan meals and create shopping lists' }
];

export default function BiographyCustomization({ onCustomize, selectedType, platform, language }: BiographyCustomizationProps) {
  const [preferences, setPreferences] = useState<BiographyPreferences>({
    tone: '',
    style: '',
    audience: '',
    notes: '',
    promptType: '',
    taskType: '',
    promptMode: 'initial',
    platform: platform
  });
  const [previewPrompt, setPreviewPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCustomize(preferences);
  };

  const generatePreviewPrompt = () => {
    const languageInstruction = language === 'no' 
      ? 'VIKTIG: Skriv ALT innhold på NORSK. Selv om lydfilen er på engelsk, skal ALT output være på norsk.'
      : 'Write all content in English.';
    
    let prompt = '';
    
    if (selectedType === 'content-creator' && platform) {
      if (['short-videos', 'tiktok', 'instagram-reels', 'youtube-shorts'].includes(platform)) {
        const duration = preferences.duration || '30-60';
        
        prompt = `ROLE: You are an expert viral short-form video strategist and script writer with proven success in creating engaging content that stops the scroll and drives action.

TASK: Create a production-ready ${duration}-second script based on the provided audio content using proven viral engagement formulas.

${languageInstruction}

CRITICAL SUCCESS METRICS:
1. Script length: Exactly ${duration} seconds at 150-160 words per minute
2. Hook effectiveness: Capture attention within first 3 seconds
3. Retention rate: Maintain visual interest every 3-5 seconds
4. Engagement: Include pattern interrupts and retention hooks
5. Conversion: End with compelling, specific call-to-action

Custom user instructions: ${preferences.notes || 'None provided'}`;
      } else if (['youtube-videos', 'youtube'].includes(platform)) {
        const targetLength = preferences.targetLength || '8-10';
        prompt = `ROLE: You are a YouTube algorithm expert and professional script writer with deep understanding of viewer psychology and platform optimization.

TASK: Create a comprehensive ${targetLength}-minute video script that maximizes watch time, engagement, and algorithm performance.

${languageInstruction}

Custom user instructions: ${preferences.notes || 'None provided'}`;
      }
    } else if (selectedType === 'tasks') {
      prompt = `ROLE: You are a task organization expert and productivity specialist with expertise in creating actionable, prioritized task lists.

TASK: Convert the audio content into a structured task list that maximizes productivity and clarity.

${languageInstruction}

Custom user instructions: ${preferences.notes || 'None provided'}`;
    } else if (selectedType === 'meeting') {
      prompt = `ROLE: You are a professional meeting notes expert and conversation analyst with expertise in multi-speaker dialogue analysis and action item extraction.

TASK: Analyze the meeting recording to identify speakers, extract key information, and create actionable meeting documentation.

${languageInstruction}

Custom user instructions: ${preferences.notes || 'None provided'}`;
    } else {
      prompt = `ROLE: You are a professional content strategist with expertise in ${selectedType} creation and audience engagement.

TASK: Transform the audio content into well-structured ${selectedType} format that meets the specified requirements.

${languageInstruction}

SPECIFICATIONS:
- Tone: ${preferences.tone || 'Professional'}
- Style: ${preferences.style || 'Informative'}
- Target Audience: ${preferences.audience || 'General audience'}

Custom user instructions: ${preferences.notes || 'None provided'}`;
    }
    
    setPreviewPrompt(prompt);
  };

  React.useEffect(() => {
    generatePreviewPrompt();
  }, [preferences, selectedType, platform, language]);

  const renderPromptModeSelection = () => (
    <div className="space-y-6 mb-8">
      <h3 className="text-lg font-medium text-gray-900">Choose Prompt Mode</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPreferences(prev => ({ ...prev, promptMode: 'initial' }))}
          className={`p-4 rounded-lg border-2 transition-all ${
            preferences.promptMode === 'initial'
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-200 hover:border-pink-300'
          }`}
        >
          <div className="flex items-start space-x-3">
            <FileText className={`w-5 h-5 ${
              preferences.promptMode === 'initial' ? 'text-pink-500' : 'text-gray-400'
            }`} />
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Initial Prompt</h4>
              <p className="text-sm text-gray-500">Create new prompts from scratch</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPreferences(prev => ({ ...prev, promptMode: 'feedback' }))}
          className={`p-4 rounded-lg border-2 transition-all ${
            preferences.promptMode === 'feedback'
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-200 hover:border-pink-300'
          }`}
        >
          <div className="flex items-start space-x-3">
            <MessageSquare className={`w-5 h-5 ${
              preferences.promptMode === 'feedback' ? 'text-pink-500' : 'text-gray-400'
            }`} />
            <div className="text-left">
              <h4 className="font-medium text-gray-900">LLM Feedback</h4>
              <p className="text-sm text-gray-500">Respond to LLM questions and refine outputs</p>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );

  const renderPromptCustomization = () => (
    <div className="space-y-6">
      {renderPromptModeSelection()}
      
      {preferences.promptMode === 'initial' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What type of prompt do you need?
            </label>
            <select
              value={preferences.promptType || ''}
              onChange={(e) => setPreferences(prev => ({ ...prev, promptType: e.target.value }))}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Select a prompt type</option>
              {PROMPT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {preferences.promptType && (
              <p className="mt-2 text-sm text-gray-500">
                {PROMPT_TYPES.find(t => t.value === preferences.promptType)?.description}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What do you want to create?
            </label>
            <Tooltip content="Describe your desired output in detail to get better results">
              <textarea
                value={preferences.notes || ''}
                onChange={(e) => setPreferences(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Describe what you want to create with this prompt..."
                rows={4}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </Tooltip>
          </div>
        </>
      )}

      {preferences.promptMode === 'feedback' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LLM Output
            </label>
            <textarea
              value={preferences.llmOutput || ''}
              onChange={(e) => setPreferences(prev => ({ ...prev, llmOutput: e.target.value }))}
              placeholder="Paste the LLM's response here..."
              rows={4}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Question or Concern
            </label>
            <textarea
              value={preferences.notes || ''}
              onChange={(e) => setPreferences(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="What would you like to know or clarify about the LLM's response?"
              rows={4}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </>
      )}
    </div>
  );

  const renderTaskCustomization = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What type of task list do you need?
        </label>
        <select
          value={preferences.taskType || ''}
          onChange={(e) => setPreferences(prev => ({ ...prev, taskType: e.target.value }))}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a task type</option>
          {TASK_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        {preferences.taskType && (
          <p className="mt-2 text-sm text-gray-500">
            {TASK_TYPES.find(t => t.value === preferences.taskType)?.description}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <Tooltip content="Add any specific requirements or preferences for your task list">
          <textarea
            value={preferences.notes || ''}
            onChange={(e) => setPreferences(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any specific requirements or organization preferences..."
            rows={4}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Tooltip>
      </div>
    </div>
  );

  const renderMeetingCustomization = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What type of meeting is this?
        </label>
        <select
          value={preferences.meetingType || ''}
          onChange={(e) => setPreferences(prev => ({ ...prev, meetingType: e.target.value }))}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select meeting type</option>
          <option value="project">Project Update</option>
          <option value="client">Client Meeting</option>
          <option value="team">Team Sync</option>
          <option value="planning">Planning Session</option>
          <option value="review">Review Meeting</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What are the main objectives of this meeting?
        </label>
        <Tooltip content="List the key goals you want to achieve in this meeting">
          <textarea
            value={preferences.meetingObjectives || ''}
            onChange={(e) => setPreferences(prev => ({ ...prev, meetingObjectives: e.target.value }))}
            placeholder="e.g., Review project timeline, Discuss client requirements, Plan next sprint..."
            rows={3}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Tooltip>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What specific information would you like to extract from the meeting?
        </label>
        <Tooltip content="Specify what kind of insights or information you want to capture">
          <textarea
            value={preferences.meetingFocus || ''}
            onChange={(e) => setPreferences(prev => ({ ...prev, meetingFocus: e.target.value }))}
            placeholder="e.g., Action items, Decisions made, Key discussion points, Next steps..."
            rows={3}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Tooltip>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Any specific participants or roles to note?
        </label>
        <Tooltip content="List important participants or their roles in the meeting">
          <textarea
            value={preferences.meetingParticipants || ''}
            onChange={(e) => setPreferences(prev => ({ ...prev, meetingParticipants: e.target.value }))}
            placeholder="e.g., Project Manager, Client Representative, Team Lead..."
            rows={2}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Tooltip>
      </div>
    </div>
  );


  const renderArticleCustomization = () => {
    const translations = getCustomizationTranslations(language || 'en');
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
          <h3 className="text-lg font-medium text-orange-900 mb-2">
            {translations.articleConfig.title}
          </h3>
          <p className="text-sm text-orange-700">
            {translations.articleConfig.description}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {translations.articleConfig.articleType}
          </label>
          <select
            value={preferences.articleType || 'opinion_piece'}
            onChange={(e) => setPreferences(prev => ({ ...prev, articleType: e.target.value }))}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {Object.entries(translations.articleConfig.articleTypes).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {translations.articleConfig.hint}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {translations.articleConfig.targetLength}
          </label>
          <select
            value={preferences.targetLength || 'medium'}
            onChange={(e) => setPreferences(prev => ({ ...prev, targetLength: e.target.value }))}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {Object.entries(translations.articleConfig.lengthOptions).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {translations.articleConfig.writingStyle}
          </label>
          <select
            value={preferences.writingStyle || 'informative'}
            onChange={(e) => setPreferences(prev => ({ ...prev, writingStyle: e.target.value }))}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {Object.entries(translations.articleConfig.writingStyles).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {translations.articleConfig.targetAudience}
          </label>
          <select
            value={preferences.audience || 'general_public'}
            onChange={(e) => setPreferences(prev => ({ ...prev, audience: e.target.value }))}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {Object.entries(translations.articleConfig.audiences).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {translations.articleConfig.additionalNotes}
          </label>
          <textarea
            value={preferences.notes || ''}
            onChange={(e) => setPreferences(prev => ({ ...prev, notes: e.target.value }))}
            placeholder={translations.articleConfig.placeholder}
            rows={4}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>
    );
  };

  const renderScriptGeneratorCustomization = () => {
    // Determine platform category
    const shortVideoPlatforms = ['tiktok', 'instagram-reels', 'youtube-shorts'];
    const isShortVideo = shortVideoPlatforms.includes(platform || '');
    const isYouTube = platform === 'youtube';
    const isLinkedIn = platform === 'linkedin';
    const isFacebook = platform === 'facebook';
    const isArticle = platform === 'article';

    // Render platform-specific customization
    if (isShortVideo) {
      return <ShortVideoCustomization 
        preferences={preferences} 
        setPreferences={setPreferences} 
        platform={platform || ''} 
      />;
    } else if (isYouTube) {
      return <YouTubeVideoCustomization 
        preferences={preferences} 
        setPreferences={setPreferences} 
      />;
    } else if (isLinkedIn) {
      return <LinkedInPostCustomization 
        preferences={preferences} 
        setPreferences={setPreferences} 
      />;
    } else if (isFacebook) {
      return <FacebookPostCustomization 
        preferences={preferences} 
        setPreferences={setPreferences} 
      />;
    } else if (isArticle) {
      return renderArticleCustomization();
    }

    // Fallback for unknown platforms - show generic options
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Generic Script Settings</h3>
          <p className="text-sm text-yellow-700">
            Platform: {platform || 'unknown'} - Using generic customization options
          </p>
        </div>
        {renderDefaultCustomization()}
      </div>
    );
  };

  const renderDefaultCustomization = () => {
    const translations = getCustomizationTranslations(language || 'en');
    return (
      <div className="space-y-6">
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Palette className="w-4 h-4" />
            <span>Tone</span>
          </label>
          <input
            type="text"
            value={preferences.tone || ''}
            onChange={(e) => setPreferences(prev => ({ ...prev, tone: e.target.value }))}
            placeholder={translations.generic.tonePlaceholder}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Settings className="w-4 h-4" />
            <span>Writing Style</span>
          </label>
          <input
            type="text"
            value={preferences.style || ''}
            onChange={(e) => setPreferences(prev => ({ ...prev, style: e.target.value }))}
            placeholder={translations.generic.stylePlaceholder}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4" />
            <span>Target Audience</span>
          </label>
          <input
            type="text"
            value={preferences.audience || ''}
            onChange={(e) => setPreferences(prev => ({ ...prev, audience: e.target.value }))}
            placeholder={translations.generic.audiencePlaceholder}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            value={preferences.notes || ''}
            onChange={(e) => setPreferences(prev => ({ ...prev, notes: e.target.value }))}
            placeholder={translations.generic.notesPlaceholder}
            rows={4}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
    );
  };

  const translations = getCustomizationTranslations(language || 'en');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6"
    >
      
      <h2 className="text-2xl font-semibold text-center mb-6">{translations.title}</h2>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg flex items-center justify-center space-x-2">
        <FileText className="w-5 h-5 text-blue-500" />
        <span className="font-medium text-blue-700">
          {translations.selectedMode}: {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
        </span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {selectedType === 'biography' && renderPromptCustomization()}
        {selectedType === 'tasks' && renderTaskCustomization()}
        {selectedType === 'meeting' && renderMeetingCustomization()}
        {selectedType === 'content-creator' && renderScriptGeneratorCustomization()}
        {selectedType === 'article' && renderArticleCustomization()}
        {selectedType !== 'biography' && selectedType !== 'tasks' && selectedType !== 'meeting' && selectedType !== 'content-creator' && selectedType !== 'article' && renderDefaultCustomization()}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={selectedType === 'biography' && !preferences.promptType}
          className={`w-full py-3 text-white rounded-md transition-colors ${
            selectedType === 'biography'
              ? preferences.promptType
                ? 'bg-pink-500 hover:bg-pink-600' 
                : 'bg-gray-300 cursor-not-allowed'
              : selectedType === 'tasks' || selectedType === 'meeting'
                ? 'bg-blue-500 hover:bg-blue-600' 
                : selectedType === 'content-creator'
                ? 'bg-red-500 hover:bg-red-600'
                : selectedType === 'article'
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-purple-500 hover:bg-purple-600'
          }`}
        >
          {translations.continue}
        </motion.button>
      </form>
    </motion.div>
  );
}
