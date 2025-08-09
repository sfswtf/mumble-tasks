import React, { useState } from 'react';
import { Calendar, Clock, ChevronDown, Copy, Check, Video, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parse } from 'date-fns';

interface Task {
  id: string;
  text: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  dueTime?: string;
}

interface TaskItemProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export default function TaskItem({ task, onUpdateTask }: TaskItemProps) {
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    onUpdateTask(task.id, { dueDate: newDate });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    onUpdateTask(task.id, { dueTime: newTime });
  };

  const handlePriorityChange = (newPriority: 'High' | 'Medium' | 'Low') => {
    onUpdateTask(task.id, { priority: newPriority });
    setShowPriorityDropdown(false);
  };

  const copyToClipboard = async () => {
    const formattedTask = `Task: ${task.text}\nPriority: ${task.priority}\nDue: ${task.dueDate}${task.dueTime ? ` at ${task.dueTime}` : ''}`;
    await navigator.clipboard.writeText(formattedTask);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Create properly formatted date strings for calendar links
  const createCalendarEvent = (provider: 'google' | 'outlook') => {
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

  const createGoogleMeetEvent = () => {
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

  return (
    <motion.div
      layout
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300"
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <p className="text-gray-800 font-medium">{task.text}</p>
          <button
            onClick={copyToClipboard}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Priority Selector */}
          <div className="relative">
            <button
              onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
              className={`px-3 py-1.5 rounded-full flex items-center space-x-2 ${
                task.priority === 'High' ? 'bg-red-100 text-red-800' :
                task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}
            >
              <span>{task.priority}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showPriorityDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg z-10"
                >
                  {['High', 'Medium', 'Low'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => handlePriorityChange(priority as Task['priority'])}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${
                        priority === 'High' ? 'text-red-800 hover:bg-red-50' :
                        priority === 'Medium' ? 'text-yellow-800 hover:bg-yellow-50' :
                        'text-green-800 hover:bg-green-50'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Date and Time Inputs */}
          <div className="flex items-center space-x-2">
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 absolute left-3 text-gray-400" />
              <input
                type="date"
                value={task.dueDate}
                onChange={handleDateChange}
                className="pl-10 pr-3 py-1.5 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative flex items-center">
              <Clock className="w-4 h-4 absolute left-3 text-gray-400" />
              <input
                type="time"
                value={task.dueTime || ''}
                onChange={handleTimeChange}
                className="pl-10 pr-3 py-1.5 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Calendar Integration */}
        <div className="border-t pt-3 mt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Add to Calendar</h4>
          <div className="flex flex-wrap gap-2">
            <a
              href={createCalendarEvent('google')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors text-sm"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Google Calendar
            </a>
            
            <a
              href={createGoogleMeetEvent()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors text-sm"
            >
              <Video className="w-4 h-4 mr-1" />
              Google Meet
            </a>
            
            <a
              href={createCalendarEvent('outlook')}
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
  );
}