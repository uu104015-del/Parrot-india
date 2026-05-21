import React from 'react';
import { Parrot } from '../types';
import { ShoppingCart, ShieldCheck, Heart, Volume2 } from 'lucide-react';

interface ParrotCardProps {
  parrot: Parrot;
  onAddToBucket: (parrot: Parrot) => void;
  key?: string | number;
}

export default function ParrotCard({ parrot, onAddToBucket }: ParrotCardProps) {
  // Simple Indian Rupee formatter
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(parrot.price);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 overflow-hidden flex flex-col group relative">
      
      {/* Availability/DNA Tag */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500 text-white shadow-sm shadow-emerald-500/10">
          <ShieldCheck className="w-3.5 h-3.5" /> Hand-Raised
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-slate-900/80 backdrop-blur text-slate-100">
          DNA Certified
        </span>
      </div>

      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[4/3] bg-slate-50 flex-shrink-0">
        <img
          src={parrot.imageUrl}
          alt={parrot.species}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {!parrot.available && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-4 py-2 border border-rose-300 rounded-lg text-rose-300 font-display font-semibold tracking-wider text-sm uppercase">
              Sold Out / Booked
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
        
        <div className="space-y-2">
          {/* Category & Tag */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              {parrot.category}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-teal-600 font-medium">
              <Volume2 className="w-3.5 h-3.5" /> {parrot.talkativeLevel} Talker
            </span>
          </div>

          {/* Parrot Header */}
          <div>
            <h3 className="font-display font-bold text-slate-950 text-lg group-hover:text-emerald-700 transition-colors tracking-tight">
              {parrot.name} <span className="font-light text-slate-400 text-sm">({parrot.age})</span>
            </h3>
            <p className="font-mono text-xs text-slate-500 font-medium">{parrot.species}</p>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-light">
            {parrot.description}
          </p>
        </div>

        {/* Specs Pill list */}
        <div className="grid grid-cols-2 gap-2 pb-2">
          <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100 text-left">
            <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">Health Status</p>
            <p className="text-[10px] text-slate-700 font-medium truncate mt-0.5">{parrot.healthStatus}</p>
          </div>
          <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100 text-left">
            <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">Aviary Stage</p>
            <p className="text-[10px] text-slate-700 font-medium truncate mt-0.5">Captive Born</p>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4 mt-auto">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Price Contribution</p>
            <p className="font-mono font-bold text-slate-950 text-lg sm:text-xl leading-none mt-1">
              {formattedPrice}
            </p>
          </div>

          {parrot.available ? (
            <button
              onClick={() => onAddToBucket(parrot)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Bucket
            </button>
          ) : (
            <button
              disabled
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-semibold cursor-not-allowed border border-slate-200"
            >
              Unavailable
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
