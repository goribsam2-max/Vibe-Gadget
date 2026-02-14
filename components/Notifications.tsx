
import React, { useState, createContext, useContext } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ConfirmOptions {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface ToastContextType {
  notify: (message: string, type?: ToastType) => void;
  confirm: (options: ConfirmOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmOptions | null>(null);

  const notify = (message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const confirm = (options: ConfirmOptions) => {
    setConfirmModal(options);
  };

  return (
    <ToastContext.Provider value={{ notify, confirm }}>
      {children}
      
      {/* Toasts */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-[90%] md:max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between min-w-[300px] animate-fade-in 
              ${toast.type === 'success' ? 'bg-black border border-white/20' : toast.type === 'error' ? 'bg-red-600' : 'bg-[#1F2029]'} 
              text-white transition-all`}
          >
            <p className="font-bold text-sm">{toast.message}</p>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-4 opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-8 animate-fade-in">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl border border-white/20 text-center">
            <div className="w-16 h-16 bg-f-gray rounded-3xl flex items-center justify-center mx-auto mb-6">
               <i className="fas fa-question text-2xl text-black"></i>
            </div>
            <h3 className="text-xl font-bold mb-2 tracking-tight">{confirmModal.title}</h3>
            <p className="text-[11px] text-f-gray font-medium leading-relaxed mb-8 px-2">{confirmModal.message}</p>
            <div className="space-y-3">
              <button 
                onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
                className="w-full py-4 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-widest active:scale-[0.98] shadow-xl shadow-black/10"
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
              <button 
                onClick={() => { if(confirmModal.onCancel) confirmModal.onCancel(); setConfirmModal(null); }}
                className="w-full py-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest active:scale-[0.98]"
              >
                {confirmModal.cancelText || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useNotify = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useNotify must be used within ToastProvider");
  return context.notify;
};

export const useConfirm = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useConfirm must be used within ToastProvider");
  return context.confirm;
};
