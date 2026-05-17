import React from 'react';
import { Modal } from './Modal';
import { AlertTriangleIcon } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true
}) {
  return <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className={`p-3 rounded-full mb-4 ${isDestructive ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'}`}>
          <AlertTriangleIcon size={24} />
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-6">{message}</p>
        <div className="flex w-full gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            {cancelText}
          </button>
          <button onClick={() => {
          onConfirm();
          onClose();
        }} className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${isDestructive ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>;
}
