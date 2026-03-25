import { AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

/** Animated confirmation dialog — spring-based enter/exit with dark mode support */
export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="relative max-w-sm w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 text-center"
          >
            {/* Warning icon with delayed spring animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
              className="w-14 h-14 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <AlertTriangle size={26} className="text-red-500" strokeWidth={2} />
            </motion.div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-red-500/20 cursor-pointer disabled:opacity-50 transition-all hover:from-red-700 hover:to-rose-700"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Đang xóa...
                  </span>
                ) : 'Xác nhận'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
