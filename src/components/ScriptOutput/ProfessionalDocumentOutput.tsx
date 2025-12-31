import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Copy, Check, Download, ChevronDown, Mail, FileCheck, Briefcase, UserCheck, Award } from 'lucide-react';
import { BiographyContent } from '../../types';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';

interface ProfessionalDocumentOutputProps {
  results: BiographyContent;
  documentType: string;
  customization: any;
  language?: string;
}

const getDocumentTranslations = (language: string) => {
  const translations = {
    en: {
      copy: 'Copy to Clipboard',
      copied: 'Copied!',
      download: 'Download',
      documentTypes: {
        email: 'Email',
        cv: 'CV / Resume',
        'job-application': 'Job Application',
        'linkedin-profile': 'LinkedIn Profile',
        'reference-letter': 'Reference Letter'
      },
      emailLabels: {
        subject: 'Subject',
        to: 'To',
        from: 'From'
      },
      cvSections: {
        summary: 'Professional Summary',
        experience: 'Professional Experience',
        education: 'Education',
        skills: 'Skills',
        certifications: 'Certifications'
      },
      jobApplicationSections: {
        coverLetter: 'Cover Letter',
        applicationDetails: 'Application Details'
      },
      linkedinSections: {
        headline: 'Headline',
        summary: 'Summary',
        experience: 'Experience'
      },
      referenceLetterLabels: {
        recipient: 'Recipient',
        date: 'Date',
        sender: 'Sender'
      }
    },
    no: {
      copy: 'Kopier til Utklippstavle',
      copied: 'Kopiert!',
      download: 'Last ned',
      documentTypes: {
        email: 'E-post',
        cv: 'CV',
        'job-application': 'Jobbsøknad',
        'linkedin-profile': 'LinkedIn-profil',
        'reference-letter': 'Referansebrev'
      },
      emailLabels: {
        subject: 'Emne',
        to: 'Til',
        from: 'Fra'
      },
      cvSections: {
        summary: 'Profesjonelt Sammendrag',
        experience: 'Profesjonell Erfaring',
        education: 'Utdanning',
        skills: 'Ferdigheter',
        certifications: 'Sertifiseringer'
      },
      jobApplicationSections: {
        coverLetter: 'Søknadstekst',
        applicationDetails: 'Søknadsdetaljer'
      },
      linkedinSections: {
        headline: 'Overskrift',
        summary: 'Sammendrag',
        experience: 'Erfaring'
      },
      referenceLetterLabels: {
        recipient: 'Mottaker',
        date: 'Dato',
        sender: 'Avsender'
      }
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

const getDocumentIcon = (documentType: string) => {
  const icons = {
    email: Mail,
    cv: FileCheck,
    'job-application': Briefcase,
    'linkedin-profile': UserCheck,
    'reference-letter': Award
  };
  return icons[documentType as keyof typeof icons] || FileText;
};

export default function ProfessionalDocumentOutput({ 
  results, 
  documentType, 
  customization,
  language = 'en' 
}: ProfessionalDocumentOutputProps) {
  const [copied, setCopied] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const t = getDocumentTranslations(language);
  const Icon = getDocumentIcon(documentType);

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
        <p className="text-gray-600">{language === 'no' ? 'Ingen innhold tilgjengelig' : 'No content available'}</p>
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

  const handleDownloadTxt = () => {
    const content = `${t.documentTypes[documentType as keyof typeof t.documentTypes] || documentType}\n` +
                   `${language === 'no' ? 'Dato' : 'Date'}: ${new Date().toLocaleDateString()}\n\n` +
                   `${results.content}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentType}-${new Date().toISOString().split('T')[0]}.txt`;
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
            text: t.documentTypes[documentType as keyof typeof t.documentTypes] || documentType,
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${language === 'no' ? 'Dato' : 'Date'}: ${new Date().toLocaleDateString()}`,
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: results.content,
                size: 24,
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
      a.download = `${documentType}-${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowDownloadOptions(false);
    } catch (error) {
      console.error('Error generating DOCX:', error);
    }
  };

  const handleDownloadPDF = () => {
    const currentDate = new Date().toLocaleDateString(language === 'no' ? 'no-NO' : 'en-US');
    const documentTypeName = t.documentTypes[documentType as keyof typeof t.documentTypes] || documentType;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${documentTypeName} - ${currentDate}</title>
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
            border-bottom: 2px solid #7c3aed;
            padding-bottom: 20px;
        }
        .title { 
            font-size: 24px; 
            font-weight: bold; 
            color: #7c3aed; 
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
        <h1 class="title">${documentTypeName}</h1>
        <p class="subtitle">${language === 'no' ? 'Generert' : 'Generated'} ${currentDate} | MumbleTasks</p>
    </div>
    
    <div class="content">${results.content.replace(/\n/g, '<br>')}</div>
    
    <div class="footer">
        <p>${language === 'no' ? 'Dokumentet ble generert av' : 'Document generated by'} MumbleTasks © ${new Date().getFullYear()}</p>
    </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
    setShowDownloadOptions(false);
  };

  const formatContent = () => {
    const content = results.content;
    
    if (documentType === 'email') {
      // Try to parse email structure if it has Subject/To/From labels
      const subjectMatch = content.match(/(?:Subject|Emne)[:\s]+(.+)/i);
      const toMatch = content.match(/(?:To|Til)[:\s]+(.+)/i);
      
      return (
        <div className="space-y-4">
          {subjectMatch && (
            <div className="border-b pb-2">
              <span className="font-semibold text-gray-700">{t.emailLabels.subject}: </span>
              <span className="text-gray-900">{subjectMatch[1].trim()}</span>
            </div>
          )}
          {toMatch && (
            <div className="border-b pb-2">
              <span className="font-semibold text-gray-700">{t.emailLabels.to}: </span>
              <span className="text-gray-900">{toMatch[1].trim()}</span>
            </div>
          )}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">{content}</div>
          </div>
        </div>
      );
    }
    
    // For other document types, display with basic formatting
    return (
      <div className="prose max-w-none">
        <div className="whitespace-pre-wrap text-gray-700 font-mono text-sm leading-relaxed">{content}</div>
      </div>
    );
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
            <Icon className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              {t.documentTypes[documentType as keyof typeof t.documentTypes] || documentType}
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
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">DOCX</span>
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

        {formatContent()}
      </div>
    </motion.div>
  );
}

