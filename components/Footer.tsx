
import React from 'react';
import FooterLogo from './FooterLogo.tsx';

const Footer: React.FC = () => {
  return (
    <footer role="contentinfo" className="border-t border-white/5 pt-12 pb-8 bg-zinc-950/95 mt-16 flex flex-col items-center w-full">
      <FooterLogo className="h-12 md:h-16 opacity-80" />
      <div className="max-w-4xl mx-auto px-8 mt-10 space-y-4 text-center">
        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">Disclaimer</h4>
        <p className="text-[10px] text-zinc-500 leading-relaxed opacity-70">
          AJ Sports merely links/embeds content uploaded to popular media hosting websites such Vimeo.com, Dailymotion.com, Youtube.com, twitch.tv, reddit.com, etc. AJSports does not host any audiovisual content itself and has no ability to modify such content. We thus cannot accept any liability for the content transmitted by others as we are not affiliated nor endorsed by the external content. All content is copyright of their respective owners.
        </p>
        <p className="text-[10px] text-zinc-500 leading-relaxed opacity-70">
          For business enquiries: info@ajsports.ch
        </p>
      </div>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-800 border-t border-white/5 pt-8 mt-8">
        © 2025 AJ Sports, Inc. All rights reserved
      </p>
    </footer>
  );
};

export default Footer;
