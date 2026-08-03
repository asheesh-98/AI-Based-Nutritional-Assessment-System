import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bot, Send, Sparkles, User, RefreshCw, AlertCircle,
  Lightbulb, ShieldCheck, Cpu, Utensils, Activity, Trash2, ArrowRight, Zap
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';



export default function AICoach() {
  const { t } = useLanguage();

  const suggestedCategories = [
    { label: t('ai_coach_prompt_deficiencies_label'), prompt: t('ai_coach_prompt_deficiencies'), icon: AlertCircle, color: 'text-amber-400' },
    { label: t('ai_coach_prompt_protein_label'), prompt: t('ai_coach_prompt_protein'), icon: Utensils, color: 'text-emerald-400' },
    { label: t('ai_coach_prompt_iron_label'), prompt: t('ai_coach_prompt_iron'), icon: Zap, color: 'text-cyan-400' },
    { label: t('ai_coach_prompt_tea_label'), prompt: t('ai_coach_prompt_tea'), icon: Lightbulb, color: 'text-purple-400' },
  ];

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('ai_coach_initial_message'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

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
        content: data.reply || t('ai_coach_error_reply'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.response?.data?.detail || t('ai_coach_connection_error'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: t('ai_coach_reset_message'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <DashboardLayout title={t('ai_coach_title')} subtitle={t('ai_coach_subtitle')}>
      <div className="flex flex-col h-[calc(100vh-220px)] sm:h-[calc(100vh-240px)] max-w-5xl mx-auto w-full overflow-x-hidden pb-2">

        {/* 🌟 Header Status & Telemetry Bar */}
        <div className="glass-card px-4 py-3 mb-3.5 flex flex-wrap items-center justify-between gap-3 border border-cyan-500/20 bg-cyan-500/5 rounded-2xl text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white">{t('ai_coach_header_status')}</span>
            <span className="text-cyan-400 font-semibold hidden sm:inline">{t('ai_coach_context_linked')}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="text-[11px] font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-xl glass border border-white/10 flex items-center gap-1 transition-all cursor-pointer"
              title={t('ai_coach_clear_title')}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{t('ai_coach_clear_btn')}</span>
            </button>
          </div>
        </div>

        {/* 💬 Messages Container (Internal Scroll Only) */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 glass-card mb-3.5 rounded-3xl custom-scrollbar border border-white/10">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl gradient-bg flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-cyan-500/20">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              
              <div className="flex flex-col max-w-[88%] sm:max-w-[80%]">
                <div
                  className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-lg ${
                    msg.role === 'user'
                      ? 'gradient-bg text-white rounded-br-none shadow-cyan-500/20 font-medium'
                      : 'glass border border-white/10 text-slate-200 rounded-bl-none font-normal'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                </div>
                <span className={`text-[10px] text-slate-500 mt-1 font-medium px-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-1">
                  <User className="w-5 h-5" />
                </div>
              )}
            </motion.div>
          ))}

          {/* ⚡ Thinking Neural Spinner */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-center text-slate-400 text-xs p-1">
              <div className="w-9 h-9 rounded-2xl gradient-bg flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/20">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex items-center gap-2.5 glass px-4 py-2.5 rounded-2xl border border-cyan-500/30">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="font-semibold text-cyan-300">{t('ai_coach_synthesizing')}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* 💡 Categorized Suggested Prompts */}
        {messages.length < 4 && (
          <div className="flex flex-nowrap sm:flex-wrap gap-2 mb-3 overflow-x-auto custom-scrollbar pb-1">
            {suggestedCategories.map((cat, i) => (
              <button
                key={i}
                onClick={() => handleSend(cat.prompt)}
                className="text-[11px] sm:text-xs glass hover:bg-white/10 border border-white/10 text-slate-300 px-3.5 py-2 rounded-2xl transition-all flex items-center gap-2 shrink-0 cursor-pointer whitespace-nowrap"
              >
                <cat.icon className={`w-3.5 h-3.5 ${cat.color} shrink-0`} />
                <span className="font-semibold">{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* ⌨️ Glassmorphism Chat Input Bar */}
        <div className="glass-card p-2 flex items-center gap-2 shrink-0 rounded-2xl border border-white/10 shadow-xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('ai_coach_input_placeholder')}
            className="flex-1 bg-transparent px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none min-w-0 font-medium"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-4 py-3 rounded-xl gradient-bg text-white font-bold disabled:opacity-40 hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span className="hidden sm:inline text-xs">{t('ai_coach_send_btn')}</span>
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
