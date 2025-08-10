import React, { useState, useEffect } from 'react';
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
import { TranscriptionMode, BiographyPreferences, DraftTranscription } from './types';
import { SearchBar } from './components/SearchBar';

function App() {
  const { user, signIn, signOut, signUp } = useAuth();
  const { transcriptions, saveTranscription } = useTranscriptions(user?.id || null);
  const { error: appError, handleError, clearError, retryOperation, isRetrying } = useErrorHandler();
  const [showHistory, setShowHistory] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'mode' | 'type' | 'customize' | 'language' | 'record' | 'process'>('mode');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [biographyType, setBiographyType] = useState<TranscriptionMode>('biography');
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
      } else {
        setCurrentStep('customize');
      }
    }
  };

  const handleCustomization = (preferences: BiographyPreferences) => {
    setCustomization(preferences);
    setCompletedSteps(prev => [...prev, 'customize']);
    setCurrentStep('language');
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setCompletedSteps(prev => [...prev, 'language']);
    setCurrentStep('record');
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResults(null);
    setError(null);
    setCompletedSteps(prev => [...prev, 'record']);
    setCurrentStep('process');
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
          setBiographyType('biography');
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
    setBiographyType('biography');
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
          title: generateTitle(summary || transcription, selectedLanguage),
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
          title: generateTitle(transcription, selectedLanguage),
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
          title: generateTitle(transcription, selectedLanguage),
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
    setBiographyType('biography');
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
    } catch (error) {
      console.error('Authentication error:', error);
      handleError(error instanceof Error ? error : new Error('Authentication failed'));
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
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* TEMPORARY: Testing mode indicator */}
        {/* <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          🧪 <strong>Testing Mode:</strong> Authentication bypassed - API testing in progress
        </div> */}

        {appError && (
          <div className="mb-4">
            <ErrorMessage 
              message={appError.message}
              onRetry={retryOperation}
              isRetrying={isRetrying}
              onDismiss={clearError}
            />
          </div>
        )}

        {/* TEMPORARY: Hide search and history for testing */}
        {user && (
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <SearchBar
                onSearch={handleSearch}
                results={searchResults}
                onSelect={handleSearchSelect}
                placeholder="Search your memos..."
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleNewTranscription}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  New Memo
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  {showHistory ? 'Hide History' : 'View History'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TEMPORARY: Always show app content for testing, bypass auth check */}
        {user ? (
          showHistory ? (
            <div>
              {/* Debug info */}
              <div className="mb-4 p-3 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
                🔍 <strong>Debug:</strong> User ID: {user.id}, Transcriptions: {transcriptions.length}
                {transcriptions.length > 0 && (
                  <div className="mt-2">
                    Latest: {transcriptions[0]?.title || 'No title'} ({transcriptions[0]?.mode})
                  </div>
                )}
              </div>
              <TranscriptionHistory
                transcriptions={transcriptions}
                language={selectedLanguage}
                onSelect={(record) => {
                  setResults(record.content);
                  setShowHistory(false);
                }}
              />
            </div>
          ) : (
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
                <BiographyTypeSelector
                  onTypeSelect={handleTypeSelect}
                  language={selectedLanguage}
                  resetKey={resetKey}
                />
              )}

              {currentStep === 'customize' && !results && (
                <BiographyCustomization
                  onCustomize={handleCustomization}
                  selectedType={biographyType}
                  platform={customization.platform}
                  language={selectedLanguage}
                />
              )}

              {(currentStep === 'language' || currentStep === 'record' || currentStep === 'process') && !results && (
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
              )}

              {isProcessing && (
                <ProcessingIndicator progress={progress} language={selectedLanguage} />
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                  {error}
                </div>
              )}

              {results && !isProcessing && (
                renderResults()
              )}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Please sign in to continue
            </h2>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Sign In
            </button>
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-sm text-gray-600">
        © {new Date().getFullYear()} SFS Solutions. All rights reserved.
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => user ? setShowAuthModal(false) : null}
        onAuth={handleAuth}
      />
    </div>
  );
}

export default App;