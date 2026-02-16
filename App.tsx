import React, { useState, useEffect } from 'react';
import { 
  Layout, Calendar as CalendarIcon, Calculator as CalcIcon, 
  Settings as SettingsIcon, LogOut, Plus, FileText, 
  Table, Presentation, File, Search, Trash2 
} from 'lucide-react';
import { ViewState, FileType, User, FileData, AppSettings } from './types';
import { THEME_COLORS, BG_THEME_COLORS, INITIAL_FILES, generateId } from './constants';
import { Calculator, Calendar } from './components/Tools';
import { DocEditor, SheetEditor, SlideEditor, PDFViewer } from './components/Editors';

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  // State: Auth
  const [user, setUser] = useState<User | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // State: App Data
  const [view, setView] = useState<ViewState>(ViewState.AUTH);
  const [files, setFiles] = useState<FileData[]>([]);
  const [currentFile, setCurrentFile] = useState<FileData | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<Record<string, string>>({});
  
  // State: UI
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    themeColor: 'purple',
    darkMode: false,
    zoomLevel: 1,
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    // Load from LocalStorage
    const storedUser = localStorage.getItem('productivity_user');
    const storedFiles = localStorage.getItem('productivity_files');
    const storedEvents = localStorage.getItem('productivity_events');
    const storedSettings = localStorage.getItem('productivity_settings');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setView(ViewState.HOME);
    }
    
    if (storedFiles) setFiles(JSON.parse(storedFiles));
    else setFiles(INITIAL_FILES); // Load defaults if empty

    if (storedEvents) setCalendarEvents(JSON.parse(storedEvents));
    
    if (storedSettings) setSettings(JSON.parse(storedSettings));

    // System Theme Detection
    if (!storedSettings && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       setSettings(prev => ({ ...prev, darkMode: true }));
    }
  }, []);

  // --- PERSISTENCE ---
  useEffect(() => {
    if (user) localStorage.setItem('productivity_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('productivity_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('productivity_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem('productivity_settings', JSON.stringify(settings));
    // Apply Theme
    if (settings.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings]);


  // --- HANDLERS ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim() && passwordInput.trim()) {
      const newUser = { username: usernameInput };
      setUser(newUser);
      setView(ViewState.HOME);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView(ViewState.AUTH);
    localStorage.removeItem('productivity_user');
  };

  const handleDeleteAllData = () => {
    if (window.confirm("Are you sure? This will delete ALL documents and account data permanently.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const createNewFile = (type: FileType) => {
    const newFile: FileData = {
      id: generateId(),
      title: `Untitled ${type.toLowerCase()}`,
      type: type,
      content: type === FileType.SHEET ? {} : '',
      lastModified: Date.now()
    };
    setFiles([newFile, ...files]);
    setShowPlusMenu(false);
    openFile(newFile);
  };

  const openFile = (file: FileData) => {
    setCurrentFile(file);
    switch (file.type) {
      case FileType.DOC: setView(ViewState.EDITOR_DOCS); break;
      case FileType.SHEET: setView(ViewState.EDITOR_SHEETS); break;
      case FileType.SLIDE: setView(ViewState.EDITOR_SLIDES); break;
      case FileType.PDF: setView(ViewState.EDITOR_PDF); break;
    }
  };

  const saveFileContent = (id: string, content: any) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, content, lastModified: Date.now() } : f));
  };

  const saveCalendarEvent = (date: string, note: string) => {
    setCalendarEvents(prev => {
       const updated = { ...prev };
       if (!note) delete updated[date];
       else updated[date] = note;
       return updated;
    });
  };

  // --- SUB-COMPONENTS FOR CLEANER RENDER ---

  const AuthScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 p-4">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in-up">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Welcome Back</h1>
        <p className="text-gray-500 text-center mb-8">Login to your workspace</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="JohnDoe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors shadow-lg mt-4"
          >
            Login Directly
          </button>
        </form>
      </div>
    </div>
  );

  const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all mb-1
        ${active 
          ? `${THEME_COLORS[settings.themeColor].split(' ')[1]} text-white shadow-md` 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
    >
      <Icon size={20} />
      <span className="font-medium hidden md:block">{label}</span>
    </button>
  );

  const FileCard: React.FC<{ file: FileData }> = ({ file }) => {
    const getIcon = () => {
      switch (file.type) {
        case FileType.DOC: return <FileText className="text-blue-500" size={32} />;
        case FileType.SHEET: return <Table className="text-green-500" size={32} />;
        case FileType.SLIDE: return <Presentation className="text-orange-500" size={32} />;
        case FileType.PDF: return <File className="text-red-500" size={32} />;
      }
    };

    return (
      <div 
        onClick={() => openFile(file)}
        className="group bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 cursor-pointer transition-all hover:-translate-y-1 relative"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:scale-110 transition-transform">
            {getIcon()}
          </div>
          <div className="text-xs text-gray-400">
            {new Date(file.lastModified).toLocaleDateString()}
          </div>
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{file.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{file.type}</p>
      </div>
    );
  };

  const SettingsView = () => (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold dark:text-white">Settings</h2>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Appearance</h3>
        
        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-2">Theme Mode</label>
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg inline-flex">
            <button 
              onClick={() => setSettings(s => ({ ...s, darkMode: false }))}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!settings.darkMode ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
              Light
            </button>
            <button 
              onClick={() => setSettings(s => ({ ...s, darkMode: true }))}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${settings.darkMode ? 'bg-gray-600 shadow text-white' : 'text-gray-500'}`}
            >
              Dark
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-2">Accent Color</label>
          <div className="flex space-x-3">
            {(['purple', 'blue', 'green', 'red', 'custom'] as const).map(c => (
              <button
                key={c}
                onClick={() => setSettings(s => ({ ...s, themeColor: c }))}
                className={`w-8 h-8 rounded-full border-2 ${settings.themeColor === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'} ${THEME_COLORS[c].split(' ')[1]}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
        <button 
          onClick={handleDeleteAllData}
          className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
        >
          <Trash2 size={18} className="mr-2" />
          Delete All Data
        </button>
      </div>
    </div>
  );

  // --- RENDER ---
  
  if (!user) return <AuthScreen />;

  // Full Screen Editor Mode (No Layout)
  if (view === ViewState.EDITOR_DOCS && currentFile) return <DocEditor file={currentFile} onSave={saveFileContent} onClose={() => setView(ViewState.HOME)} />;
  if (view === ViewState.EDITOR_SHEETS && currentFile) return <SheetEditor file={currentFile} onSave={saveFileContent} onClose={() => setView(ViewState.HOME)} />;
  if (view === ViewState.EDITOR_SLIDES && currentFile) return <SlideEditor file={currentFile} onSave={saveFileContent} onClose={() => setView(ViewState.HOME)} />;
  if (view === ViewState.EDITOR_PDF && currentFile) return <PDFViewer file={currentFile} onSave={saveFileContent} onClose={() => setView(ViewState.HOME)} />;

  return (
    <div className={`flex h-screen overflow-hidden ${BG_THEME_COLORS[settings.themeColor]} transition-colors duration-300`} style={{ fontSize: `${settings.zoomLevel}rem` }}>
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 z-20">
        <div className="mb-8 px-2">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
            Productivity<span className="text-gray-900 dark:text-white">OS</span>
          </h1>
        </div>
        
        <div className="space-y-1 flex-1">
          <SidebarItem icon={Layout} label="Home" active={view === ViewState.HOME} onClick={() => setView(ViewState.HOME)} />
          <SidebarItem icon={CalendarIcon} label="Calendar" active={view === ViewState.CALENDAR} onClick={() => setView(ViewState.CALENDAR)} />
          <SidebarItem icon={CalcIcon} label="Calculator" active={view === ViewState.CALCULATOR} onClick={() => setView(ViewState.CALCULATOR)} />
          <SidebarItem icon={SettingsIcon} label="Settings" active={view === ViewState.SETTINGS} onClick={() => setView(ViewState.SETTINGS)} />
        </div>

        <div className="mt-auto pt-4 border-t dark:border-gray-800">
          <div className="flex items-center space-x-3 px-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium dark:text-white truncate">{user.username}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 shadow-sm z-20">
           <h1 className="text-xl font-bold text-gray-800 dark:text-white">ProductivityOS</h1>
           <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
              {user.username[0].toUpperCase()}
           </div>
        </div>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth no-scrollbar">
          {view === ViewState.HOME && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-light text-gray-800 dark:text-white mb-1">Hello, <span className="font-bold">{user.username}</span></h2>
                <p className="text-gray-500 dark:text-gray-400">Here's what you've been working on.</p>
              </div>

              {/* Search Bar */}
              <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search your library..." 
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                />
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                 {files.map(file => (
                   <FileCard key={file.id} file={file} />
                 ))}
                 {/* Create New Card (Desktop visible mostly) */}
                 <div 
                   onClick={() => setShowPlusMenu(true)}
                   className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-400 hover:border-purple-500 hover:text-purple-500 cursor-pointer transition-colors min-h-[140px]"
                 >
                   <Plus size={32} />
                   <span className="mt-2 font-medium">Create New</span>
                 </div>
              </div>
            </div>
          )}

          {view === ViewState.CALENDAR && (
            <div className="h-full max-w-5xl mx-auto pb-20">
              <Calendar events={calendarEvents} onSaveEvent={saveCalendarEvent} />
            </div>
          )}

          {view === ViewState.CALCULATOR && (
            <div className="h-full flex items-center justify-center pb-20">
              <Calculator />
            </div>
          )}

          {view === ViewState.SETTINGS && (
            <div className="pb-20">
              <SettingsView />
            </div>
          )}
        </div>

        {/* Floating Action Button (FAB) */}
        <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-50">
          <div className="relative">
            {showPlusMenu && (
               <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-2 mb-2 w-48 animate-fade-in-up border dark:border-gray-700">
                 <button onClick={() => createNewFile(FileType.DOC)} className="flex items-center w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-700 dark:text-gray-200">
                   <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3"><FileText size={18} /></div> Docs
                 </button>
                 <button onClick={() => createNewFile(FileType.SHEET)} className="flex items-center w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-700 dark:text-gray-200">
                   <div className="p-2 bg-green-100 text-green-600 rounded-lg mr-3"><Table size={18} /></div> Excel
                 </button>
                 <button onClick={() => createNewFile(FileType.SLIDE)} className="flex items-center w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-700 dark:text-gray-200">
                   <div className="p-2 bg-orange-100 text-orange-600 rounded-lg mr-3"><Presentation size={18} /></div> PPT
                 </button>
                 <button onClick={() => createNewFile(FileType.PDF)} className="flex items-center w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-700 dark:text-gray-200">
                   <div className="p-2 bg-red-100 text-red-600 rounded-lg mr-3"><File size={18} /></div> PDF
                 </button>
               </div>
            )}
            <button 
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              className={`p-4 rounded-full shadow-lg text-white transition-transform ${showPlusMenu ? 'rotate-45 bg-gray-700' : THEME_COLORS[settings.themeColor].split(' ')[1]} hover:scale-105 active:scale-95`}
            >
              <Plus size={28} />
            </button>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-2 flex justify-around items-center absolute bottom-0 w-full z-40">
           <button onClick={() => setView(ViewState.HOME)} className={`p-2 rounded-xl ${view === ViewState.HOME ? 'text-purple-600 bg-purple-50 dark:bg-gray-800' : 'text-gray-400'}`}><Layout size={24} /></button>
           <button onClick={() => setView(ViewState.CALENDAR)} className={`p-2 rounded-xl ${view === ViewState.CALENDAR ? 'text-purple-600 bg-purple-50 dark:bg-gray-800' : 'text-gray-400'}`}><CalendarIcon size={24} /></button>
           <div className="w-12"></div> {/* Spacer for FAB */}
           <button onClick={() => setView(ViewState.CALCULATOR)} className={`p-2 rounded-xl ${view === ViewState.CALCULATOR ? 'text-purple-600 bg-purple-50 dark:bg-gray-800' : 'text-gray-400'}`}><CalcIcon size={24} /></button>
           <button onClick={() => setView(ViewState.SETTINGS)} className={`p-2 rounded-xl ${view === ViewState.SETTINGS ? 'text-purple-600 bg-purple-50 dark:bg-gray-800' : 'text-gray-400'}`}><SettingsIcon size={24} /></button>
        </div>

      </main>
    </div>
  );
};

export default App;