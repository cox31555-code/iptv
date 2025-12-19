import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

/**
 * ConfirmDialogProvider - Manages confirmation dialogs
 */
export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    setIsLoading(false);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsLoading(true);
    if (resolver) {
      resolver(true);
      setResolver(null);
    }
    // Keep dialog open briefly to show loading state
    setTimeout(() => {
      setIsOpen(false);
      setIsLoading(false);
    }, 200);
  }, [resolver]);

  const handleCancel = useCallback(() => {
    if (resolver) {
      resolver(false);
      setResolver(null);
    }
    setIsOpen(false);
    setIsLoading(false);
  }, [resolver]);

  const getVariantStyles = () => {
    switch (options?.variant || 'danger') {
      case 'danger':
        return {
          icon: 'text-red-500',
          button: 'bg-red-500 hover:bg-red-600',
          border: 'border-red-500/20',
        };
      case 'warning':
        return {
          icon: 'text-yellow-500',
          button: 'bg-yellow-500 hover:bg-yellow-600',
          border: 'border-yellow-500/20',
        };
      case 'info':
        return {
          icon: 'text-blue-500',
          button: 'bg-blue-500 hover:bg-blue-600',
          border: 'border-blue-500/20',
        };
    }
  };

  if (!isOpen || !options) return <>{children}</>;

  const styles = getVariantStyles();

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}

      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        {/* Dialog */}
        <div className={`bg-[#1F2833] border ${styles.border} rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200`}>
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-[#0B0C10] rounded-xl ${styles.icon}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">{options.title}</h2>
            </div>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="text-white/40 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-white/70 text-sm leading-relaxed">{options.message}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/5">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50"
            >
              {options.cancelText || 'Cancel'}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-4 py-2.5 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${styles.button}`}
            >
              {isLoading ? 'Processing...' : (options.confirmText || 'Confirm')}
            </button>
          </div>
        </div>
      </div>
    </ConfirmDialogContext.Provider>
  );
};

/**
 * useConfirm hook - Access confirmation dialog
 */
export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmDialogProvider');
  }
  return context;
};
