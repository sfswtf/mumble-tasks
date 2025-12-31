export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Task {
  id: string;
  text: string;
  priority: string;
  dueDate: string;
  dueTime?: string;
}

export interface User {
  email: string;
  id: string;
  preferredLanguage?: string;
}

export interface BiographyContent {
  content: string;
  type: string;
  language: string;
}

export interface TranscriptionRecord {
  id: string;
  userId: string;
  transcription: string;
  type: string;
  content: any;
  title: string;
  createdAt: string;
  language: string;
  mode: 'tasks' | 'meeting' | 'content-creator' | 'article' | 'professional-documents' | 'biography'; // biography is legacy
  summary?: string;
  tasks?: Task[];
}

export interface BiographyPreferences {
  tone: string;
  style: string;
  audience: string;
  notes: string;
  promptType: string;
  taskType: string;
  promptMode: 'initial' | 'feedback';
  llmOutput?: string;
  meetingType?: string;
  meetingObjectives?: string;
  meetingFocus?: string;
  meetingParticipants?: string;
  authorGenre?: string;
  authorStyle?: string;
  authorContext?: string;
  authorInstructions?: string;
  authorPasteText?: string;
  articleType?: string;
  articleAudience?: string;
  articleStyle?: string;
  articleTopic?: string;
  articleKeyPoints?: string;
  articleNotes?: string;
  writingStyle?: string;
  platform?: string;
  scriptTone?: string;
  scriptDuration?: string;
  scriptCTA?: string;
  scriptHooks?: string;
  scriptTarget?: string;
  
  // Platform-specific properties for short videos
  duration?: string;
  contentStyle?: string;
  hookType?: string;
  callToAction?: string;
  
  // Platform-specific properties for YouTube videos
  targetLength?: string;
  videoFormat?: string;
  engagementStyle?: string;
  structureElements?: string[];
  
  // Platform-specific properties for LinkedIn posts
  contentTone?: string;
  postLength?: string;
  engagementFeatures?: string[];
  professionalFocus?: string;
  
  // Platform-specific properties for Facebook posts
  audienceType?: string;
  engagementGoal?: string;
  
  // Professional documents properties
  documentType?: 'email' | 'cv' | 'job-application' | 'linkedin-profile' | 'reference-letter';
  emailType?: 'professional' | 'follow-up' | 'introduction' | 'thank-you' | 'inquiry';
  cvFormat?: 'chronological' | 'functional' | 'combination';
  jobTitle?: string;
  companyName?: string;
  yearsOfExperience?: string;
  targetIndustry?: string;
  keySkills?: string[];
  achievements?: string[];
  recipientName?: string;
  recipientRole?: string;
  emailSubject?: string;
  emailPurpose?: string;
  relationship?: string;
}

export interface DraftTranscription {
  file: string;
  type: string;
  customization: BiographyPreferences;
  language: string;
  timestamp: string;
}

export type TranscriptionMode = 'tasks' | 'meeting' | 'content-creator' | 'article' | 'professional-documents';

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => Promise<void>;
  isRetrying?: boolean;
  onDismiss: () => void;
}