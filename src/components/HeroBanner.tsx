import { Leaf, ArrowRight, Star, Heart, Award } from 'lucide-react';
import heroBannerImage from '../assets/images/hero_banner_parrots_1779307388406.png';

interface HeroBannerProps {
  onExploreClick: () => void;
}

export default function HeroBanner({ onExploreClick }: HeroBannerProps) {
  return (
    <section id="hero" className="relative overflow-hidden bg-slate-900 py-16 sm:py-24 lg:py-32">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-tr from-teal-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Main Copy */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4 sm:mb-6 animate-pulse">
                <Leaf className="w-3.5 h-3.5" /> India's Most Trusted Parrot Aviary
              </span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Find & Buy Your <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Perfect Parrot Online
                </span>
              </h2>
            </div>

            <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-300 font-light leading-relaxed">
              Welcome to Parrot India. We are India's most trusted online store for healthy, beautiful, and hand-raised parrots. Choose from top categories and bring your new talking companion home safely.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-semibold text-white rounded-xl shadow-lg shadow-emerald-900/30 hover:shadow-xl hover:shadow-emerald-900/40 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer text-sm"
              >
                Explore Current Availability
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <a
                href="#contact-section"
                className="w-full sm:w-auto text-center px-8 py-4 bg-slate-800/80 hover:bg-slate-850 font-semibold text-slate-200 hover:text-white rounded-xl border border-slate-700/60 transition-colors text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Talk to Bird Expert
              </a>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 border-t border-slate-800 flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-slate-400 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                <span>100% Healthy & Certified Birds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                <span>Hand-Raised & Friendly Parrots</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                <span>Safe Home Delivery & Expert Support</span>
              </div>
            </div>

          </div>

          {/* Hero Banner Image */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-transparent lg:hidden z-10 pointer-events-none" />
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-20 blur-xl pointer-events-none" />
            <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 shadow-2xl">
              <img
                src={heroBannerImage}
                alt="Beautiful Parrots in Sanctuary"
                referrerPolicy="no-referrer"
                className="w-full h-[300px] sm:h-[400px] lg:h-[450px] object-cover hover:scale-105 transition-transform duration-700"
              />
              {/* Overlay Glass Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/85 backdrop-blur-md border border-slate-700/50 py-3.5 px-4.5 rounded-xl flex items-center justify-between pointer-events-none">
                <div>
                  <h4 className="text-white text-sm font-semibold tracking-tight">Vibrant Feathers & Rich Minds</h4>
                  <p className="text-slate-400 text-[11px] font-mono mt-0.5">Captive-Bred Legally in India</p>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-mono text-xs font-bold bg-emerald-500/15 py-1 px-2.5 rounded-full border border-emerald-500/20">
                    ★ 4.9/5 Aviary Rating
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
