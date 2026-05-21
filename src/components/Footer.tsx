import React from 'react';

interface FooterProps {
  setTab: (tab: 'home' | 'admin' | 'track') => void;
}

export default function Footer({ setTab }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTab('home');
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 pb-8 border-b border-slate-850">
          
          {/* Logo & Sourcing Statement */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={handleScrollToTop}>
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-base shadow-md">
                🦜
              </div>
              <h3 className="font-display font-extrabold text-[#f8fafc] text-lg sm:text-xl tracking-tight leading-none">
                Parrot <span className="text-emerald-400">India</span>
              </h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-md font-light">
              Registered with global aviary standardizing councils. All our birds are 100% captive raised, legally tagged, and DNA certified in full compliance with WPA rules and Parivesh regulatory standards within the Republic of India.
            </p>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-300">Quick Navigation</h4>
            <ul className="text-xs space-y-2.5 font-light">
              <li>
                <a href="#hero" onClick={handleScrollToTop} className="hover:text-emerald-400 transition-colors">
                  Home Banner
                </a>
              </li>
              <li>
                <a 
                  href="#parrots-section" 
                  onClick={(e) => {
                    e.preventDefault();
                    setTab('home');
                    document.getElementById('parrots-section')?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  Our Available Parrots
                </a>
              </li>
              <li>
                <a 
                  href="#testimonials-section" 
                  onClick={(e) => {
                    e.preventDefault();
                    setTab('home');
                    document.getElementById('testimonials-section')?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  Client Testimonials
                </a>
              </li>
              <li>
                <button 
                  onClick={() => setTab('admin')} 
                  className="hover:text-emerald-400 text-left transition-colors font-medium border-t border-slate-800/80 pt-2 block w-full text-slate-300"
                >
                  🛡️ Manage Aviary Console
                </button>
              </li>
            </ul>
          </div>

          {/* Official Location notes */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-300">Contact Aviary Sourcing</h4>
            <ul className="text-xs space-y-2.5 font-light">
              <li className="font-mono text-slate-300 font-semibold leading-relaxed">
                +91 98765 43210
              </li>
              <li className="leading-relaxed">
                Breeding Terminal 4-C, Sec-48,<br />
                Gurugram, NCR, Haryana, 122018
              </li>
              <li className="font-mono text-[10px] text-emerald-400 bg-emerald-900/10 border border-emerald-500/20 px-2 py-1 rounded inline-block">
                Registered Breeder RegNo: IND-9831
              </li>
            </ul>
          </div>

        </div>

        {/* Closing details */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-slate-500 text-center sm:text-left">
          <p>
            Parrot India © {currentYear}. Sourcing excellence, nurturing brilliance.
          </p>
          <p className="flex items-center gap-1">
            Handcrafted with 💚 in New Delhi
          </p>
        </div>

      </div>
    </footer>
  );
}
