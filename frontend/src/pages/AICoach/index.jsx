import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Sparkles, User, AlertCircle,
  Lightbulb, Utensils, Trash2, Zap, Copy, Check,
  ShieldCheck, Activity, RefreshCw, MessageSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const CHAT_STORAGE_KEY = 'nutriai_coach_chat_history';

export default function AICoach() {
  const { t } = useLanguage();
  const [copiedIdx, setCopiedIdx] = useState(null);

  const suggestedCategories = [
    {
      label: t('ai_coach_prompt_deficiencies_label', 'Deficiency Deep-Dive'),
      prompt: t('ai_coach_prompt_deficiencies', 'Explain my deficiency assessment risks and recommend dietary optimizations.'),
      icon: AlertCircle,
      gradient: 'from-amber-500/15 to-orange-500/10 border-amber-200 text-amber-700'
    },
    {
      label: t('ai_coach_prompt_protein_label', 'High Protein Diet'),
      prompt: t('ai_coach_prompt_protein', 'Suggest high-protein vegetarian meal options targeting muscle synthesis.'),
      icon: Utensils,
      gradient: 'from-emerald-500/15 to-teal-500/10 border-emerald-200 text-emerald-700'
    },
    {
      label: t('ai_coach_prompt_iron_label', 'Iron & Vit D Synergy'),
      prompt: t('ai_coach_prompt_iron', 'What foods and combinations increase Iron and Vitamin D absorption?'),
      icon: Zap,
      gradient: 'from-sky-500/15 to-blue-500/10 border-sky-200 text-sky-700'
    },
    {
      label: t('ai_coach_prompt_tea_label', 'Tea & Coffee Timing'),
      prompt: t('ai_coach_prompt_tea', 'How does tea or coffee consumption affect my daily mineral absorption?'),
      icon: Lightbulb,
      gradient: 'from-purple-500/15 to-indigo-500/10 border-purple-200 text-purple-700'
    },
  ];

  // Load chat messages from localStorage or initialize with welcome message
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
    return [
      {
        role: 'assistant',
        content: t('ai_coach_initial_message', "Hello! I am your AI Clinical Nutrition Coach powered by Google Gemini 2.0 Flash. How can I help you optimize your nutritional health and meal plans today?"),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // Persist messages to localStorage whenever they update
  useEffect(() => {
    if (messages && messages.length > 0) {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      } catch (err) {
        console.error('Failed to save chat history:', err);
      }
    }
  }, [messages]);

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

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content: query, timestamp: timeStr };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
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

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || t('ai_coach_error_reply', "I couldn't generate a response at the moment. Please try again."),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.response?.data?.detail || t('ai_coach_connection_error', "Sorry, I encountered an issue connecting to Gemini. Please try again."),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear storage:', err);
    }
    setMessages([
      {
        role: 'assistant',
        content: t('ai_coach_reset_message', 'Conversation reset. I am ready for your next clinical nutrition query!'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleCopy = (content, idx) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <DashboardLayout title={t('ai_coach_title', 'AI Clinical Nutrition Coach')} subtitle={t('ai_coach_subtitle', 'Interactive 24/7 dietary assistant powered by Google Gemini 2.0 Flash')}>
      <div className="flex flex-col h-[calc(100vh-210px)] sm:h-[calc(100vh-230px)] max-w-5xl mx-auto w-full overflow-x-hidden text-[#0a192f]">

        {/* 🌟 Neural Telemetry Status Banner */}
        <div className="glass-card p-3.5 sm:p-4 mb-4 border border-sky-200/90 bg-white/95 rounded-3xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative overflow-hidden">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-black text-sm text-[#0a192f]">{t('ai_coach_header_status', 'Gemini 2.0 Flash Neural Assistant')}</span>
              </div>
              <p className="text-xs text-[#0284c7] font-bold flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('ai_coach_context_linked', 'Clinical Health Biomarkers & Deficiency Context Synced')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end shrink-0">
            <button
              onClick={handleClearChat}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title={t('ai_coach_clear_title', 'Clear Chat History')}
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>{t('ai_coach_clear_btn', 'Clear')}</span>
            </button>
          </div>
        </div>

        {/* 💬 Messages Container */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 glass-card mb-4 rounded-3xl custom-scrollbar border border-slate-200 bg-white/95 shadow-md">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-purple-500/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className="flex flex-col max-w-[92%] sm:max-w-[85%] relative">
                <div
                  className={`p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs relative ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white rounded-br-none font-medium'
                      : 'bg-slate-50 border border-slate-200 text-[#0a192f] rounded-bl-none font-medium'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <>
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-slate-800 font-medium">{children}</p>,
                          strong: ({ children }) => <strong className="font-black text-[#0a192f]">{children}</strong>,
                          em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
                          h1: ({ children }) => <h1 className="text-base sm:text-lg font-black text-[#0a192f] mt-3 mb-2 border-b border-slate-200 pb-1">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm sm:text-base font-black text-[#0a192f] mt-3 mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xs sm:text-sm font-black text-[#0a192f] mt-3 mb-1.5">{children}</h3>,
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1.5 mb-3 ml-1 text-slate-800">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1.5 mb-3 ml-1 text-slate-800">{children}</ol>,
                          li: ({ children }) => <li className="text-xs sm:text-sm text-slate-800 font-medium">{children}</li>,
                          hr: () => <hr className="my-3 border-slate-200" />,
                          code: ({ children }) => <code className="bg-purple-100/70 text-purple-900 px-2 py-0.5 rounded-lg text-xs font-mono font-bold">{children}</code>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>

                      {/* Copy Action Button for Assistant Messages */}
                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        className="absolute top-3 right-3 p-1.5 rounded-xl bg-white/80 hover:bg-white border border-slate-200 text-slate-400 hover:text-slate-700 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-xs"
                        title="Copy Response"
                      >
                        {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                  )}
                </div>
                
                <span className={`text-[10px] text-slate-400 mt-1 font-semibold px-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284c7] shrink-0 mt-1 shadow-xs">
                  <User className="w-5 h-5" />
                </div>
              )}
            </motion.div>
          ))}

          {/* ⚡ Neural Thinking Indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 items-center text-slate-500 text-xs p-1">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="flex items-center gap-2.5 bg-purple-50/80 px-4 py-3 rounded-2xl border border-purple-200 shadow-xs">
                <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
                <span className="font-bold text-purple-800">{t('ai_coach_synthesizing', 'Synthesizing clinical dietary advice...')}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* 💡 Interactive Quick Prompt Topic Cards */}
        {messages.length < 4 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mb-4">
            {suggestedCategories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSend(cat.prompt)}
                  className={`p-3 rounded-2xl bg-white border ${cat.gradient} hover:scale-[1.02] transition-all flex flex-col items-start gap-1.5 text-left cursor-pointer shadow-xs group`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-black truncate">{cat.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-tight">
                    {cat.prompt}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* ⌨️ Modern Chat Input Floating Bar */}
        <div className="glass-card p-2 flex items-center gap-2 shrink-0 rounded-2xl border border-slate-200 bg-white shadow-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('ai_coach_input_placeholder', 'Ask AI Clinical Nutritionist anything...')}
            className="flex-1 bg-transparent px-4 py-3 text-xs sm:text-sm text-[#0a192f] font-bold placeholder-slate-400 focus:outline-none min-w-0"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white font-bold disabled:opacity-40 shadow-md shadow-purple-500/25 transition-all shrink-0 cursor-pointer flex items-center gap-2 text-xs sm:text-sm border-0"
          >
            <span className="hidden sm:inline text-xs">{t('ai_coach_send_btn', 'Send')}</span>
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}

