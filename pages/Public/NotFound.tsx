import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar.tsx';
import Footer from '../../components/Footer.tsx';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-sky-500/30 overflow-x-hidden">
      <Navbar onSearch={() => {}} />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative pt-12 pb-24">
        {/* Cinematic Background Layer - Static and Muted */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Base Image with Heavy Bokeh Blur */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop")',
              filter: 'blur(60px) brightness(0.5)'
            }} 
          />
          
          {/* Deep Vignette for focus */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_75%,black_100%)]" />
          
          {/* Static Soft Light Leaks */}
          <div className="absolute top-1/4 -left-1/4 w-[70%] h-[70%] bg-sky-500/5 blur-[180px] rounded-full" />
          <div className="absolute bottom-1/4 -right-1/4 w-[50%] h-[50%] bg-cyan-500/[0.03] blur-[160px] rounded-full" />
        </div>

        <div className="relative z-20 w-full max-w-4xl text-center space-y-16 md:space-y-24">
          
          {/* Hero Scoreboard 404 */}
          <div className="relative inline-block animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <h1 className="text-[120px] md:text-[260px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/5 select-none italic opacity-5">
              404
            </h1>
            <div className="absolute inset-0 flex flex-col items-center justify-center -space-y-2 md:-space-y-4">
               <span className="text-[9px] md:text-xs font-black uppercase tracking-[0.6em] text-sky-500/60 mb-2">Signal Interrupted</span>
               <h2 className="text-4xl md:text-8xl font-black italic tracking-tighter uppercase text-white drop-shadow-2xl">
                 Offside
               </h2>
            </div>
          </div>
          
          {/* Messaging Block */}
          <div className="space-y-8 max-w-xl mx-auto animate-in fade-in zoom-in duration-700 delay-200">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <p className="text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase text-white">
                  Match Abandoned
                </p>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-transparent" />
              </div>
              
              <p className="text-white text-xs md:text-sm font-medium leading-relaxed px-6 opacity-90">
                The play you're looking for isn't in our current broadcast. <br className="hidden md:block" />
                Return to the main feed to catch the action.
              </p>
            </div>

            <div className="pt-4">
               <button 
                 onClick={() => window.history.back()}
                 className="group relative flex items-center gap-3 mx-auto text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-white transition-all py-4 px-12 rounded-full border border-white/10 hover:border-sky-500/40 hover:bg-sky-500/5 bg-white/[0.02] backdrop-blur-md shadow-2xl"
               >
                 <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-sky-500" />
                 Go Back
                 <div className="absolute inset-0 rounded-full bg-sky-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
               </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;