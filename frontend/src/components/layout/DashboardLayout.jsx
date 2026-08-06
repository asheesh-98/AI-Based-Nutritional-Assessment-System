import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, title, subtitle }) {
  return (
    <div className="h-screen w-full flex flex-col bg-[#f8f9fa] overflow-hidden selection:bg-blue-500/20 selection:text-[#0077ff] relative text-slate-900">
      
      {/* 🌟 Soft Ambient Background Mesh */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/4 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-emerald-500/4 rounded-full blur-[130px] pointer-events-none z-0" />

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
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <span>{title}</span>
                </h1>
              )}
              {subtitle && <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">{subtitle}</p>}
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
