import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, title, subtitle }) {
  return (
    <div className="h-screen w-full flex flex-col bg-[#0b1329] overflow-hidden selection:bg-cyan-500/30 selection:text-white relative">
      
      {/* 🌟 Ambient Vibrant Background Glows & Image Overlay */}
      <div className="absolute inset-0 bg-[url('/assets/wellness_bg.jpg')] bg-cover bg-center opacity-[0.08] mix-blend-overlay pointer-events-none z-0" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-10 w-[550px] h-[550px] bg-purple-500/15 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none z-0" />

      <Navbar />
      
      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full scroll-smooth custom-scrollbar">
          {(title || subtitle) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 sm:mb-8"
            >
              {title && (
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-200">
                    {title}
                  </span>
                </h1>
              )}
              {subtitle && <p className="text-sm sm:text-base text-cyan-300/80 font-medium mt-1">{subtitle}</p>}
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pb-16"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
