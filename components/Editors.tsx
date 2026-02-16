import React, { useState } from 'react';
import { FileData, FileType } from '../types';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Download, Grid3X3, Save } from 'lucide-react';

interface EditorProps {
  file: FileData;
  onSave: (id: string, content: any) => void;
  onClose: () => void;
}

// --- DOCS EDITOR (Word-like) ---
export const DocEditor: React.FC<EditorProps> = ({ file, onSave, onClose }) => {
  const [content, setContent] = useState(file.content || '');

  const handleSave = () => {
    onSave(file.id, content);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-2 shadow-sm flex items-center space-x-2 border-b dark:border-gray-700 overflow-x-auto">
        <button onClick={onClose} className="text-blue-600 font-bold px-3">←</button>
        <span className="font-medium px-2 dark:text-gray-200">{file.title}</span>
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><Bold size={18} /></button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><Italic size={18} /></button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><Underline size={18} /></button>
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><AlignLeft size={18} /></button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><AlignCenter size={18} /></button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><AlignRight size={18} /></button>
        <div className="flex-1"></div>
        <button onClick={handleSave} className="flex items-center px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
          <Save size={16} className="mr-2"/> Save
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
        <div 
          className="bg-white text-black shadow-lg w-full max-w-[800px] min-h-[1000px] p-8 outline-none focus:ring-1 ring-blue-200"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setContent(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

// --- SHEETS EDITOR (Excel-like) ---
export const SheetEditor: React.FC<EditorProps> = ({ file, onSave, onClose }) => {
  const initialData = typeof file.content === 'object' ? file.content : {};
  const [data, setData] = useState<Record<string, string>>(initialData);

  const handleCellChange = (cell: string, value: string) => {
    setData(prev => ({ ...prev, [cell]: value }));
  };

  const rows = 20;
  const cols = 10;
  const colLabels = Array.from({ length: cols }, (_, i) => String.fromCharCode(65 + i));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-green-600 p-2 text-white flex justify-between items-center shadow">
        <div className="flex items-center">
          <button onClick={onClose} className="font-bold px-3 mr-2">←</button>
          <Grid3X3 size={20} className="mr-2"/>
          <span className="font-medium">{file.title}</span>
        </div>
        <button onClick={() => onSave(file.id, data)} className="bg-green-700 px-3 py-1 rounded hover:bg-green-800 text-sm">Save</button>
      </div>

      {/* Formula Bar */}
      <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b flex items-center">
        <span className="text-gray-500 font-serif italic font-bold mx-2">fx</span>
        <input className="flex-1 border rounded px-2 py-1 dark:bg-gray-700 dark:text-white" placeholder="Function" />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
        <div className="inline-block min-w-full">
          <div className="flex">
            <div className="w-10 bg-gray-200 dark:bg-gray-800 border-r border-b"></div>
            {colLabels.map(c => (
              <div key={c} className="w-24 bg-gray-200 dark:bg-gray-800 border-r border-b text-center text-sm font-semibold py-1 text-gray-700 dark:text-gray-300">
                {c}
              </div>
            ))}
          </div>
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex">
              <div className="w-10 bg-gray-200 dark:bg-gray-800 border-r border-b text-center text-xs text-gray-600 dark:text-gray-400 py-1 flex items-center justify-center">
                {r + 1}
              </div>
              {colLabels.map((c) => {
                const cellId = `${c}${r + 1}`;
                return (
                  <input
                    key={cellId}
                    value={data[cellId] || ''}
                    onChange={(e) => handleCellChange(cellId, e.target.value)}
                    className="w-24 border-r border-b px-1 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- SLIDES EDITOR (PPT-like) ---
export const SlideEditor: React.FC<EditorProps> = ({ file, onSave, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [1, 2, 3]; // Mock slides

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      <div className="bg-orange-500 text-white p-2 flex justify-between items-center shadow">
         <div className="flex items-center">
          <button onClick={onClose} className="font-bold px-3 mr-2">←</button>
          <span className="font-medium">{file.title}</span>
        </div>
        <button onClick={() => onSave(file.id, {})} className="bg-orange-600 px-3 py-1 rounded hover:bg-orange-700 text-sm">Save</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-gray-200 dark:bg-gray-800 border-r dark:border-gray-700 overflow-y-auto p-4 space-y-4">
          {slides.map((s, idx) => (
            <div 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`aspect-video bg-white shadow cursor-pointer border-2 ${currentSlide === idx ? 'border-orange-500' : 'border-transparent'} flex items-center justify-center text-xs text-gray-400`}
            >
              Slide {s}
            </div>
          ))}
        </div>

        {/* Main Stage */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-8 flex items-center justify-center">
          <div className="aspect-video w-full max-w-4xl bg-white shadow-2xl flex flex-col items-center justify-center p-10 text-center">
            <h1 className="text-4xl font-bold text-black mb-4">Click to add title</h1>
            <p className="text-xl text-gray-500">Click to add subtitle</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PDF VIEWER (ReadOnly Mimic) ---
export const PDFViewer: React.FC<EditorProps> = ({ file, onClose }) => {
  return (
    <div className="flex flex-col h-full bg-gray-700">
      <div className="bg-gray-800 text-white p-2 flex justify-between items-center shadow z-10">
        <div className="flex items-center">
          <button onClick={onClose} className="font-bold px-3 mr-2">←</button>
          <span className="font-medium">{file.title}.pdf</span>
        </div>
        <Download size={20} className="cursor-pointer hover:text-gray-300"/>
      </div>
      <div className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="bg-white w-full max-w-[800px] min-h-[1100px] shadow-lg p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{file.title}</h1>
          <div className="space-y-4 text-gray-700">
            <p>This is a read-only PDF view of your document.</p>
            <div className="h-4 bg-gray-200 w-full rounded"></div>
            <div className="h-4 bg-gray-200 w-5/6 rounded"></div>
            <div className="h-4 bg-gray-200 w-4/6 rounded"></div>
            <br />
             <div className="h-40 bg-gray-100 w-full rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
               [Image Placeholder]
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};