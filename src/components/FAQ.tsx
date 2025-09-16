import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Mic, 
  FileText, 
  Settings, 
  Download,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

interface FAQProps {
  language: string;
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  icon: string;
  content: FAQItem[];
}

const getFAQTranslations = (language: string) => {
  const translations = {
    en: {
      title: 'Help & FAQ',
      subtitle: 'Everything you need to know about Mumble Tasks',
      backToApp: 'Back to App',
      searchPlaceholder: 'Search questions...',
      sections: {
        gettingStarted: {
          title: 'Getting Started',
          icon: '🚀',
          content: [
            {
              question: 'What is Mumble Tasks?',
              answer: 'Mumble Tasks is an AI-powered application that transforms your voice recordings into intelligent, actionable content. Think of it as your personal AI assistant that converts voice memos, meeting recordings, or spoken thoughts into organized, professional documents.'
            },
            {
              question: 'How do I use Mumble Tasks?',
              answer: 'Using Mumble is simple: 1) Choose your content type (Tasks, Meeting Notes, Article, or Content Creator), 2) Select your language (English or Norwegian), 3) Record audio or upload a file, 4) Customize the output settings, 5) Let AI process and generate your content. The entire process takes just a few minutes!'
            },
            {
              question: 'Do I need an account to use Mumble?',
              answer: 'Yes, you need to sign in to save your transcriptions and access all features. This allows you to view your history, export documents, and maintain your work across sessions. Click "Request Access" on the login screen to get your account.'
            },
            {
              question: 'Is Mumble free to use?',
              answer: 'Mumble offers both free and premium tiers. The free version includes basic transcription and content generation. Premium features include advanced customization, priority processing, and additional export formats.'
            },
            {
              question: 'What makes Mumble different from other transcription tools?',
              answer: 'Unlike basic transcription tools, Mumble doesn\'t just convert speech to text - it understands context, purpose, and intent. It creates structured, actionable content tailored to your specific needs, whether that\'s task lists, meeting notes, or social media content.'
            }
          ]
        },
        contentTypes: {
          title: 'Content Types & Modes',
          icon: '📝',
          content: [
            {
              question: 'What is Task List Mode?',
              answer: 'Task List Mode converts your voice memos into organized, actionable task lists. It automatically identifies priorities, suggests due dates, and structures your thoughts into clear action items. Perfect for project planning, brainstorming sessions, or daily to-do lists.'
            },
            {
              question: 'How does Meeting Notes Mode work?',
              answer: 'Meeting Notes Mode transforms meeting recordings into professional meeting minutes. It extracts key decisions, action items, and important discussions, while identifying participants and their responsibilities. Ideal for team meetings, client calls, and interviews.'
            },
            {
              question: 'What can I create with Article Mode?',
              answer: 'Article Mode converts your spoken thoughts into well-structured articles or blog posts. It organizes content with proper headings, flow, and readability. Great for content creators, journalists, or anyone who thinks better out loud.'
            },
            {
              question: 'Tell me about Content Creator Mode',
              answer: 'Content Creator Mode generates platform-specific social media content. Choose from TikTok/Instagram Reels (15-90 seconds), YouTube videos (7-11 minutes), LinkedIn posts (1-3 minute read), Facebook posts, Twitter threads, or blog posts. Each is optimized for the platform\'s best practices.'
            }
          ]
        },
        audioRecording: {
          title: 'Audio Recording & Upload',
          icon: '🎤',
          content: [
            {
              question: 'What audio quality do I need for best results?',
              answer: 'For optimal transcription accuracy: Speak clearly at normal pace, use a quiet environment, keep your microphone 6-12 inches away, minimize background noise, and avoid echo-prone rooms. Good audio quality significantly improves AI processing results.'
            },
            {
              question: 'How long can my recordings be?',
              answer: 'Individual recordings can be up to 25 minutes long with a maximum file size of 25MB. For longer content like full meetings or lectures, consider breaking them into smaller segments for better processing accuracy and faster results.'
            },
            {
              question: 'What audio file formats are supported?',
              answer: 'Mumble supports all common audio formats including MP3, WAV, M4A, FLAC, AAC, and OGG. You can record directly in the app or upload existing audio files from your device.'
            },
            {
              question: 'Can I record directly in the app?',
              answer: 'Yes! Mumble includes a built-in audio recorder that works on all devices. Simply click the record button, grant microphone permissions, and start speaking. The recorder includes real-time audio level indicators and easy controls.'
            },
            {
              question: 'What if my audio has multiple speakers?',
              answer: 'Mumble can handle multi-speaker audio, especially in Meeting Notes mode. While it may not identify individual speakers by name, it can distinguish between different voices and organize the content accordingly.'
            }
          ]
        },
        customization: {
          title: 'Customization & Settings',
          icon: '⚙️',
          content: [
            {
              question: 'How do I customize the tone and style?',
              answer: 'Each content type offers extensive customization options. You can adjust tone (professional, casual, friendly), style (formal, conversational, technical), target audience, and specific formatting preferences. These settings ensure the output matches your exact needs.'
            },
            {
              question: 'Can I preview the AI instructions?',
              answer: 'Yes! Mumble includes a Prompt Preview feature that shows you exactly what instructions are being sent to the AI. This transparency helps you understand how your customizations affect the output and builds trust in the process.'
            },
            {
              question: 'How do platform-specific optimizations work?',
              answer: 'When creating social media content, Mumble optimizes for each platform\'s unique requirements: character limits, engagement patterns, algorithmic preferences, and best practices. For example, TikTok content focuses on hooks and visual transitions, while LinkedIn emphasizes professional insights.'
            },
            {
              question: 'Can I save my customization preferences?',
              answer: 'Yes, your customization preferences are automatically saved to your account. This means your preferred settings for tone, style, and formatting will be remembered for future sessions, making the process even faster.'
            }
          ]
        },
        languages: {
          title: 'Language Support',
          icon: '🌍',
          content: [
            {
              question: 'What languages does Mumble support?',
              answer: 'Mumble currently offers full support for English and Norwegian, including both interface language and audio transcription. The AI can process audio in multiple languages and generate content accordingly.'
            },
            {
              question: 'Can I switch languages mid-session?',
              answer: 'Yes! You can change the interface language at any time using the language selector in the header. Your work is automatically saved, so switching languages won\'t affect your progress or lose any data.'
            },
            {
              question: 'How accurate is transcription in different languages?',
              answer: 'Transcription accuracy varies by language, with English and Norwegian offering the highest accuracy (95%+). Clear audio and proper pronunciation significantly improve results regardless of language.'
            },
            {
              question: 'Will you add more languages?',
              answer: 'Yes! We\'re continuously expanding language support based on user demand. Popular European languages like German, French, and Spanish are being prioritized for future releases.'
            }
          ]
        },
        export: {
          title: 'Export & Sharing',
          icon: '📤',
          content: [
            {
              question: 'What export formats are available?',
              answer: 'Mumble offers professional export options: Microsoft Word documents (.docx) with proper formatting, plain text files (.txt), and copy-to-clipboard functionality. Word documents include structured headings, formatting, and professional layouts.'
            },
            {
              question: 'How do I export my content?',
              answer: 'After processing your audio, click the export button in the results section. Choose your preferred format and the file will be automatically downloaded to your device. All exports maintain professional formatting and structure.'
            },
            {
              question: 'Can I edit the generated content?',
              answer: 'Absolutely! All generated content can be copied and edited in your preferred text editor. The export formats are designed to be easily editable while maintaining professional formatting and structure.'
            },
            {
              question: 'How long are my transcriptions saved?',
              answer: 'Your transcriptions are permanently saved to your account and accessible anytime through the History section. You can view, re-export, or delete them as needed. There\'s no time limit on saved content.'
            }
          ]
        },
        troubleshooting: {
          title: 'Troubleshooting',
          icon: '🔧',
          content: [
            {
              question: 'Why is my transcription inaccurate?',
              answer: 'Common causes include poor audio quality, background noise, fast or unclear speech, heavy accents, or technical jargon. Try re-recording in a quieter environment, speaking more clearly, or breaking long recordings into shorter segments.'
            },
            {
              question: 'What if processing takes too long?',
              answer: 'Processing time depends on audio length and server load. Most recordings under 5 minutes process in 30-60 seconds. If processing seems stuck, try refreshing the page or contact support. Premium users get priority processing.'
            },
            {
              question: 'My audio upload failed - what do I do?',
              answer: 'Check that your file is under 25MB and in a supported format (MP3, WAV, M4A). Clear your browser cache, try a different browser, or use the direct recording feature instead of uploading.'
            },
            {
              question: 'The generated content doesn\'t match my expectations',
              answer: 'Try adjusting the customization settings for tone, style, and target audience. Use the Prompt Preview feature to see how your settings affect the AI instructions. More specific input and customization typically yield better results.'
            },
            {
              question: 'I can\'t access my saved transcriptions',
              answer: 'Ensure you\'re signed in to the same account where you saved your work. Check the History section in the main interface. If problems persist, contact support with your account details.'
            }
          ]
        },
        tips: {
          title: 'Pro Tips & Best Practices',
          icon: '💡',
          content: [
            {
              question: 'How can I get the best results from Mumble?',
              answer: 'Best practices: Outline key points before recording, speak in complete sentences, mention specific examples, state your goals clearly, use the additional notes field for context, and choose the most appropriate content type for your needs.'
            },
            {
              question: 'What\'s the secret to great social media content?',
              answer: 'Start with a strong hook, provide clear value, include a call-to-action, know your audience, and optimize for the specific platform. Use Mumble\'s platform-specific templates and customize the tone to match your brand voice.'
            },
            {
              question: 'How do I create effective meeting notes?',
              answer: 'Record the entire meeting, speak agenda items clearly, summarize key decisions as they\'re made, identify action items explicitly, and mention participant names when assigning tasks. This helps the AI create more structured notes.'
            },
            {
              question: 'Can I use Mumble for creative writing?',
              answer: 'Absolutely! Use Article or Biography mode for creative content. Speak your story ideas, character descriptions, or plot outlines. The AI can help structure your creative thoughts into coherent narratives or organized story elements.'
            },
            {
              question: 'How do I make my task lists more actionable?',
              answer: 'When recording for Task List mode, be specific about deadlines, priorities, and required resources. Mention dependencies between tasks and any relevant context. The more detailed your input, the more actionable your output will be.'
            }
          ]
        },
        security: {
          title: 'Privacy & Security',
          icon: '🔒',
          content: [
            {
              question: 'Is my data secure?',
              answer: 'Yes! Mumble uses enterprise-grade security with encrypted data transmission, secure authentication, and privacy-compliant AI processing. Your audio files and transcriptions are protected by industry-standard security measures.'
            },
            {
              question: 'Where are my recordings stored?',
              answer: 'Your transcriptions are securely stored in your personal account. Audio files are processed and then deleted for privacy. Only the generated text content is permanently saved unless you choose to delete it.'
            },
            {
              question: 'Who can access my content?',
              answer: 'Only you can access your saved transcriptions and generated content. Mumble staff cannot view your personal content. All data is encrypted and isolated by user account with strict access controls.'
            },
            {
              question: 'How do you handle sensitive information?',
              answer: 'Mumble processes audio using secure, privacy-compliant AI services. However, avoid recording highly sensitive information like passwords, financial details, or confidential business information. Always review generated content before sharing.'
            }
          ]
        }
      }
    },
    no: {
      title: 'Hjelp & FAQ',
      subtitle: 'Alt du trenger å vite om Mumble Tasks',
      backToApp: 'Tilbake til App',
      searchPlaceholder: 'Søk i spørsmål...',
      sections: {
        gettingStarted: {
          title: 'Kom i gang',
          icon: '🚀',
          content: [
            {
              question: 'Hva er Mumble Tasks?',
              answer: 'Mumble Tasks er en AI-drevet applikasjon som transformerer lydopptak til intelligent, handlingsrettet innhold. Tenk på det som din personlige AI-assistent som konverterer stemmememo, møteopptak eller snakkede tanker til organiserte, profesjonelle dokumenter.'
            },
            {
              question: 'Hvordan bruker jeg Mumble Tasks?',
              answer: 'Å bruke Mumble er enkelt: 1) Velg innholdstype (Oppgaver, Møtenotater, Artikkel eller Innholdsskaper), 2) Velg språk (engelsk eller norsk), 3) Ta opp lyd eller last opp fil, 4) Tilpass utgangsinnstillinger, 5) La AI behandle og generere innholdet ditt. Hele prosessen tar bare noen få minutter!'
            },
            {
              question: 'Trenger jeg en konto for å bruke Mumble?',
              answer: 'Ja, du må logge inn for å lagre transkripsjoner og få tilgang til alle funksjoner. Dette lar deg se historikken din, eksportere dokumenter og opprettholde arbeidet på tvers av økter. Klikk "Be om tilgang" på påloggingsskjermen for å få din konto.'
            },
            {
              question: 'Er Mumble gratis å bruke?',
              answer: 'Mumble tilbyr både gratis og premium-nivåer. Gratisversjonen inkluderer grunnleggende transkripsjon og innholdsgenerering. Premium-funksjoner inkluderer avansert tilpasning, prioritert behandling og flere eksportformater.'
            }
          ]
        },
        contentTypes: {
          title: 'Innholdstyper og Moduser',
          icon: '📝',
          content: [
            {
              question: 'Hva er Oppgaveliste-modus?',
              answer: 'Oppgaveliste-modus konverterer stemmememoene dine til organiserte, handlingsrettede oppgavelister. Det identifiserer automatisk prioriteringer, foreslår frister og strukturerer tankene dine til klare handlingspunkter.'
            },
            {
              question: 'Hvordan fungerer Møtenotater-modus?',
              answer: 'Møtenotater-modus transformerer møteopptak til profesjonelle møtereferater. Det trekker ut viktige beslutninger, handlingspunkter og diskusjoner, samtidig som det identifiserer deltakere og deres ansvar.'
            },
            {
              question: 'Hva kan jeg lage med Artikkel-modus?',
              answer: 'Artikkel-modus konverterer snakkede tanker til velstrukturerte artikler eller blogginnlegg. Det organiserer innhold med riktige overskrifter, flyt og lesbarhet.'
            },
            {
              question: 'Fortell meg om Innholdsskaper-modus',
              answer: 'Innholdsskaper-modus genererer plattformspesifikt sosiale medier-innhold. Velg fra TikTok/Instagram Reels, YouTube-videoer, LinkedIn-innlegg, Facebook-innlegg, Twitter-tråder eller blogginnlegg. Hver er optimalisert for plattformens beste praksis.'
            }
          ]
        },
        audioRecording: {
          title: 'Lydopptak og Opplasting',
          icon: '🎤',
          content: [
            {
              question: 'Hvilken lydkvalitet trenger jeg for beste resultater?',
              answer: 'For optimal transkripsjonsnøyaktighet: Snakk tydelig i normalt tempo, bruk et stille miljø, hold mikrofonen 15-30 cm unna, minimer bakgrunnsstøy og unngå rom med ekko.'
            },
            {
              question: 'Hvor lange kan opptakene mine være?',
              answer: 'Individuelle opptak kan være opptil 25 minutter lange med maksimal filstørrelse på 25MB. For lengre innhold, vurder å dele dem i mindre segmenter for bedre behandlingsnøyaktighet.'
            },
            {
              question: 'Hvilke lydfilformater støttes?',
              answer: 'Mumble støtter alle vanlige lydformater inkludert MP3, WAV, M4A, FLAC, AAC og OGG. Du kan ta opp direkte i appen eller laste opp eksisterende lydfiler.'
            }
          ]
        },
        customization: {
          title: 'Tilpasning og Innstillinger',
          icon: '⚙️',
          content: [
            {
              question: 'Hvordan tilpasser jeg tone og stil?',
              answer: 'Hver innholdstype tilbyr omfattende tilpasningsalternativer. Du kan justere tone (profesjonell, uformell, vennlig), stil (formell, samtale, teknisk), målgruppe og spesifikke formateringsinnstillinger.'
            },
            {
              question: 'Kan jeg forhåndsvise AI-instruksjonene?',
              answer: 'Ja! Mumble inkluderer en Prompt Preview-funksjon som viser deg nøyaktig hvilke instruksjoner som sendes til AI-en. Denne åpenheten hjelper deg å forstå hvordan tilpasningene påvirker utdataene.'
            }
          ]
        },
        languages: {
          title: 'Språkstøtte',
          icon: '🌍',
          content: [
            {
              question: 'Hvilke språk støtter Mumble?',
              answer: 'Mumble tilbyr for øyeblikket full støtte for engelsk og norsk, inkludert både grensesnittspråk og lydtranskripsjon. AI-en kan behandle lyd på flere språk og generere innhold tilsvarende.'
            },
            {
              question: 'Kan jeg bytte språk midt i økta?',
              answer: 'Ja! Du kan endre grensesnittspråket når som helst ved hjelp av språkvelgeren i toppen. Arbeidet ditt lagres automatisk, så bytte av språk påvirker ikke fremdriften eller mister data.'
            }
          ]
        },
        export: {
          title: 'Eksport og Deling',
          icon: '📤',
          content: [
            {
              question: 'Hvilke eksportformater er tilgjengelige?',
              answer: 'Mumble tilbyr profesjonelle eksportalternativer: Microsoft Word-dokumenter (.docx) med riktig formatering, rene tekstfiler (.txt) og kopier-til-utklippstavle-funksjonalitet.'
            },
            {
              question: 'Hvor lenge lagres transkripsjonene mine?',
              answer: 'Transkripsjonene dine lagres permanent på kontoen din og er tilgjengelige når som helst gjennom Historikk-seksjonen. Du kan se, re-eksportere eller slette dem etter behov.'
            }
          ]
        },
        troubleshooting: {
          title: 'Feilsøking',
          icon: '🔧',
          content: [
            {
              question: 'Hvorfor er transkripsjonen min unøyaktig?',
              answer: 'Vanlige årsaker inkluderer dårlig lydkvalitet, bakgrunnsstøy, rask eller utydelig tale, sterke aksenter eller teknisk sjargong. Prøv å ta opp på nytt i et stillere miljø.'
            },
            {
              question: 'Hva hvis behandlingen tar for lang tid?',
              answer: 'Behandlingstid avhenger av lydlengde og serverbelastning. De fleste opptak under 5 minutter behandles på 30-60 sekunder. Hvis behandlingen virker fast, prøv å oppdatere siden.'
            }
          ]
        },
        tips: {
          title: 'Profftips og Beste Praksis',
          icon: '💡',
          content: [
            {
              question: 'Hvordan kan jeg få de beste resultatene fra Mumble?',
              answer: 'Beste praksis: Skisser hovedpunkter før opptak, snakk i hele setninger, nevn spesifikke eksempler, oppgi målene dine tydelig, og bruk tilleggsnotater-feltet for kontekst.'
            },
            {
              question: 'Kan jeg bruke Mumble til kreativ skriving?',
              answer: 'Absolutt! Bruk Artikkel- eller Biografi-modus for kreativt innhold. Snakk om storylideer, karakterbeskrivelser eller plottutfall. AI-en kan hjelpe til med å strukturere kreative tanker.'
            }
          ]
        },
        security: {
          title: 'Personvern og Sikkerhet',
          icon: '🔒',
          content: [
            {
              question: 'Er dataene mine sikre?',
              answer: 'Ja! Mumble bruker bedriftsnivå sikkerhet med kryptert dataoverføring, sikker autentisering og personvernkompatibel AI-behandling. Lydfilene og transkripsjonene dine er beskyttet.'
            },
            {
              question: 'Hvor lagres opptakene mine?',
              answer: 'Transkripsjonene dine lagres sikkert på din personlige konto. Lydfiler behandles og slettes deretter av personvernhensyn. Kun det genererte tekstinnholdet lagres permanent.'
            }
          ]
        }
      }
    }
  };
  
  return translations[language as keyof typeof translations] || translations.en;
};

