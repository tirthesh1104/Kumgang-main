import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { CheckCircle2, X } from 'lucide-react';

export function NotificationToast() {
  const { notification, showNotification } = useApp();

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-5 right-5 z-50 bg-[#16593C] text-white px-4 py-3 rounded-xl shadow-xl border border-[#11452F] flex items-center gap-3 text-xs font-semibold"
        >
          <CheckCircle2 size={18} className="text-[#86EFAC]" />
          <span>{notification}</span>
          <button
            onClick={() => showNotification('')}
            className="ml-2 text-white/70 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
