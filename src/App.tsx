import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTranscriptions } from './hooks/useTranscriptions';
import Header from './components/Header';
import BiographyTypeSelector from './components/BiographyTypeSelector';
import StepWizard from './components/StepWizard';
import ProcessingIndicator from './components/ProcessingIndicator';
import ResultsSection from './components/ResultsSection';
import BiographyResults from './components/BiographyResults';
import ScriptOutputRenderer from './components/ScriptOutput/ScriptOutputRenderer';
import TranscriptionHistory from './components/TranscriptionHistory';
import AuthModal from './components/AuthModal';
import BiographyCustomization from './components/BiographyCustomization';
import ModeIndicator from './components/ModeIndicator';
import StepProgressIndicator from './components/StepProgressIndicator';
import { transcribeAudio, generatePromptContent, generateSummaryAndTasks } from './services/openai';
import { v4 as uuidv4 } from 'uuid';
import { generateTitle } from './utils/titleGenerator';
import { useErrorHandler } from './hooks/useErrorHandler';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ExportOptions } from './components/ExportOptions';
import ErrorMessage from './components/ErrorMessage';
import { TranscriptionMode, BiographyPreferences, DraftTranscription, TranscriptionRecord } from './types';
import { SearchBar } from './components/SearchBar';

// Add translation function
const getTranslations = (language: string) => {
  const translations = {
    en: {
      searchPlaceholder: 'Search your memos...',
      newMemo: 'New Memo',
      viewHistory: 'View History',
      hideHistory: 'Hide History'
    },
    no: {
      searchPlaceholder: 'Søk i notatene dine...',
      newMemo: 'Nytt Notat',
      viewHistory: 'Vis Historikk',
      hideHistory: 'Skjul Historikk'
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

// Auto-scroll utility function
const scrollToSection = (sectionId: string, offset: number = 100) => {
  setTimeout(() => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, 100); // Small delay to ensure DOM is updated
};

function App() {
  const { user, signIn, signOut, signUp } = useAuth();
  const { transcriptions, saveTranscription } = useTranscriptions(user?.id || null);
  const { error: appError, handleError, clearError, retryOperation, isRetrying } = useErrorHandler();
  const [showHistory, setShowHistory] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'mode' | 'type' | 'customize' | 'language' | 'record' | 'process'>('mode');
  const [selectedLanguage, setSelectedLanguage] = useState('no');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [biographyType, setBiographyType] = useState<TranscriptionMode>('tasks');
  const [customization, setCustomization] = useState<BiographyPreferences>({
    tone: '',
    style: '',
    audience: '',
    notes: '',
    promptType: '',
    taskType: '',
    promptMode: 'initial'
  });
  const [results, setResults] = useState<any>(null);
  const [draftTranscription, setDraftTranscription] = useLocalStorage<DraftTranscription | null>('draft_transcription', null);
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; type: string; createdAt: string }>>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [resetKey, setResetKey] = useState(0);

  // Refs for auto-scrolling
  const stepWizardRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Global error caught:', event.error);
      console.error('🚨 Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    localStorage.setItem('preferredLanguage', language);
  };

  const handleTypeSelect = (type: string) => {
    // Handle content-creator with platform selection
    if (type.startsWith('content-creator:')) {
      const [mode, platform] = type.split(':');
      setBiographyType('content-creator' as TranscriptionMode);
      // Store platform in customization
      setCustomization(prev => ({
        ...prev,
        platform: platform
      }));
      setCurrentStep('customize');
      scrollToSection('customize-section');
    } else {
      setBiographyType(type as TranscriptionMode);
      
      // Set platform for article type to ensure proper content generation
      if (type === 'article') {
        setCustomization(prev => ({
          ...prev,
          platform: 'article'
        }));
      }
      
      if (type === 'tasks' || type === 'meeting') {
        setCurrentStep('language');
        scrollToSection('step-wizard-section');
      } else {
        setCurrentStep('customize');
        scrollToSection('customize-section');
      }
    }
  };

  const handleCustomization = (preferences: BiographyPreferences) => {
    setCustomization(preferences);
    setCompletedSteps(prev => [...prev, 'customize']);
    setCurrentStep('language');
    scrollToSection('step-wizard-section');
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setCompletedSteps(prev => [...prev, 'language']);
    setCurrentStep('record');
    scrollToSection('step-wizard-section');
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResults(null);
    setError(null);
    setCompletedSteps(prev => [...prev, 'record']);
    setCurrentStep('process');
    // Auto-scroll to processing section
    scrollToSection('processing-section');
  };

  const handleStepNavigation = (step: string) => {
    // Allow navigation to previously completed steps or current step
    const stepOrder = ['mode', 'customize', 'language', 'record', 'process'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const targetIndex = stepOrder.indexOf(step);
    
    if (targetIndex <= currentIndex || completedSteps.includes(step)) {
      setCurrentStep(step as any);
      
      // Clear subsequent data if going backwards
      if (targetIndex < currentIndex) {
        if (step === 'mode') {
          setBiographyType('tasks');
          setCustomization({
            tone: '',
            style: '',
            audience: '',
            notes: '',
            promptType: '',
            taskType: '',
            promptMode: 'initial',
            platform: '',
            scriptTone: '',
            scriptDuration: '',
            scriptCTA: '',
            scriptHooks: '',
            scriptTarget: ''
          });
          setSelectedFile(null);
          setResults(null);
        } else if (step === 'customize') {
          setSelectedFile(null);
          setResults(null);
        } else if (step === 'language') {
          setSelectedFile(null);
          setResults(null);
        } else if (step === 'record') {
          setResults(null);
        }
      }
    }
  };

  const handleBackToModeSelection = () => {
    setCurrentStep('mode');
    setBiographyType('tasks');
    setCustomization({
      tone: '',
      style: '',
      audience: '',
      notes: '',
      promptType: '',
      taskType: '',
      promptMode: 'initial',
      platform: '',
      scriptTone: '',
      scriptDuration: '',
      scriptCTA: '',
      scriptHooks: '',
      scriptTarget: ''
    });
    setSelectedFile(null);
    setResults(null);
    setCompletedSteps([]);
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      handleError(new Error('Please select a file first'));
      return;
    }
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Clear any existing draft transcription when starting a new process
    setDraftTranscription(null);
    
    setIsProcessing(true);
    setProgress(0);
    clearError();
    
    // Auto-scroll to processing indicator
    scrollToSection('processing-indicator', 50);
    
    try {
      // Stage 1: File preparation (0-10%)
      setProgress(10);
      
      // Stage 2: Audio transcription (10-70%)
      const { text: transcription } = await transcribeAudio(selectedFile, selectedLanguage, (transcriptionProgress) => {
        // Map transcription progress to 10-70% range
        setProgress(10 + (transcriptionProgress * 60));
      });

      if (biographyType === 'tasks' || biographyType === 'meeting') {
        // Stage 3: Summary and tasks generation (70-100%)
        const { summary, tasks } = await generateSummaryAndTasks(transcription, selectedLanguage, (summaryProgress) => {
          // Map summary progress to 70-100% range
          setProgress(70 + (summaryProgress * 30));
        });
        
        setProgress(100);

        const result = {
          id: uuidv4(),
          transcription,
          summary,
          tasks: tasks.map(task => ({
            id: uuidv4(),
            text: task,
            priority: 'Medium',
            dueDate: new Date().toISOString().split('T')[0],
          })),
          type: biographyType,
          title: await generateTitle(summary || transcription, selectedLanguage),
          createdAt: new Date().toISOString()
        };

        setResults(result);
        saveTranscription({
          id: result.id,
          userId: user.id,
          transcription,
          type: biographyType,
          content: result,
          title: result.title,
          createdAt: result.createdAt,
          language: selectedLanguage,
          mode: biographyType === 'tasks' ? 'tasks' : 'biography',
          summary: summary,
          tasks: result.tasks
        });

        setCompletedSteps(prev => [...prev, 'process']);
      } else if (biographyType === 'content-creator') {
        // Stage 3: Script generation (70-100%)
        const scriptContent = await generatePromptContent(
          transcription,
          'content-creator',
          customization,
          selectedLanguage,
          (contentProgress: number) => {
            setProgress(70 + (contentProgress * 30));
          }
        );

        setProgress(100);

        const result = {
          id: uuidv4(),
          transcription,
          content: scriptContent,
          platform: customization.platform,
          customization,
          type: biographyType,
          title: await generateTitle(transcription, selectedLanguage),
          createdAt: new Date().toISOString(),
          language: selectedLanguage
        };

        setResults(result);
        
        // Create a more detailed title for content-creator mode
        let enhancedTitle = result.title;
        if (biographyType === 'content-creator' && customization.platform) {
          const platformNames = {
            'short-videos': 'Short Videos',
            'youtube-videos': 'YouTube Video',
            'linkedin-posts': 'LinkedIn Post',
            'facebook-posts': 'Facebook Post',
            'twitter-threads': 'Twitter Thread',
            'blog-posts': 'Blog Post'
          };
          const platformName = platformNames[customization.platform as keyof typeof platformNames] || customization.platform;
          enhancedTitle = `${platformName} - ${result.title}`;
        }
        
        saveTranscription({
          id: result.id,
          userId: user.id,
          transcription,
          type: biographyType,
          content: result,
          title: enhancedTitle,
          createdAt: result.createdAt,
          language: selectedLanguage,
          mode: biographyType,
          summary: scriptContent.content ? scriptContent.content.slice(0, 200) + '...' : undefined
        });

        setCompletedSteps(prev => [...prev, 'process']);
      } else {
        // Stage 3: Content generation (70-100%)
        const content = await generatePromptContent(
          transcription,
          biographyType,
          customization,
          selectedLanguage,
          (contentProgress: number) => {
            // Map content progress to 70-100% range
            setProgress(70 + (contentProgress * 30));
          }
        );

        setProgress(100);

        const result = {
          id: uuidv4(),
          transcription,
          content,
          type: biographyType,
          title: await generateTitle(transcription, selectedLanguage),
          createdAt: new Date().toISOString(),
          language: selectedLanguage
        };

        setResults(result);
        saveTranscription({
          id: result.id,
          userId: user.id,
          transcription,
          type: biographyType,
          content: result,
          title: result.title,
          createdAt: result.createdAt,
          language: selectedLanguage,
          mode: biographyType,
          summary: content.content ? content.content.slice(0, 200) + '...' : undefined
        });

        setCompletedSteps(prev => [...prev, 'process']);
      }

      setShowHistory(false);
    } catch (error) {
      handleError(error, () => handleProcess());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewTranscription = () => {
    // Stop any ongoing processing immediately
    setIsProcessing(false);
    setProgress(0);
    
    // Clear all results and files immediately
    setShowHistory(false);
    setResults(null);
    setSelectedFile(null);
    setError(null);
    
    // Reset to initial state completely
    setCurrentStep('mode');
    setBiographyType('tasks');
    setCustomization({
      tone: '',
      style: '',
      audience: '',
      notes: '',
      promptType: '',
      taskType: '',
      promptMode: 'initial',
      platform: '',
      // Clear all platform-specific properties
      duration: '',
      contentStyle: '',
      hookType: '',
      callToAction: '',
      targetLength: '',
      videoFormat: '',
      engagementStyle: '',
      structureElements: [],
      contentTone: '',
      postLength: '',
      engagementFeatures: [],
      professionalFocus: '',
      audienceType: '',
      engagementGoal: '',
      articleType: '',
      writingStyle: ''
    });
    setCompletedSteps([]);
    
    // Clear any draft transcription
    setDraftTranscription(null);
    
    // Clear any application errors
    clearError();
    
    // Force a React re-render by using a small delay
    setTimeout(() => {
      // This ensures the state changes have propagated
      console.log('Navigation reset complete');
    }, 0);
    
    // Increment reset key to force component resets
    setResetKey(prev => prev + 1);
  };

  const handleAuth = async (email: string, password: string, isSignUp = false) => {
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      setShowAuthModal(false);
      // Scroll to top after successful authentication
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } catch (error) {
      console.error('Authentication error:', error);
      // Re-throw the error so the modal can handle it
      throw error instanceof Error ? error : new Error('Authentication failed');
    }
  };

  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
    }
  }, [user]);

  useEffect(() => {
    if (draftTranscription) {
      const shouldRecover = window.confirm(
        `Would you like to recover your last session from ${new Date(draftTranscription.timestamp).toLocaleString()}?`
      );
      
      if (shouldRecover) {
        setBiographyType(draftTranscription.type as TranscriptionMode);
        setCustomization(draftTranscription.customization);
        setSelectedLanguage(draftTranscription.language);
      } else {
        setDraftTranscription(null);
      }
    }
  }, [draftTranscription]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = transcriptions.filter(transcription => 
      transcription.title.toLowerCase().includes(query.toLowerCase()) ||
      transcription.type.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(results);
  };

  const handleSearchSelect = (result: { id: string; title: string; type: string; createdAt: string }) => {
    const transcription = transcriptions.find(t => t.id === result.id);
    if (transcription) {
      setResults(transcription.content);
      setShowHistory(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    // For content creator, use the new platform-specific output renderer
    if (biographyType === 'content-creator' && results.content && customization.platform) {
      return (
        <ScriptOutputRenderer 
          results={results.content}
          platform={customization.platform}
          customization={customization}
        />
      );
    }

    // For tasks and meetings, use the existing results section
    if (biographyType === 'tasks' || biographyType === 'meeting') {
      return (
        <ResultsSection 
          results={results} 
          onUpdateTask={(taskIndex: number, updates: any) => {
            setResults((prev: any) => prev ? {
              ...prev,
              tasks: prev.tasks?.map((task: any, index: number) => 
                index === taskIndex ? { ...task, ...updates } : task
              ) || []
            } : null);
          }}
          language={selectedLanguage}
        />
      );
    }

    // For other content types, use BiographyResults
    if (results.content) {
      return (
        <BiographyResults 
          results={results.content} 
          type={biographyType}
          language={selectedLanguage}
        />
      );
    }

    return null;
  };

  const translations = getTranslations(selectedLanguage);

  // Add useEffect to scroll to results when they're ready
  useEffect(() => {
    if (results && !isProcessing) {
      scrollToSection('results-section', 50);
    }
  }, [results, isProcessing]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header 
        user={user}
        onAuthClick={() => setShowAuthModal(true)}
        onSignOut={signOut}
        language={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        onNavigateHome={handleNewTranscription}
      />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-5xl min-h-screen">
        {/* TEMPORARY: Testing mode indicator */}
        {/* <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          🧪 <strong>Testing Mode:</strong> Authentication bypassed - API testing in progress
        </div> */}

        {/* Only show app errors when user is authenticated, not auth errors */}
        {appError && user && (
          <div className="mb-4 fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50">
            <ErrorMessage 
              message={appError.message}
              onRetry={retryOperation}
              isRetrying={isRetrying}
              onDismiss={clearError}
              language={selectedLanguage}
            />
          </div>
        )}

        {/* TEMPORARY: Hide search and history for testing */}
        {user && (
          <div className="flex flex-col space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div className="w-full sm:w-auto sm:flex-1 sm:max-w-md">
                <SearchBar
                  onSearch={handleSearch}
                  results={searchResults}
                  onSelect={handleSearchSelect}
                  placeholder={translations.searchPlaceholder}
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 sm:ml-4">
                <button
                  onClick={handleNewTranscription}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 touch-manipulation text-center"
                >
                  {translations.newMemo}
                </button>
                <button
                  onClick={() => {
                    try {
                      console.log('🔍 History button clicked');
                      console.log('📊 Current state:', {
                        showHistory,
                        transcriptionsCount: transcriptions.length,
                        user: user?.id,
                        transcriptionsSample: transcriptions[0] ? {
                          id: transcriptions[0].id,
                          title: transcriptions[0].title,
                          mode: transcriptions[0].mode
                        } : 'No transcriptions'
                      });
                      console.log('🔄 Toggling history from', showHistory, 'to', !showHistory);
                      setShowHistory(!showHistory);
                    } catch (error) {
                      console.error('🚨 Error toggling history:', error);
                      alert('Error loading history. Check console for details.');
                    }
                  }}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 touch-manipulation text-center"
                >
                  {showHistory ? translations.hideHistory : translations.viewHistory}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TEMPORARY: Always show app content for testing, bypass auth check */}
        {user ? (
          showHistory ? (
            <div className="min-h-screen">
              {/* Inlined TranscriptionHistory for better error handling */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  {selectedLanguage === 'no' ? 'Opptakshistorikk' : 'Recording History'}
                </h2>
                
                {transcriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg mb-2">
                      {selectedLanguage === 'no' ? 'Ingen opptak funnet' : 'No recordings found'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {selectedLanguage === 'no' 
                        ? 'Start med å lage ditt første lydmemo eller oppgaveliste' 
                        : 'Start by creating your first voice memo or task list'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transcriptions.map((record, index) => {
                      // Log for debugging
                      if (index === 0) {
                        console.log('🔍 About to render', transcriptions.length, 'transcriptions');
                      }
                      console.log(`🔄 Processing record ${index + 1}:`, record);
                      
                      // Add safety checks but don't filter out records
                      if (!record) {
                        console.warn('❌ Invalid record at index', index);
                        return (
                          <div key={`invalid-${index}`} className="bg-red-50 p-4 rounded">
                            <p>Invalid record at position {index + 1}</p>
                          </div>
                        );
                      }

                      try {
                        // Helper function to get display name for mode
                        const getModeDisplayName = (mode: string) => {
                          const modeNames = selectedLanguage === 'no' ? {
                            'tasks': 'Oppgaveliste',
                            'meeting': 'Møtenotater', 
                            'article': 'Artikkel',
                            'content-creator': 'Innholdsproduksjon',
                            'biography': 'Biografi',
                            // Add fallback for unknown modes
                            'unknown': 'Ukjent type'
                          } : {
                            'tasks': 'Task List',
                            'meeting': 'Meeting Notes', 
                            'article': 'Article',
                            'content-creator': 'Content Creation',
                            'biography': 'Biography',
                            'unknown': 'Unknown type'
                          };
                          return modeNames[mode as keyof typeof modeNames] || mode || 'Unknown';
                        };

                        // Get platform info if it's a content-creator type
                        const getPlatformInfo = (record: TranscriptionRecord): string => {
                          try {
                            if (record.mode === 'content-creator') {
                              // Check if there's platform info in the content or title
                              const platformMap = {
                                'short-videos': 'Short Videos',
                                'youtube-videos': 'YouTube',
                                'linkedin-posts': 'LinkedIn',
                                'facebook-posts': 'Facebook', 
                                'twitter-threads': 'Twitter',
                                'blog-posts': 'Blog'
                              };
                              
                              // Try to extract platform from title
                              if (record.title) {
                                for (const [key, value] of Object.entries(platformMap)) {
                                  if (record.title.toLowerCase().includes(key.toLowerCase()) || 
                                      record.title.toLowerCase().includes(value.toLowerCase())) {
                                    return ` (${value})`;
                                  }
                                }
                              }
                            }
                          } catch (error) {
                            console.error('Error getting platform info:', error);
                          }
                          return '';
                        };

                        // Format date properly
                        const formatDate = (dateString: string) => {
                          if (!dateString) return selectedLanguage === 'no' ? 'Ingen dato' : 'No date';
                          
                          try {
                            const date = new Date(dateString);
                            if (isNaN(date.getTime())) {
                              return selectedLanguage === 'no' ? 'Ugyldig dato' : 'Invalid date';
                            }
                            return date.toLocaleDateString(selectedLanguage === 'no' ? 'no-NO' : 'en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          } catch (error) {
                            console.error('Error formatting date:', error);
                            return selectedLanguage === 'no' ? 'Ugyldig dato' : 'Invalid date';
                          }
                        };

                        // Get a meaningful title
                        const getDisplayTitle = (record: TranscriptionRecord): string => {
                          try {
                            if (record.title && record.title !== 'Untitled') {
                              return record.title;
                            }
                            
                            // Fallback to mode-based title
                            const modeDisplayName = getModeDisplayName(record.mode || 'unknown');
                            const platformInfo = getPlatformInfo(record);
                            const date = formatDate(record.createdAt);
                            
                            return `${modeDisplayName}${platformInfo} - ${date}`;
                          } catch (error) {
                            console.error('Error getting display title:', error);
                            return `Record ${index + 1}`;
                          }
                        };

                        // Log successful processing
                        if (index < 5) { // Only log first 5 to avoid spam
                          console.log(`✅ Successfully processed record ${index + 1}`, {
                            title: getDisplayTitle(record),
                            mode: record.mode,
                            hasContent: !!record.content
                          });
                        }

                        return (
                          <div
                            key={record.id || `record-${index}`}
                            className="group bg-gray-50 rounded-lg p-4 hover:shadow-md hover:bg-gray-100 transition-all cursor-pointer"
                            onClick={() => {
                              try {
                                console.log('🔍 Clicked record:', {
                                  id: record.id,
                                  title: record.title,
                                  mode: record.mode,
                                  hasContent: !!record.content,
                                  contentType: typeof record.content,
                                  contentKeys: record.content ? Object.keys(record.content) : 'none'
                                });
                                
                                if (!record.content) {
                                  console.warn('⚠️ Record has no content, cannot display');
                                  alert(selectedLanguage === 'no' 
                                    ? 'Dette notatet har ikke noe innhold å vise' 
                                    : 'This memo has no content to display'
                                  );
                                  return;
                                }
                                
                                console.log('✅ Setting results and hiding history');
                                setResults(record.content);
                                setShowHistory(false);
                                
                                // Set the mode and step based on what was loaded
                                if (record.mode) {
                                  setBiographyType(record.mode as TranscriptionMode);
                                }
                                setCurrentStep('process');
                                
                              } catch (error) {
                                console.error('🚨 Error selecting record:', error);
                                alert(`${selectedLanguage === 'no' ? 'Feil ved åpning av notat' : 'Error opening memo'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-900 mb-1">
                                  {getDisplayTitle(record)}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {formatDate(record.createdAt)}
                                  {record.mode && ` • ${getModeDisplayName(record.mode)}${getPlatformInfo(record)}`}
                                  {record.content ? 
                                    ` • ${selectedLanguage === 'no' ? 'Klar til visning' : 'Ready to view'}` : 
                                    ` • ${selectedLanguage === 'no' ? 'Ingen innhold' : 'No content'}`
                                  }
                                  {record.summary && ` • ${record.summary.slice(0, 50)}${record.summary.length > 50 ? '...' : ''}`}
                                </p>
                              </div>
                              <div className="text-gray-400">→</div>
                            </div>
                          </div>
                        );
                      } catch (error) {
                        console.error(`❌ Error rendering record ${index + 1}:`, error);
                        return (
                          <div key={`error-${index}`} className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
                            <p className="text-sm">
                              <strong>Error rendering record {index + 1}:</strong> {error instanceof Error ? error.message : 'Unknown error'}
                            </p>
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs text-gray-600">Show record data</summary>
                              <pre className="text-xs mt-1 bg-gray-100 p-2 rounded overflow-auto">
                                {JSON.stringify(record, null, 2)}
                              </pre>
                            </details>
                          </div>
                        );
                      }
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Show content when authenticated
            <div className="space-y-8">
              {/* Mode Indicator - shows current mode and step */}
              <ModeIndicator
                currentMode={biographyType}
                currentStep={currentStep}
                onBackToModeSelection={handleBackToModeSelection}
                language={selectedLanguage}
              />

              {/* Step Progress Indicator */}
              <StepProgressIndicator
                currentStep={currentStep}
                mode={biographyType}
                language={selectedLanguage}
                onStepClick={handleStepNavigation}
                completedSteps={completedSteps}
              />

              {currentStep === 'mode' && (
                <div id="mode-section">
                  <BiographyTypeSelector
                    onTypeSelect={handleTypeSelect}
                    language={selectedLanguage}
                    resetKey={resetKey}
                  />
                </div>
              )}

              {currentStep === 'customize' && !results && (
                <div id="customize-section">
                  <BiographyCustomization
                    onCustomize={handleCustomization}
                    selectedType={biographyType}
                    platform={customization.platform}
                    language={selectedLanguage}
                  />
                </div>
              )}

              {(currentStep === 'language' || currentStep === 'record' || currentStep === 'process') && !results && (
                <div id="step-wizard-section">
                  <StepWizard
                    currentStep={currentStep}
                    selectedLanguage={selectedLanguage}
                    selectedFile={selectedFile}
                    onLanguageSelect={handleLanguageSelect}
                    onFileSelect={handleFileSelect}
                    onProcess={handleProcess}
                    isProcessing={isProcessing}
                    mode={biographyType === 'tasks' ? 'tasks' : 'meeting'}
                  />
                </div>
              )}

              {currentStep === 'process' && !results && (
                <div id="processing-section">
                  {/* This section is for the process step UI */}
                </div>
              )}

              {isProcessing && (
                <div id="processing-indicator">
                  <ProcessingIndicator progress={progress} language={selectedLanguage} />
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                  {error}
                </div>
              )}

              {results && !isProcessing && (
                <div id="results-section">
                  {renderResults()}
                </div>
              )}
            </div>
          )
        ) : (
          // Show blank background when not authenticated - modal will handle auth
          <div className="min-h-[60vh]"></div>
        )}
      </main>

      <footer className="text-center py-4 text-sm text-gray-600">
        © {new Date().getFullYear()} Sebastian Saethre. All rights reserved.
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => user ? setShowAuthModal(false) : null}
        onAuth={handleAuth}
        language={selectedLanguage}
      />
    </div>
  );
}

export default App;