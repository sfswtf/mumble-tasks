import React, { useState, useEffect } from 'react';
import { FileText, ListTodo, Sparkles, Copy, Check, ChevronDown, ChevronUp, Download, Eye, EyeOff, Calendar, Video, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';

interface ResultsSectionProps {
  results: {
    transcription: string;
    summary: string;
    tasks: Task[];
  } | null;
  onUpdateTask: (taskIndex: number, updates: Partial<Task>) => void;
  language: string;
}

const getTranslations = (language: string) => {
  const translations = {
    en: {
      executiveSummary: 'Executive Summary',
      actionItems: 'Action Items',
      fullTranscript: 'Full Transcript',
      showTranscript: 'Show Full Transcript',
      hideTranscript: 'Hide Transcript',
      copyToClipboard: 'Copy to Clipboard',
      downloadSummary: 'Download Summary',
      copied: 'Copied!',
      priority: {
        High: 'High',
        Medium: 'Medium',
        Low: 'Low'
      },
      noResults: 'No results available. Please try again.',
      readyToDownload: 'Ready-to-download executive summary with full transcript available below.',
      transcriptNote: 'Unfiltered transcript from your audio recording',
      addToCalendar: 'Add to Calendar',
      completeAnalysis: 'Complete analysis with executive summary and action items',
      downloadWord: 'Download Word',
      downloadPDF: 'Download PDF'
    },
    no: {
      executiveSummary: 'Sammendrag',
      actionItems: 'Handlingspunkter',
      fullTranscript: 'Full Transkripsjon',
      showTranscript: 'Vis Full Transkripsjon',
      hideTranscript: 'Skjul Transkripsjon',
      copyToClipboard: 'Kopier til Utklippstavle',
      downloadSummary: 'Last ned Sammendrag',
      copied: 'Kopiert!',
      priority: {
        High: 'Høy',
        Medium: 'Medium',
        Low: 'Lav'
      },
      noResults: 'Ingen resultater tilgjengelig. Vennligst prøv igjen.',
      readyToDownload: 'Ferdig sammendrag klart for nedlasting med full transkripsjon tilgjengelig nedenfor.',
      transcriptNote: 'Ufiltrert transkripsjon fra lydopptaket ditt',
      addToCalendar: 'Legg til i Kalender',
      completeAnalysis: 'Komplett analyse med sammendrag og handlingspunkter',
      downloadWord: 'Last ned Word',
      downloadPDF: 'Last ned PDF'
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

export default function ResultsSection({ results, onUpdateTask, language }: ResultsSectionProps) {
  const [copiedStates, setCopiedStates] = useState({
    summary: false,
    transcript: false,
    fullDocument: false
  });
  const [showTranscript, setShowTranscript] = useState(false);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const t = getTranslations(language);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDownloadMenu && !(event.target as Element).closest('.download-dropdown')) {
        setShowDownloadMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDownloadMenu]);

  if (!results) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">{t.noResults}</p>
      </div>
    );
  }

  // Calendar integration functions
  const createCalendarEvent = (task: Task, provider: 'google' | 'outlook') => {
    const startDate = new Date(`${task.dueDate}T${task.dueTime || '09:00'}`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const formatDateForGoogle = (date: Date) => {
      return date.toISOString().replace(/[-:.]/g, '').slice(0, -4) + 'Z';
    };

    const formatDateForOutlook = (date: Date) => {
      return date.toISOString().slice(0, -5) + 'Z';
    };

    const startFormatted = provider === 'google' ? formatDateForGoogle(startDate) : formatDateForOutlook(startDate);
    const endFormatted = provider === 'google' ? formatDateForGoogle(endDate) : formatDateForOutlook(endDate);

    if (provider === 'google') {
      const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
      const params = new URLSearchParams({
        text: task.text,
        dates: `${startFormatted}/${endFormatted}`,
        details: `Priority: ${task.priority}\n\nCreated from Mumble Tasks`,
        location: 'Online Meeting'
      });
      return `${baseUrl}&${params.toString()}`;
    } else {
      const baseUrl = 'https://outlook.office.com/calendar/0/deeplink/compose';
      const params = new URLSearchParams({
        subject: task.text,
        body: `Priority: ${task.priority}\n\nCreated from Mumble Tasks`,
        startdt: startFormatted,
        enddt: endFormatted,
        location: 'Online Meeting'
      });
      return `${baseUrl}?${params.toString()}`;
    }
  };

  const createGoogleMeetEvent = (task: Task) => {
    const startDate = new Date(`${task.dueDate}T${task.dueTime || '09:00'}`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    
    const formatDateForGoogle = (date: Date) => {
      return date.toISOString().replace(/[-:.]/g, '').slice(0, -4) + 'Z';
    };

    const startFormatted = formatDateForGoogle(startDate);
    const endFormatted = formatDateForGoogle(endDate);

    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const params = new URLSearchParams({
      text: `${task.text} - Meeting`,
      dates: `${startFormatted}/${endFormatted}`,
      details: `Priority: ${task.priority}\n\nMeeting for: ${task.text}\n\nGoogle Meet link will be automatically generated when you save this event.\n\nCreated from Mumble Tasks`,
      location: 'Google Meet',
      add: 'true',
      src: 'Google Meet'
    });
    return `${baseUrl}&${params.toString()}`;
  };

  const handleCopy = async (type: keyof typeof copiedStates, content?: string) => {
    let textToCopy = '';
    
    switch (type) {
      case 'summary':
        textToCopy = results.summary;
        break;
      case 'transcript':
        textToCopy = results.transcription;
        break;
      case 'fullDocument':
        textToCopy = `${t.executiveSummary}:\n\n${results.summary}\n\n`;
        if (results.tasks && results.tasks.length > 0) {
          textToCopy += `${t.actionItems}:\n${results.tasks
            .map((task, index) => `${index + 1}. ${task.text}\n   Priority: ${t.priority[task.priority as keyof typeof t.priority]}\n   Due: ${task.dueDate}${task.dueTime ? ` at ${task.dueTime}` : ''}\n`)
            .join('\n')}\n\n`;
        }
        textToCopy += `${t.fullTranscript}:\n\n${results.transcription}`;
        break;
      default:
        textToCopy = content || '';
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedStates(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const downloadAsTextFile = () => {
    const content = `${t.executiveSummary}\n${'='.repeat(50)}\n\n${results.summary}\n\n`;
    let fullContent = content;
    
    if (results.tasks && results.tasks.length > 0) {
      fullContent += `${t.actionItems}\n${'='.repeat(50)}\n`;
      results.tasks.forEach((task, index) => {
        fullContent += `${index + 1}. ${task.text}\n`;
        fullContent += `   Priority: ${t.priority[task.priority as keyof typeof t.priority]}\n`;
        fullContent += `   Due: ${task.dueDate}${task.dueTime ? ` at ${task.dueTime}` : ''}\n\n`;
      });
      fullContent += '\n';
    }
    
    fullContent += `${t.fullTranscript}\n${'='.repeat(50)}\n\n${results.transcription}`;

    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsWord = () => {
    // Create HTML content with professional Word-compatible formatting
    const currentDate = new Date().toLocaleDateString(language === 'no' ? 'no-NO' : 'en-US');
    const fileName = `${language === 'no' ? 'sammendrag' : 'summary'}_${new Date().toISOString().split('T')[0]}`;
    
    let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${t.executiveSummary} - ${currentDate}</title>
    <style>
        body { 
            font-family: 'Calibri', 'Arial', sans-serif; 
            line-height: 1.6; 
            margin: 40px; 
            color: #333;
            background-color: white;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #0073e6;
            padding-bottom: 20px;
        }
        .title { 
            font-size: 24px; 
            font-weight: bold; 
            color: #0073e6; 
            margin: 0;
        }
        .subtitle { 
            font-size: 14px; 
            color: #666; 
            margin: 5px 0 0 0;
        }
        .section { 
            margin: 30px 0; 
            page-break-inside: avoid;
        }
        .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #0073e6; 
            margin-bottom: 15px;
            border-left: 4px solid #0073e6;
            padding-left: 10px;
        }
        .content { 
            margin-bottom: 20px; 
            text-align: justify;
            line-height: 1.8;
        }
        .task-item { 
            margin: 15px 0; 
            padding: 15px; 
            border: 1px solid #e0e0e0; 
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        .task-text { 
            font-weight: bold; 
            margin-bottom: 8px;
            font-size: 16px;
        }
        .task-details { 
            font-size: 14px; 
            color: #666;
            margin-left: 20px;
        }
        .priority-high { color: #d32f2f; font-weight: bold; }
        .priority-medium { color: #f57c00; font-weight: bold; }
        .priority-low { color: #388e3c; font-weight: bold; }
        .transcript { 
            background-color: #f5f5f5; 
            padding: 20px; 
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
            line-height: 1.6;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 12px;
            color: #888;
        }
        @media print {
            body { margin: 20px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${t.executiveSummary}</h1>
        <p class="subtitle">${language === 'no' ? 'Generert' : 'Generated'} ${currentDate} | MumbleTasks</p>
    </div>
    
    <div class="section">
        <h2 class="section-title">${t.executiveSummary}</h2>
        <div class="content">${results.summary.replace(/\n/g, '<br>')}</div>
    </div>`;

    if (results.tasks && results.tasks.length > 0) {
      htmlContent += `
    <div class="section">
        <h2 class="section-title">${t.actionItems}</h2>`;
      
      results.tasks.forEach((task, index) => {
        const priorityClass = `priority-${task.priority.toLowerCase()}`;
        htmlContent += `
        <div class="task-item">
            <div class="task-text">${index + 1}. ${task.text}</div>
            <div class="task-details">
                <strong>${language === 'no' ? 'Prioritet' : 'Priority'}:</strong> 
                <span class="${priorityClass}">${t.priority[task.priority as keyof typeof t.priority]}</span><br>
                <strong>${language === 'no' ? 'Forfallsdato' : 'Due Date'}:</strong> 
                ${task.dueDate}${task.dueTime ? ` ${language === 'no' ? 'klokka' : 'at'} ${task.dueTime}` : ''}
            </div>
        </div>`;
      });
      
      htmlContent += `
    </div>`;
    }

    htmlContent += `
    <div class="section">
        <h2 class="section-title">${t.fullTranscript}</h2>
        <p><em>${t.transcriptNote}</em></p>
        <div class="transcript">${results.transcription}</div>
    </div>
    
    <div class="footer">
        <p>${language === 'no' ? 'Dokumentet ble generert av' : 'Document generated by'} MumbleTasks © ${new Date().getFullYear()}</p>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = async () => {
    // For PDF generation, we'll create a printable HTML version
    const currentDate = new Date().toLocaleDateString(language === 'no' ? 'no-NO' : 'en-US');
    const fileName = `${language === 'no' ? 'sammendrag' : 'summary'}_${new Date().toISOString().split('T')[0]}`;
    
    // Create the same HTML content as Word but optimized for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${t.executiveSummary} - ${currentDate}</title>
    <style>
        @page { margin: 2cm; }
        body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            margin: 0; 
            color: #333;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #0073e6;
            padding-bottom: 20px;
        }
        .title { 
            font-size: 24px; 
            font-weight: bold; 
            color: #0073e6; 
            margin: 0;
        }
        .subtitle { 
            font-size: 14px; 
            color: #666; 
            margin: 5px 0 0 0;
        }
        .section { 
            margin: 20px 0; 
            page-break-inside: avoid;
        }
        .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #0073e6; 
            margin-bottom: 15px;
            border-left: 4px solid #0073e6;
            padding-left: 10px;
        }
        .content { 
            margin-bottom: 20px; 
            text-align: justify;
            line-height: 1.8;
        }
        .task-item { 
            margin: 10px 0; 
            padding: 10px; 
            border: 1px solid #e0e0e0; 
            background-color: #f9f9f9;
        }
        .task-text { 
            font-weight: bold; 
            margin-bottom: 5px;
        }
        .task-details { 
            font-size: 14px; 
            color: #666;
            margin-left: 15px;
        }
        .priority-high { color: #d32f2f; font-weight: bold; }
        .priority-medium { color: #f57c00; font-weight: bold; }
        .priority-low { color: #388e3c; font-weight: bold; }
        .transcript { 
            background-color: #f5f5f5; 
            padding: 15px; 
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
            line-height: 1.4;
            font-size: 12px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 10px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${t.executiveSummary}</h1>
        <p class="subtitle">${language === 'no' ? 'Generert' : 'Generated'} ${currentDate} | MumbleTasks</p>
    </div>
    
    <div class="section">
        <h2 class="section-title">${t.executiveSummary}</h2>
        <div class="content">${results.summary.replace(/\n/g, '<br>')}</div>
    </div>
    
    ${results.tasks && results.tasks.length > 0 ? `
    <div class="section">
        <h2 class="section-title">${t.actionItems}</h2>
        ${results.tasks.map((task, index) => `
        <div class="task-item">
            <div class="task-text">${index + 1}. ${task.text}</div>
            <div class="task-details">
                <strong>${language === 'no' ? 'Prioritet' : 'Priority'}:</strong> 
                <span class="priority-${task.priority.toLowerCase()}">${t.priority[task.priority as keyof typeof t.priority]}</span><br>
                <strong>${language === 'no' ? 'Forfallsdato' : 'Due Date'}:</strong> 
                ${task.dueDate}${task.dueTime ? ` ${language === 'no' ? 'klokka' : 'at'} ${task.dueTime}` : ''}
            </div>
        </div>`).join('')}
    </div>` : ''}
    
    <div class="section">
        <h2 class="section-title">${t.fullTranscript}</h2>
        <p><em>${t.transcriptNote}</em></p>
        <div class="transcript">${results.transcription}</div>
    </div>
    
    <div class="footer">
        <p>${language === 'no' ? 'Dokumentet ble generert av' : 'Document generated by'} MumbleTasks © ${new Date().getFullYear()}</p>
    </div>
</body>
</html>`;

    // Open in new window for printing to PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Download Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{t.readyToDownload}</h3>
              <p className="text-sm text-gray-600">{t.completeAnalysis}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleCopy('fullDocument')}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copiedStates.fullDocument ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm">{copiedStates.fullDocument ? t.copied : t.copyToClipboard}</span>
            </button>
            
            {/* Professional Download Dropdown */}
            <div className="relative download-dropdown">
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">{t.downloadSummary}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {showDownloadMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[160px]"
                  >
                    <button
                      onClick={() => {
                        downloadAsWord();
                        setShowDownloadMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-2 first:rounded-t-lg border-b border-gray-100"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">{t.downloadWord}</span>
                    </button>
                    <button
                      onClick={() => {
                        downloadAsPDF();
                        setShowDownloadMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-2 last:rounded-b-lg"
                    >
                      <FileText className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium">{t.downloadPDF}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg border-l-4 border-blue-500 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-800">{t.executiveSummary}</h2>
          </div>
          <button
            onClick={() => handleCopy('summary')}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            {copiedStates.summary ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-500" />
            )}
            <span className="text-sm">{copiedStates.summary ? t.copied : t.copyToClipboard}</span>
          </button>
        </div>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{results.summary}</p>
        </div>
      </motion.div>

      {/* Action Items Section */}
      {Array.isArray(results.tasks) && results.tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg border-l-4 border-green-500 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <ListTodo className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-800">{t.actionItems}</h2>
            </div>
          </div>
          <div className="space-y-4">
            {results.tasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                className="p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-3">
                  <p className="text-gray-800 font-medium">{task.text}</p>
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Priority Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setEditingTask(editingTask === index ? null : index)}
                        className={`px-3 py-1.5 rounded-full flex items-center space-x-2 text-sm font-medium ${
                          task.priority === 'High' ? 'bg-red-100 text-red-800 border border-red-200' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          'bg-green-100 text-green-800 border border-green-200'
                        }`}
                      >
                        <span>{t.priority[task.priority as keyof typeof t.priority]}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      <AnimatePresence>
                        {editingTask === index && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border z-10 min-w-[120px]"
                          >
                            {['High', 'Medium', 'Low'].map((priority) => (
                              <button
                                key={priority}
                                onClick={() => {
                                  onUpdateTask(index, { priority: priority as Task['priority'] });
                                  setEditingTask(null);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                                  priority === 'High' ? 'text-red-800 hover:bg-red-50' :
                                  priority === 'Medium' ? 'text-yellow-800 hover:bg-yellow-50' :
                                  'text-green-800 hover:bg-green-50'
                                }`}
                              >
                                {t.priority[priority as keyof typeof t.priority]}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Date and Time Inputs */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={task.dueDate}
                        onChange={(e) => onUpdateTask(index, { dueDate: e.target.value })}
                        className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="time"
                        value={task.dueTime || ''}
                        onChange={(e) => onUpdateTask(index, { dueTime: e.target.value })}
                        className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Calendar Integration - RIGHT HERE ON EACH TASK */}
                  <div className="border-t pt-3 mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t.addToCalendar}</h4>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={createCalendarEvent(task, 'google')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors text-sm"
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Google Calendar
                      </a>
                      
                      <a
                        href={createGoogleMeetEvent(task)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors text-sm"
                      >
                        <Video className="w-4 h-4 mr-1" />
                        Google Meet
                      </a>
                      
                      <a
                        href={createCalendarEvent(task, 'outlook')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors text-sm"
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Outlook
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Collapsible Transcript Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg border-l-4 border-gray-400"
      >
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-800">{t.fullTranscript}</h2>
            <span className="text-sm text-gray-500">({t.transcriptNote})</span>
          </div>
          <div className="flex items-center space-x-3">
            {showTranscript && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy('transcript');
                }}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                {copiedStates.transcript ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-sm">{copiedStates.transcript ? t.copied : t.copyToClipboard}</span>
              </button>
            )}
            {showTranscript ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </button>
        
        <AnimatePresence>
          {showTranscript && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-0 border-t border-gray-200">
                <div className="max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4 mt-4">
                  <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed font-mono">
                    {results.transcription}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
