import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react';
import { CalendarEvent } from '../types';

// --- CALCULATOR ---

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
    setExpression(prev => prev + digit);
  };

  const performOperation = (operator: string) => {
    // Simple eval-safe logic for basic calc
    if (operator === 'C') {
      setDisplay('0');
      setExpression('');
      setWaitingForOperand(false);
    } else if (operator === '=') {
      try {
        // eslint-disable-next-line no-eval
        const result = eval(expression.replace('×', '*').replace('÷', '/'));
        setDisplay(String(result));
        setExpression(String(result));
        setWaitingForOperand(true);
      } catch (e) {
        setDisplay('Error');
      }
    } else {
      setExpression(prev => prev + operator);
      setWaitingForOperand(true);
    }
  };

  const buttons = [
    ['%', 'CE', 'C', '⌫'],
    ['1/x', 'x²', '√x', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['+/-', '0', '.', '=']
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <div className="p-4 bg-gray-50 dark:bg-gray-900 text-right">
        <div className="text-gray-500 text-sm h-6">{expression}</div>
        <div className="text-4xl font-bold dark:text-white truncate">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-1 p-1 bg-gray-200 dark:bg-gray-700 h-full">
        {buttons.flat().map((btn) => (
          <button
            key={btn}
            onClick={() => {
              if ('0123456789.'.includes(btn)) inputDigit(btn);
              else if (btn === '⌫') {
                 setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
                 setExpression(prev => prev.slice(0, -1));
              }
              else performOperation(btn);
            }}
            className={`${btn === '=' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'} 
              text-lg font-medium p-4 rounded shadow-sm active:scale-95 transition-transform flex items-center justify-center`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- CALENDAR ---

interface CalendarProps {
  events: Record<string, string>; // date -> note
  onSaveEvent: (date: string, note: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, onSaveEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setNoteInput(events[dateStr] || '');
  };

  const saveNote = () => {
    if (selectedDate) {
      onSaveEvent(selectedDate, noteInput);
      setSelectedDate(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h2 className="text-2xl font-light text-blue-600 dark:text-blue-400">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><ChevronLeft size={20} /></button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 flex-1 overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-white dark:bg-gray-900 p-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-white dark:bg-gray-900" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasNote = !!events[dateStr];
          
          return (
            <div 
              key={day} 
              onClick={() => handleDateClick(day)}
              className={`bg-white dark:bg-gray-900 p-2 min-h-[80px] cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors relative group`}
            >
              <span className={`text-sm ${hasNote ? 'font-bold text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                {day}
              </span>
              {hasNote && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate w-full">
                  {events[dateStr]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Note Modal */}
      {selectedDate && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl p-6 transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold dark:text-white">Notes for {selectedDate}</h3>
              <button onClick={() => setSelectedDate(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X size={20} />
              </button>
            </div>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="w-full h-40 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Type your daily plan here..."
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button 
                onClick={() => { onSaveEvent(selectedDate, ''); setSelectedDate(null); }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center"
              >
                <Trash2 size={16} className="mr-1"/> Clear
              </button>
              <button 
                onClick={saveNote}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
