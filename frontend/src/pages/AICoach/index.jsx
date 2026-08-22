import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SquarePen, Plus, PanelLeft, PanelLeftClose, Bot, Send, Sparkles,
  User, AlertCircle, Lightbulb, Utensils, Trash2, Zap, Copy, Check,
  ShieldCheck, Activity, RefreshCw, MessageSquare, ThumbsUp, ThumbsDown,
  Share2, RotateCcw, MoreHorizontal, Mic, SlidersHorizontal, ChevronRight, X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const SESSIONS_STORAGE_KEY = 'nutriai_coach_sessions_v2';
const ACTIVE_SESSION_KEY = 'nutriai_coach_active_session_id';

export default function AICoach() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [ratedMsgs, setRatedMsgs] = useState({});
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const suggestedCategories = [
    {
      label: t('ai_coach_prompt_deficiencies_label', 'Deficiency Deep-Dive'),
      prompt: t('ai_coach_prompt_deficiencies', 'Explain my deficiency assessment risks and recommend dietary optimizations.'),
      icon: AlertCircle,
      gradient: 'text-amber-500 bg-amber-50 border-amber-200'
    },
    {
      label: t('ai_coach_prompt_protein_label', 'High Protein Diet'),
      prompt: t('ai_coach_prompt_protein', 'Suggest high-protein vegetarian meal options targeting muscle synthesis.'),
      icon: Utensils,
      gradient: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      label: t('ai_coach_prompt_iron_label', 'Iron & Vit D Synergy'),
      prompt: t('ai_coach_prompt_iron', 'What foods and combinations increase Iron and Vitamin D absorption?'),
      icon: Zap,
      gradient: 'text-sky-600 bg-sky-50 border-sky-200'
    },
    {
      label: t('ai_coach_prompt_tea_label', 'Tea & Coffee Timing'),
      prompt: t('ai_coach_prompt_tea', 'How does tea or coffee consumption affect my daily mineral absorption?'),
      icon: Lightbulb,
      gradient: 'text-purple-600 bg-purple-50 border-purple-200'
    },
  ];

  // Multi-session storage management (ChatGPT Recents sidebar)
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
    const defaultId = 'session_' + Date.now();
    return [{
      id: defaultId,
      title: 'New Clinical Session',
      messages: [{
        role: 'assistant',
        content: t('ai_coach_initial_message', "Hello! I am your AI Clinical Nutrition Coach powered by Google Gemini 2.0 Flash. How can I help you optimize your nutritional health and meal plans today?"),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }],
      updatedAt: Date.now()
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return localStorage.getItem(ACTIVE_SESSION_KEY) || (sessions[0] ? sessions[0].id : '');
  });

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      if (activeSessionId) {
        localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
      }
    } catch (err) {
      console.error('Failed to save sessions:', err);
    }
  }, [sessions, activeSessionId]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleNewChat = () => {
    const newId = 'session_' + Date.now();
    const newSession = {
      id: newId,
      title: 'New Clinical Session',
      messages: [{
        role: 'assistant',
        content: t('ai_coach_initial_message', "Hello! I am your AI Clinical Nutrition Coach powered by Google Gemini 2.0 Flash. How can I help you optimize your nutritional health and meal plans today?"),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const handleDeleteSession = (id, e) => {
    e.stopPropagation();
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const freshId = 'session_' + Date.now();
        const fresh = [{
          id: freshId,
          title: 'New Clinical Session',
          messages: [{
            role: 'assistant',
            content: t('ai_coach_initial_message', "Hello! I am your AI Clinical Nutrition Coach powered by Google Gemini 2.0 Flash. How can I help you optimize your nutritional health and meal plans today?"),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }],
          updatedAt: Date.now()
        }];
        setActiveSessionId(freshId);
        return fresh;
      }
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    setShowPlusMenu(false);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content: query, timestamp: timeStr };
    const updatedMessages = [...messages, userMsg];

    // Auto update session title if it's the first user query
    let newTitle = activeSession.title;
    if (activeSession.title === 'New Clinical Session') {
      newTitle = query.slice(0, 26) + (query.length > 26 ? '...' : '');
    }

    setSessions(prev => prev.map(s => s.id === activeSession.id ? {
      ...s,
      title: newTitle,
      messages: updatedMessages,
      updatedAt: Date.now()
    } : s));

    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', {
        messages: updatedMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        })),
        include_health_context: true
      });

      const assistantReply = {
        role: 'assistant',
        content: data.reply || t('ai_coach_error_reply', "I couldn't generate a response at the moment. Please try again."),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setSessions(prev => prev.map(s => s.id === activeSession.id ? {
        ...s,
        messages: [...updatedMessages, assistantReply],
        updatedAt: Date.now()
      } : s));

    } catch (err) {
      const errorReply = {
        role: 'assistant',
        content: err.response?.data?.detail || t('ai_coach_connection_error', "Sorry, I encountered an issue connecting to Gemini. Please try again."),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setSessions(prev => prev.map(s => s.id === activeSession.id ? {
        ...s,
        messages: [...updatedMessages, errorReply],
        updatedAt: Date.now()
      } : s));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content, idx) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleRate = (idx, rating) => {
    setRatedMsgs(prev => ({ ...prev, [idx]: prev[idx] === rating ? null : rating }));
  };

  const toggleMic = () => {
    setIsRecording(!isRecording);
    if (!isRecording && 'webkitSpeechRecognition' in window) {
      try {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => (prev ? prev + ' ' + transcript : transcript));
          setIsRecording(false);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.start();
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  return (
    <DashboardLayout title={t('ai_coach_title', 'AI Clinical Nutrition Coach')} subtitle={t('ai_coach_subtitle', 'Interactive 24/7 dietary assistant powered by Google Gemini 2.0 Flash')}>
      <div className="flex h-[calc(100vh-210px)] sm:h-[calc(100vh-230px)] max-w-7xl mx-auto w-full overflow-hidden text-[#0a192f] rounded-3xl border border-slate-200/80 bg-white/95 shadow-xl relative">

        {/* ── 1. ChatGPT Left Recents Sidebar ──────────────────────────────── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full bg-slate-900 text-slate-200 flex flex-col shrink-0 overflow-hidden z-20 border-r border-slate-800"
            >
              {/* New Chat Button Header */}
              <div className="p-3 flex items-center justify-between gap-2 border-b border-slate-800/80">
                <button
                  onClick={handleNewChat}
                  className="flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700/80 text-white text-xs font-bold transition-all border border-slate-700/60 shadow-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <SquarePen className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                    <span>New chat</span>
                  </div>
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close sidebar"
                >
                  <PanelLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Recents Session List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Recents
                </div>
                {sessions.map(s => (
                  <div
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all group ${
                      s.id === activeSessionId
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate pr-2">{s.title}</span>
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity cursor-pointer"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* User Account Footer */}
              <div className="p-3 border-t border-slate-800/80 flex items-center gap-3 bg-slate-900/90">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-sky-500 flex items-center justify-center text-white text-xs font-black shrink-0">
                  {(user?.full_name || user?.email || 'A')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Asheesh Patel'}</p>
                  <p className="text-[10px] text-slate-400 font-semibold truncate">{user?.email || 'NutriAI Pro'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 2. ChatGPT Main Chat Container ────────────────────────────── */}
        <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
          
          {/* Header Bar */}
          <div className="h-14 border-b border-slate-100 px-4 flex items-center justify-between shrink-0 bg-white/95 z-10">
            <div className="flex items-center gap-2">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer mr-1"
                  title="Open sidebar"
                >
                  <PanelLeft className="w-5 h-5" />
                </button>
              )}
              
              {/* Mode Pill Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                <button className="px-3 py-1 rounded-xl bg-white text-xs font-black text-[#0a192f] shadow-xs flex items-center gap-1.5 cursor-pointer">
                  <Bot className="w-3.5 h-3.5 text-purple-600" />
                  <span>NutriAI Coach</span>
                </button>
                <button className="px-3 py-1 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer hidden sm:flex">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Clinical Mode</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleNewChat}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer sm:hidden"
                title="New Chat"
              >
                <SquarePen className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Gemini 2.0 Flash Active</span>
              </div>
            </div>
          </div>

          {/* ── 3. ChatGPT Message Stream ────────────────────────────────── */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-slate-50/40">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* User Message Bubble */}
                  {msg.role === 'user' ? (
                    <div className="bg-[#1e293b] text-white px-5 py-3 rounded-3xl rounded-br-sm text-xs sm:text-sm font-medium shadow-sm max-w-[85%] sm:max-w-[75%] leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  ) : (
                    /* Assistant ChatGPT Clean Response */
                    <div className="w-full flex gap-3 text-xs sm:text-sm text-slate-800">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-xs text-slate-900 mb-1.5 flex items-center gap-2">
                          <span>NutriAI Coach</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{msg.timestamp}</span>
                        </div>
                        
                        <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed font-medium text-slate-800">{children}</p>,
                              strong: ({ children }) => <strong className="font-black text-[#0a192f]">{children}</strong>,
                              em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
                              h1: ({ children }) => <h1 className="text-base sm:text-lg font-black text-[#0a192f] mt-3 mb-2 border-b border-slate-200 pb-1">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-sm sm:text-base font-black text-[#0a192f] mt-3 mb-2">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-xs sm:text-sm font-black text-[#0a192f] mt-3 mb-1.5">{children}</h3>,
                              ul: ({ children }) => <ul className="list-disc list-inside space-y-1.5 mb-3 text-slate-800">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside space-y-1.5 mb-3 text-slate-800">{children}</ol>,
                              li: ({ children }) => <li className="text-xs sm:text-sm text-slate-800 font-medium">{children}</li>,
                              hr: () => <hr className="my-3 border-slate-200" />,
                              code: ({ children }) => <code className="bg-purple-100/70 text-purple-900 px-2 py-0.5 rounded-lg text-xs font-mono font-bold">{children}</code>,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>

                        {/* ChatGPT Action Bar directly under Assistant Message */}
                        <div className="flex items-center gap-1.5 mt-3 pt-2 text-slate-400">
                          <button
                            onClick={() => handleCopy(msg.content, idx)}
                            className="p-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Copy response"
                          >
                            {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleRate(idx, 'up')}
                            className={`p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer ${
                              ratedMsgs[idx] === 'up' ? 'text-emerald-600 bg-emerald-50' : 'hover:text-slate-700'
                            }`}
                            title="Good response"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleRate(idx, 'down')}
                            className={`p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer ${
                              ratedMsgs[idx] === 'down' ? 'text-rose-600 bg-rose-50' : 'hover:text-slate-700'
                            }`}
                            title="Bad response"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleSend(messages[messages.length - 2]?.content || 'Explain again')}
                            className="p-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer ml-1"
                            title="Regenerate"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Neural Loading State */}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-center text-xs text-slate-500">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2 bg-purple-50 px-3.5 py-2.5 rounded-2xl border border-purple-200">
                    <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
                    <span className="font-bold text-purple-900">{t('ai_coach_synthesizing', 'NutriAI Coach is thinking...')}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* ── 4. ChatGPT Floating Input Bar & Quick Plus Popover ───────── */}
          <div className="p-3 sm:p-4 bg-white/95 border-t border-slate-100 shrink-0 relative">
            <div className="max-w-3xl mx-auto space-y-2">

              {/* Quick Topic Popover when '+' is clicked */}
              <AnimatePresence>
                {showPlusMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-auto max-w-3xl w-full bg-white rounded-3xl border border-slate-200 p-3 shadow-2xl z-30 grid grid-cols-1 sm:grid-cols-2 gap-2"
                  >
                    <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-100 col-span-full">
                      <span className="text-xs font-black text-slate-800">Suggested Clinical Topics</span>
                      <button onClick={() => setShowPlusMenu(false)} className="p-1 text-slate-400 hover:text-slate-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {suggestedCategories.map((cat, i) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => handleSend(cat.prompt)}
                          className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-all text-left cursor-pointer"
                        >
                          <div className={`p-2 rounded-xl ${cat.gradient}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800">{cat.label}</p>
                            <p className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">{cat.prompt}</p>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ChatGPT Floating Pill Bar */}
              <div className="flex items-center gap-2 bg-slate-100/90 border border-slate-200/90 rounded-full px-3 py-2 shadow-inner focus-within:bg-white focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
                
                {/* Plus (+) Button for Quick Topic Popover */}
                <button
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    showPlusMenu ? 'bg-slate-300 text-slate-900 rotate-45' : 'bg-slate-200/70 hover:bg-slate-300/80 text-slate-700'
                  }`}
                  title="Add prompt / topic"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Input Text Field */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('ai_coach_input_placeholder', 'Ask NutriAI Coach anything...')}
                  className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-[#0a192f] font-bold placeholder-slate-400 focus:outline-none min-w-0"
                />

                {/* Right Action Icons: Think Badge + Voice Mic + Send */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100/80 text-purple-800 text-[11px] font-black border border-purple-200">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>Think</span>
                  </div>

                  <button
                    onClick={toggleMic}
                    className={`p-2 rounded-full transition-all cursor-pointer ${
                      isRecording ? 'bg-rose-500 text-white animate-bounce' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                    }`}
                    title="Voice input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSend()}
                    disabled={loading || !input.trim()}
                    className="p-2.5 rounded-full bg-[#0a192f] hover:bg-purple-700 text-white disabled:opacity-30 shadow-md transition-all cursor-pointer flex items-center justify-center shrink-0 border-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ChatGPT Disclaimer Micro Text */}
              <p className="text-[10px] text-center text-slate-400 font-medium tracking-tight">
                NutriAI Coach can make mistakes. Verify clinical health recommendations with a licensed practitioner.
              </p>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}


