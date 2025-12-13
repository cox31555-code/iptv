
import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Heart, Coins } from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const cryptoAddresses = {
    BTC: 'bc1qz3c5v3rzrfpkh7rn0phwu9l4fdx0cgg6gwcwfd',
    ETH: '0xC45E3204Af13c8433723B2938d30B6dd1Ea2A375'
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-500 ease-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop with extreme blur and dark tint */}
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-2xl transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Modal Content with Premium Animation */}
      <div 
        className={`relative w-full max-w-lg bg-[#0B0C10] border border-white/5 rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
          isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-90 opacity-0'
        }`}
      >
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />

        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2.5 text-zinc-600 hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10 sm:p-14 space-y-10">
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="relative">
              <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative p-5 bg-sky-500/10 rounded-[2rem] border border-sky-500/20">
                <Heart className="w-10 h-10 text-sky-500 fill-sky-500/20" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tighter text-white">Support us!</h2>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
                Your contributions keep the servers running and help us deliver the best streaming experience.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(cryptoAddresses).map(([symbol, address]) => (
              <div key={symbol} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
                    {symbol} Network
                  </label>
                </div>
                <div className="group relative flex items-center gap-4 bg-zinc-900/30 border border-white/5 p-5 rounded-[1.5rem] hover:border-white/10 hover:bg-zinc-900/50 transition-all">
                  <div className="p-2.5 bg-black rounded-xl border border-white/5">
                    <Coins className="w-4 h-4 text-zinc-500" />
                  </div>
                  <code className="flex-1 text-[11px] font-mono text-zinc-400 truncate tracking-tight">
                    {address}
                  </code>
                  <button 
                    onClick={() => copyToClipboard(address, symbol)}
                    className="p-2 text-zinc-500 hover:text-sky-400 transition-colors active:scale-90"
                  >
                    {copiedType === symbol ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                  {copiedType === symbol && (
                    <span className="absolute -top-10 right-0 bg-green-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full animate-in slide-in-from-bottom-2 duration-300">
                      Copied
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button 
              onClick={onClose}
              className="group relative w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-[1.5rem] transition-all hover:scale-[1.02] active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative">I've Donated</span>
            </button>
            <p className="text-center text-[10px] text-zinc-700 mt-4 font-bold uppercase tracking-widest">
              Tap to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonateModal;
