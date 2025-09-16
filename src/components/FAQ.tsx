import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Mic, 
  FileText, 
  Users, 
  MessageSquare, 
  Settings, 
  Upload, 
  Download,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

interface FAQProps {
  language: string;
  onClose: () => void;
}

const getFAQTranslations = (language: string) => {
  const translations = {
    en: {
      title: 'Help & FAQ',
      subtitle: 'Complete guide to using MumbleTasks',
      backToApp: 'Back to App',
      sections: {
        gettingStarted: {
          title: 'Getting Started',
          icon: '🚀',
          content: [
            {
              question: 'How do I use MumbleTasks?',
              answer: 'MumbleTasks converts your voice recordings into structured content in 5 simple steps: 1) Choose your content type, 2) Select platform/format, 3) Customize settings, 4) Select language, 5) Record or upload audio.'
            },
            {
              question: 'What types of content can I create?',
              answer: 'You can create: Task lists, Meeting notes, Articles, Social media content (TikTok, YouTube, LinkedIn, Facebook, Twitter), Blog posts, and Custom prompts.'
            },
            {
              question: 'Do I need an account?',
              answer: 'Yes, you need to sign in to save your transcriptions and access all features. Use the credentials: alfa@test1.no / 123456 for testing.'
            }
          ]
        },
        audioRecording: {
          title: 'Audio Recording Best Practices',
          icon: '🎤',
          content: [
            {
              question: 'What audio quality do I need?',
              answer: 'For best results: Speak clearly, use a quiet environment, keep phone/microphone close (6-12 inches), avoid background noise, and speak at normal pace.'
            },
            {
              question: 'How long can my recording be?',
              answer: 'Recordings can be up to 10 minutes long. For longer content, break it into smaller segments for better processing accuracy.'
            },
            {
              question: 'What file formats are supported?',
              answer: 'Supported formats: MP3, WAV, M4A, and most common audio formats. Maximum file size is 25MB.'
            },
            {
              question: 'Can I upload existing audio files?',
              answer: 'Yes! Click the upload button instead of record to upload existing audio files from your device.'
            }
          ]
        },
        contentTypes: {
          title: 'Content Types Guide',
          icon: '📝',
          content: [
            {
              question: 'Tasks - When to use?',
              answer: 'Perfect for: Voice memos with action items, meeting recordings with decisions, brainstorming sessions, project planning discussions.'
            },
            {
              question: 'Meeting Notes - When to use?',
              answer: 'Ideal for: Team meetings, client calls, interviews, conference calls. Automatically identifies speakers and extracts action items.'
            },
            {
              question: 'Articles - When to use?',
              answer: 'Great for: Blog posts, opinion pieces, educational content, industry analysis. Choose from various article types and writing styles.'
            },
            {
              question: 'Content Creator - When to use?',
              answer: 'Perfect for: Social media content, video scripts, marketing copy. Optimized for each platform\'s best practices and algorithms.'
            }
          ]
        },
        platformOptimization: {
          title: 'Platform-Specific Tips',
          icon: '🎯',
          content: [
            {
              question: 'TikTok/Instagram Reels optimization',
              answer: 'Focus on: Hook in first 3 seconds, visual transitions every 3-5 seconds, trending topics, clear call-to-action. Keep it 15-60 seconds.'
            },
            {
              question: 'YouTube video optimization',
              answer: 'Include: Strong hook, clear value proposition, engagement hooks throughout, subscribe reminders, end screen optimization. Target 8-15 minutes for best retention.'
            },
            {
              question: 'LinkedIn post optimization',
              answer: 'Use: Professional tone, industry insights, personal stories, discussion questions. Aim for 200-400 words for best engagement.'
            },
            {
              question: 'Twitter thread optimization',
              answer: 'Structure: Hook tweet, numbered sequence, one insight per tweet, engaging final tweet with CTA. Keep threads 5-10 tweets long.'
            }
          ]
        },
        customization: {
          title: 'Customization Options',
          icon: '⚙️',
          content: [
            {
              question: 'How do I customize tone and style?',
              answer: 'In the customization step, select your preferred tone (professional, casual, academic) and style (informative, persuasive, conversational). Add specific notes for additional requirements.'
            },
            {
              question: 'What should I put in additional notes?',
              answer: 'Include: Specific angles, key points to emphasize, target keywords, publication guidelines, expert sources to mention, or any special requirements.'
            },
            {
              question: 'How do I choose the right target audience?',
              answer: 'Consider: Industry professionals, general public, students, executives. This affects language complexity, examples used, and content depth.'
            }
          ]
        },
        troubleshooting: {
          title: 'Troubleshooting',
          icon: '🔧',
          content: [
            {
              question: 'My transcription is inaccurate',
              answer: 'Try: Speaking more clearly, reducing background noise, using a better microphone, speaking slower, or re-recording in a quieter environment.'
            },
            {
              question: 'The generated content doesn\'t match my needs',
              answer: 'Improve by: Adding more specific notes in customization, choosing a more appropriate content type, providing clearer audio, or trying different tone/style settings.'
            },
            {
              question: 'Processing is taking too long',
              answer: 'This can happen with: Very long recordings, poor audio quality, or high server load. Try shorter recordings or wait a few minutes and retry.'
            },
            {
              question: 'I can\'t hear my recording playback',
              answer: 'Check: Device volume, browser permissions for audio, microphone settings, and try refreshing the page.'
            }
          ]
        },
        tips: {
          title: 'Pro Tips',
          icon: '💡',
          content: [
            {
              question: 'How to get the best results?',
              answer: 'Best practices: Outline key points before recording, speak in complete sentences, mention specific examples, state your goals clearly, and use the additional notes field for context.'
            },
            {
              question: 'Can I edit the generated content?',
              answer: 'Yes! All generated content can be copied and edited in your preferred text editor. Use the export options to download in various formats.'
            },
            {
              question: 'How do I save my work?',
              answer: 'Your transcriptions are automatically saved to your account. You can access them anytime from the history view and export in multiple formats.'
            }
          ]
        }
      }
    },
    no: {
      title: 'Hjelp & FAQ',
      subtitle: 'Komplett guide til å bruke MumbleTasks',
      backToApp: 'Tilbake til App',
      sections: {
        gettingStarted: {
          title: 'Kom i gang',
          icon: '🚀',
          content: [
            {
              question: 'Hvordan bruker jeg MumbleTasks?',
              answer: 'MumbleTasks konverterer lydopptak til strukturert innhold i 5 enkle steg: 1) Velg innholdstype, 2) Velg plattform/format, 3) Tilpass innstillinger, 4) Velg språk, 5) Ta opp eller last opp lyd.'
            },
            {
              question: 'Hvilke typer innhold kan jeg lage?',
              answer: 'Du kan lage: Oppgavelister, Møtenotater, Artikler, Sosiale medier-innhold (TikTok, YouTube, LinkedIn, Facebook, Twitter), Blogginnlegg, og Tilpassede instrukser.'
            },
            {
              question: 'Trenger jeg en konto?',
              answer: 'Ja, du må logge inn for å lagre transkripsjoner og få tilgang til alle funksjoner. Bruk: alfa@test1.no / 123456 for testing.'
            }
          ]
        },
        audioRecording: {
          title: 'Beste praksis for lydopptak',
          icon: '🎤',
          content: [
            {
              question: 'Hvilken lydkvalitet trenger jeg?',
              answer: 'For beste resultater: Snakk tydelig, bruk et stille miljø, hold telefon/mikrofon nær (15-30 cm), unngå bakgrunnsstøy, og snakk i normalt tempo.'
            },
            {
              question: 'Hvor langt kan opptaket mitt være?',
              answer: 'Opptak kan være opptil 10 minutter lange. For lengre innhold, del det opp i mindre segmenter for bedre prosesseringsnøyaktighet.'
            },
            {
              question: 'Hvilke filformater støttes?',
              answer: 'Støttede formater: MP3, WAV, M4A, og de fleste vanlige lydformater. Maksimal filstørrelse er 25MB.'
            },
            {
              question: 'Kan jeg laste opp eksisterende lydfiler?',
              answer: 'Ja! Klikk på last opp-knappen i stedet for opptak for å laste opp eksisterende lydfiler fra enheten din.'
            }
          ]
        },
        contentTypes: {
          title: 'Guide til innholdstyper',
          icon: '📝',
          content: [
            {
              question: 'Oppgaver - Når skal jeg bruke dette?',
              answer: 'Perfekt for: Talenotater med handlingspunkter, møteopptak med beslutninger, brainstorming-økter, prosjektplanleggingsdiskusjoner.'
            },
            {
              question: 'Møtenotater - Når skal jeg bruke dette?',
              answer: 'Ideelt for: Teammøter, klientsamtaler, intervjuer, konferansesamtaler. Identifiserer automatisk talere og trekker ut handlingspunkter.'
            },
            {
              question: 'Artikler - Når skal jeg bruke dette?',
              answer: 'Flott for: Blogginnlegg, meningsytringer, utdanningsinnhold, bransjeanalyser. Velg mellom ulike artikkeltyper og skriverstiler.'
            },
            {
              question: 'Innholdsskaper - Når skal jeg bruke dette?',
              answer: 'Perfekt for: Sosiale medier-innhold, videomanus, markedsføringstekster. Optimalisert for hver plattforms beste praksis og algoritmer.'
            }
          ]
        },
        platformOptimization: {
          title: 'Plattformspesifikke tips',
          icon: '🎯',
          content: [
            {
              question: 'TikTok/Instagram Reels optimalisering',
              answer: 'Fokuser på: Hook i første 3 sekunder, visuelle overganger hver 3-5 sekund, trending emner, tydelig oppfordring til handling. Hold det 15-60 sekunder.'
            },
            {
              question: 'YouTube video optimalisering',
              answer: 'Inkluder: Sterk hook, tydelig verdiforslag, engasjementshooks gjennom hele, abonner-påminnelser, sluttskjerm-optimalisering. Sikter på 8-15 minutter for beste oppbevaring.'
            },
            {
              question: 'LinkedIn innlegg optimalisering',
              answer: 'Bruk: Profesjonell tone, bransjeinnsikt, personlige historier, diskusjonsspørsmål. Sikter på 200-400 ord for beste engasjement.'
            },
            {
              question: 'Twitter tråd optimalisering',
              answer: 'Struktur: Hook-tweet, nummerert sekvens, én innsikt per tweet, engasjerende siste tweet med CTA. Hold tråder 5-10 tweets lange.'
            }
          ]
        },
        customization: {
          title: 'Tilpasningsmuligheter',
          icon: '⚙️',
          content: [
            {
              question: 'Hvordan tilpasser jeg tone og stil?',
              answer: 'I tilpasningssteget, velg ønsket tone (profesjonell, uformell, akademisk) og stil (informativ, overbevisende, samtalepreget). Legg til spesifikke notater for ytterligere krav.'
            },
            {
              question: 'Hva skal jeg skrive i tilleggsnotater?',
              answer: 'Inkluder: Spesifikke vinklinger, nøkkelpunkter å fremheve, målnøkkelord, publiseringsretningslinjer, ekspertkilder å nevne, eller spesielle krav.'
            },
            {
              question: 'Hvordan velger jeg riktig målgruppe?',
              answer: 'Vurder: Bransjefolk, allmennheten, studenter, ledere. Dette påvirker språkkompleksitet, eksempler som brukes, og innholdsdybde.'
            }
          ]
        },
        troubleshooting: {
          title: 'Feilsøking',
          icon: '🔧',
          content: [
            {
              question: 'Transkripsjonen min er unøyaktig',
              answer: 'Prøv: Snakk tydeligere, reduser bakgrunnsstøy, bruk en bedre mikrofon, snakk saktere, eller ta opp på nytt i et stillere miljø.'
            },
            {
              question: 'Det genererte innholdet passer ikke mine behov',
              answer: 'Forbedre ved: Legge til mer spesifikke notater i tilpasning, velge en mer passende innholdstype, gi tydeligere lyd, eller prøve andre tone/stil-innstillinger.'
            },
            {
              question: 'Prosessering tar for lang tid',
              answer: 'Dette kan skje med: Veldig lange opptak, dårlig lydkvalitet, eller høy serverbelastning. Prøv kortere opptak eller vent noen minutter og prøv igjen.'
            },
            {
              question: 'Jeg kan ikke høre opptaksavspillingen',
              answer: 'Sjekk: Enhetens volum, nettleserens tillatelser for lyd, mikrofoninnstillinger, og prøv å oppdatere siden.'
            }
          ]
        },
        tips: {
          title: 'Profftips',
          icon: '💡',
          content: [
            {
              question: 'Hvordan få de beste resultatene?',
              answer: 'Beste praksis: Skisser nøkkelpunkter før opptak, snakk i hele setninger, nevn spesifikke eksempler, oppgi målene dine tydelig, og bruk tilleggsnotater-feltet for kontekst.'
            },
            {
              question: 'Kan jeg redigere det genererte innholdet?',
              answer: 'Ja! Alt generert innhold kan kopieres og redigeres i din foretrukne tekstredigerer. Bruk eksportalternativene for å laste ned i ulike formater.'
            },
            {
              question: 'Hvordan lagrer jeg arbeidet mitt?',
              answer: 'Transkripsjonene dine lagres automatisk på kontoen din. Du kan få tilgang til dem når som helst fra historikkvisningen og eksportere i flere formater.'
            }
          ]
        }
      }
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

const FAQ: React.FC<FAQProps> = ({ language, onClose }) => {
  const t = getFAQTranslations(language);

  const sectionIcons = {
    gettingStarted: <Lightbulb className="w-5 h-5" />,
    audioRecording: <Mic className="w-5 h-5" />,
    contentTypes: <FileText className="w-5 h-5" />,
    platformOptimization: <Users className="w-5 h-5" />,
    customization: <Settings className="w-5 h-5" />,
    troubleshooting: <AlertCircle className="w-5 h-5" />,
    tips: <CheckCircle className="w-5 h-5" />
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-50 overflow-y-auto"
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{t.title}</h1>
                  <p className="text-blue-100 mt-2">{t.subtitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.backToApp}</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-8">
                {Object.entries(t.sections).map(([sectionKey, section]) => (
                  <motion.div
                    key={sectionKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-50 rounded-lg p-6"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        {sectionIcons[sectionKey as keyof typeof sectionIcons]}
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {section.icon} {section.title}
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      {section.content.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start space-x-3">
                            <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-800 mb-2">
                                {item.question}
                              </h3>
                              <p className="text-gray-600 leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {language === 'no' ? 'Trenger du mer hjelp?' : 'Need More Help?'}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {language === 'no' 
                    ? 'Hvis du fortsatt har spørsmål eller problemer, prøv å eksperimentere med ulike innstillinger eller ta kontakt for støtte.'
                    : 'If you still have questions or issues, try experimenting with different settings or reach out for support.'
                  }
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
