import React, { useState, useEffect } from 'react';
import { FileText, Copy, Check, Download, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';

interface BiographyContent {
  content: string;
  type: string;
  language: string;
  title?: string;
}

interface BiographyResultsProps {
  results: BiographyContent;
  type: string;
  language?: string;
}

const getResultsTranslations = (language: string) => {
  const translations = {
    en: {
      copy: 'Copy to Clipboard',
      copied: 'Copied!',
      download: 'Download',
      output: 'Output',
      types: {
        biography: 'Biography',
        article: 'Article',
        'content-creator': 'Content Creator',
        tasks: 'Tasks',
        meeting: 'Meeting'
      },
      noContent: 'No content available'
    },
    no: {
      copy: 'Kopier til Utklippstavle',
      copied: 'Kopiert!',
      download: 'Last ned',
      output: 'Resultat',
      types: {
        biography: 'Biografi',
        article: 'Artikkel',
        'content-creator': 'Innholdsskaper',
        tasks: 'Oppgaver',
        meeting: 'Møte'
      },
      noContent: 'Ingen innhold tilgjengelig'
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

export default function BiographyResults({ results, type, language = 'en' }: BiographyResultsProps) {
  const [copied, setCopied] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const t = getResultsTranslations(language);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDownloadOptions && !(event.target as Element).closest('.download-dropdown')) {
        setShowDownloadOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDownloadOptions]);

  if (!results?.content) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <p className="text-gray-600">{t.noContent}</p>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(results.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([results.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    const content = `${t.types[type as keyof typeof t.types] || type} ${t.output}\n` +
                   `Date: ${new Date().toLocaleDateString()}\n\n` +
                   `${results.content}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowDownloadOptions(false);
  };

  const handleDownloadDocx = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: `${t.types[type as keyof typeof t.types] || type} ${t.output}`,
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Date: ${new Date().toLocaleDateString()}`,
                bold: true,
                size: 24, // 12pt font (24 half-points)
              }),
            ],
          }),
          new Paragraph({ text: "" }), // Empty line
          new Paragraph({
            children: [
              new TextRun({
                text: results.content,
                size: 24, // 12pt font (24 half-points)
              }),
            ],
          }),
        ],
      }],
    });

    try {
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowDownloadOptions(false);
    } catch (error) {
      console.error('Error generating DOCX:', error);
    }
  };

  const handleDownloadWord = () => {
    // Create professional Word-compatible HTML
    const currentDate = new Date().toLocaleDateString(language === 'no' ? 'no-NO' : 'en-US');
    const fileName = `${type}-${new Date().toISOString().split('T')[0]}`;
    const typeName = t.types[type as keyof typeof t.types] || type;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${typeName} ${t.output} - ${currentDate}</title>
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
        .content { 
            margin: 30px 0; 
            text-align: justify;
            line-height: 1.8;
            white-space: pre-wrap;
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
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${typeName} ${t.output}</h1>
        <p class="subtitle">${language === 'no' ? 'Generert' : 'Generated'} ${currentDate} | MumbleTasks</p>
    </div>
    
    <div class="content">${results.content.replace(/\n/g, '<br>')}</div>
    
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
    setShowDownloadOptions(false);
  };

  const handleDownloadPDF = () => {
    // Create professional PDF-optimized HTML
    const currentDate = new Date().toLocaleDateString(language === 'no' ? 'no-NO' : 'en-US');
    const typeName = t.types[type as keyof typeof t.types] || type;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${typeName} ${t.output} - ${currentDate}</title>
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
        .content { 
            margin: 20px 0; 
            text-align: justify;
            line-height: 1.8;
            white-space: pre-wrap;
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
        <h1 class="title">${typeName} ${t.output}</h1>
        <p class="subtitle">${language === 'no' ? 'Generert' : 'Generated'} ${currentDate} | MumbleTasks</p>
    </div>
    
    <div class="content">${results.content.replace(/\n/g, '<br>')}</div>
    
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
    setShowDownloadOptions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              {t.types[type as keyof typeof t.types] || type.charAt(0).toUpperCase() + type.slice(1)} {t.output}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
              <span>{copied ? t.copied : t.copy}</span>
            </motion.button>
            
            <div className="relative download-dropdown">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4 text-gray-500" />
                <span>{t.download}</span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </motion.button>
              
              <AnimatePresence>
                {showDownloadOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-[120px]"
                  >
                    <button
                      onClick={handleDownloadTxt}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 first:rounded-t-lg transition-colors"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">TXT</span>
                    </button>
                    <button
                      onClick={handleDownloadDocx}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 last:rounded-b-lg transition-colors"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">DOCX</span>
                    </button>
                    <button
                      onClick={handleDownloadWord}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 last:rounded-b-lg transition-colors"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">DOC</span>
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 last:rounded-b-lg transition-colors"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">PDF</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 font-mono">{results.content}</div>
        </div>
      </div>
    </motion.div>
  );
}