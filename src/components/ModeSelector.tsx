import React from 'react';
import { motion } from 'framer-motion';
import { ListTodo, BookOpen, ArrowRight } from 'lucide-react';

interface ModeSelectorProps {
  onModeSelect: (mode: 'tasks' | 'biography') => void;
  language: string;
}

const getTranslations = (language: string) => {
  const translations = {
    en: {
      title: 'Choose Your Mode',
      tasks: {
        title: 'Task Mode',
        description: 'Convert voice memos into actionable tasks and summaries',
        cta: 'Get Started'
      },
      biography: {
        title: 'Biography Mode',
        description: 'Transform your spoken thoughts into structured content',
        cta: 'Get Started'
      }
    },
    no: {
      title: 'Velg Modus',
      tasks: {
        title: 'Oppgavemodus',
        description: 'Gjør talenotater om til handlinger og sammendrag',
        cta: 'Kom i Gang'
      },
      biography: {
        title: 'Biografimodus',
        description: 'Gjør talte tanker om til strukturert innhold',
        cta: 'Kom i Gang'
      }
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

export default function ModeSelector({ onModeSelect, language }: ModeSelectorProps) {
  const t = getTranslations(language);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">
        {t.title}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Task Mode Card */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onModeSelect('tasks')}
          className="w-full bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500"
        >
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ListTodo className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t.tasks.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {t.tasks.description}
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                <span>{t.tasks.cta}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>
        </motion.button>

        {/* Biography Mode Card */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onModeSelect('biography')}
          className="w-full bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-500"
        >
          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t.biography.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {t.biography.description}
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                <span>{t.biography.cta}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}