const FAQ: React.FC<FAQProps> = ({ language, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['gettingStarted']));
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['gettingStarted-0', 'gettingStarted-1']));
  
  const t = getFAQTranslations(language);
  
  // Safety check - if no sections, show basic content
  if (!t || !t.sections || Object.keys(t.sections).length === 0) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Help & FAQ</h1>
          <p className="mb-4">Loading FAQ content...</p>
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Back to App
          </button>
        </div>
      </div>
    );
  }

  const sectionIcons = {
    gettingStarted: <Lightbulb className="w-5 h-5" />,
    contentTypes: <FileText className="w-5 h-5" />,
    audioRecording: <Mic className="w-5 h-5" />,
    customization: <Settings className="w-5 h-5" />,
    languages: <Globe className="w-5 h-5" />,
    export: <Download className="w-5 h-5" />,
    troubleshooting: <AlertCircle className="w-5 h-5" />,
    tips: <CheckCircle className="w-5 h-5" />,
    security: <Shield className="w-5 h-5" />
  };

  const toggleSection = (sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const toggleItem = (itemKey: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemKey)) {
      newExpanded.delete(itemKey);
    } else {
      newExpanded.add(itemKey);
    }
    setExpandedItems(newExpanded);
  };

  // Filter sections and items based on search term
  const filteredSections = Object.entries(t?.sections || {}).reduce((acc, [sectionKey, section]) => {
    const filteredContent = section.content.filter(item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filteredContent.length > 0 || section.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      acc[sectionKey] = {
        ...section,
        content: searchTerm ? filteredContent : section.content
      };
    }
    
    return acc;
  }, {} as Record<string, FAQSection>);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-50 overflow-y-auto"
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                <div>
                    <h1 className="text-2xl font-bold">{t.title}</h1>
                    <p className="text-blue-100 mt-1">{t.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.backToApp}</span>
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="px-6 pb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-10 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <HelpCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-6">
                {Object.entries(filteredSections).map(([sectionKey, section]) => (
                  <motion.div
                    key={sectionKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-lg overflow-hidden"
                  >
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(sectionKey)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        {sectionIcons[sectionKey as keyof typeof sectionIcons]}
                      </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <span className="mr-2">{section.icon}</span>
                            {section.title}
                      </h2>
                          <p className="text-sm text-gray-600 mt-1">
                            {section.content.length} questions
                          </p>
                        </div>
                    </div>
                      {expandedSections.has(sectionKey) ? 
                        <ChevronUp className="w-5 h-5 text-gray-500" /> :
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      }
                    </button>
                    
                    {/* Section Content */}
                    <AnimatePresence>
                      {(expandedSections.has(sectionKey) || searchTerm) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-gray-200"
                        >
                          <div className="p-4 space-y-3">
                            {section.content.map((item, index) => {
                              const itemKey = `${sectionKey}-${index}`;
                              const isExpanded = expandedItems.has(itemKey);
                              
                              return (
                                <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                  <button
                                    onClick={() => toggleItem(itemKey)}
                                    className="w-full flex items-start justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-start space-x-3 flex-1">
                            <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                      <h3 className="font-medium text-gray-800 pr-4">
                                {item.question}
                              </h3>
                                    </div>
                                    {isExpanded ? 
                                      <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" /> :
                                      <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    }
                                  </button>
                                  
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="border-t border-gray-100"
                                      >
                                        <div className="p-4 pl-12">
                              <p className="text-gray-600 leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-600" />
                  Quick Start Guide
                  </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-semibold text-sm">
                      1
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Choose Mode</div>
                      <div className="text-sm text-gray-600">Select content type</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-semibold text-sm">
                      2
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Record Audio</div>
                      <div className="text-sm text-gray-600">Upload or record</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-semibold text-sm">
                      3
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Get Results</div>
                      <div className="text-sm text-gray-600">AI generates content</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div className="mt-6 text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-2">Still need help?</p>
                <p className="text-sm text-gray-500">
                  Contact support at{' '}
                  <a href="mailto:support@mumbletasks.com" className="text-blue-600 hover:underline">
                    support@mumbletasks.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FAQ;
