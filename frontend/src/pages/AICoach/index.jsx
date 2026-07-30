import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Sparkles, User, RefreshCw, AlertCircle,
  Lightbulb, ShieldCheck
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';

const suggestedPrompts = [
  "What foods boost Vitamin D?",
  "High-protein vegetarian breakfast recipe",
  "How does tea/coffee affect iron absorption?",
  "Explain my deficiency assessment risks"
];

export default function AICoach() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Clinical Nutrition Coach powered by Google Gemini. How can I help optimize your diet or explain your health assessment today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', content: query };
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
        content: data.reply || "I couldn't generate a response at the moment."
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.response?.data?.detail || "Sorry, I encountered an issue connecting to Gemini. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="AI Nutrition Coach" subtitle="Powered by Google Gemini 2.0 Flash">
      <div className="flex flex-col h-[calc(100vh-210px)] sm:h-[calc(100vh-230px)] max-w-4xl mx-auto w-full overflow-x-hidden">

        {/* Disclaimer Pill */}
        <div className="glass-card px-3 sm:px-4 py-2 mb-3 sm:mb-4 flex items-center gap-2 border border-cyan-500/20 bg-cyan-500/5 text-[11px] sm:text-xs text-cyan-300">
          <ShieldCheck size={16} className="text-cyan-400 shrink-0" />
          <span className="leading-tight">
            Reads your active Health Profile & Assessment results to personalize recommendations.
          </span>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 glass-card mb-3 sm:mb-4 rounded-2xl custom-scrollbar">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl gradient-bg flex items-center justify-center text-white shrink-0 mt-1">
                  <Bot size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
              )}
              <div
                className={`p-3 sm:p-4 rounded-2xl max-w-[88%] sm:max-w-[80%] text-xs sm:text-sm leading-relaxed break-words ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none shadow-lg shadow-cyan-500/10'
                    : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-1">
                  <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 sm:gap-3 items-center text-gray-400 text-xs p-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl gradient-bg flex items-center justify-center text-white shrink-0">
                <Bot size={16} />
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-white/10">
                <Sparkles size={14} className="text-cyan-400 animate-spin" />
                <span>Thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts (Horizontal Scroll on Mobile) */}
        {messages.length < 3 && (
          <div className="flex flex-nowrap sm:flex-wrap gap-2 mb-2 sm:mb-3 overflow-x-auto custom-scrollbar pb-1">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-[11px] sm:text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
              >
                <Lightbulb size={12} className="text-amber-400 shrink-0" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="glass-card p-1.5 sm:p-2 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Nutritionist..."
            className="flex-1 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none min-w-0"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="p-2.5 sm:p-3 rounded-xl gradient-bg text-white disabled:opacity-50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all shrink-0 cursor-pointer"
          >
            <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
