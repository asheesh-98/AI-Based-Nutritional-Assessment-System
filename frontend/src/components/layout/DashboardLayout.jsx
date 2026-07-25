import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, title, subtitle }) {
  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0e1a] overflow-hidden selection:bg-cyan-500/30 selection:text-white">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full scroll-smooth">
          {(title || subtitle) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              {title && <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h1>}
              {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pb-12"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
