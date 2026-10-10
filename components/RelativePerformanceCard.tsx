'use client'

import React from 'react'
import { calculateDots, getWeightDivision } from '@/utils/powerliftingMath'

interface RelativePerformanceCardProps {
  sbdTotal: number;
  currentBodyweight: number;
  gender: 'male' | 'female';
  unit: 'kg' | 'lbs';
}

export default function RelativePerformanceCard({ 
  sbdTotal, 
  currentBodyweight, 
  gender, 
  unit 
}: RelativePerformanceCardProps) {
  const dotsScore = calculateDots(sbdTotal, currentBodyweight, gender, unit);
  const divisionBadge = getWeightDivision(currentBodyweight, gender, unit);

  // Updated Classification Engine matching your exact benchmarks
  const getScoreTier = (score: number, userGender: 'male' | 'female') => {
    if (userGender === 'male') {
      if (score >= 500) return { title: 'Elite / National', color: 'text-purple-400 border-purple-500/30 bg-purple-500/5' };
      if (score >= 400) return { title: 'Excellent / Regional', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' };
      if (score >= 300) return { title: 'Advanced / Competitive', color: 'text-teal-400 border-teal-500/30 bg-teal-500/5' };
      if (score >= 200) return { title: 'Intermediate', color: 'text-blue-400 border-blue-500/30 bg-blue-500/5' };
      return { title: 'Novice', color: 'text-slate-400 border-slate-800 bg-slate-950' };
    } else {
      if (score >= 400) return { title: 'Elite / National', color: 'text-purple-400 border-purple-500/30 bg-purple-500/5' };
      if (score >= 325) return { title: 'Excellent / Regional', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' };
      if (score >= 250) return { title: 'Advanced / Competitive', color: 'text-teal-400 border-teal-500/30 bg-teal-500/5' };
      if (score >= 150) return { title: 'Intermediate', color: 'text-blue-400 border-blue-500/30 bg-blue-500/5' };
      return { title: 'Novice', color: 'text-slate-400 border-slate-800 bg-slate-950' };
    }
  };

  const tier = getScoreTier(dotsScore, gender);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-white">
      <div className="flex justify-between items-center border-b border-slate-800/60 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold tracking-tight">Relative Standing Engine</h3>
              
              {/* 1. WEIGHT CLASS INFO TOOLTIP */}
              <div className="group relative inline-block cursor-help">
                <svg 
                  className="w-3.5 h-3.5 text-slate-500 hover:text-blue-400 transition-colors" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                
                <div className="absolute left-0 top-6 hidden group-hover:block z-50 w-56 p-3 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  <p className="text-[10px] uppercase font-black text-blue-400 tracking-wider mb-2">
                    Official IPF Weight Classes
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 text-[11px] font-medium leading-relaxed text-slate-400">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-0.5">MALE🚹</span>
                      <p>u59kg Class</p>
                      <p>u66kg Class</p>
                      <p>u74kg Class</p>
                      <p>u83kg Class</p>
                      <p>u93kg Class</p>
                      <p>u105kg Class</p>
                      <p>u120kg Class</p>
                      <p>+120kg Class</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-0.5">FEMALE🚺</span>
                      <p>u47kg Class</p>
                      <p>u52kg Class</p>
                      <p>u57kg Class</p>
                      <p>u63kg Class</p>
                      <p>u69kg Class</p>
                      <p>u76kg Class</p>
                      <p>u84kg Class</p>
                      <p>+84kg Class</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">IPF-standard performance normalization matrix</p>
          </div>
        </div>
        
        {/* Grouped layout for current weight display alongside your weight class tier */}
        <div className="flex items-center gap-2">
          {/* <span className="text-[11px] font-bold text-slate-400 bg-slate-950 border border-slate-800/60 px-2.5 py-1 rounded-lg">
            Current: <span className="text-white">{currentBodyweight}{unit}</span>
          </span> */}
          
          <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg border ${tier.color}`}>
            {divisionBadge}
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
          {dotsScore}
        </span>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">DOTS Points</span>
      </div>

      {/* RATING CLASSIFICATION BAR WITH NEW SCORE TIER TOOLTIP */}
      <div className="mt-4 p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium">Coached Rating Classification:</span>
          
          {/* 2. SCORE TIER INFO TOOLTIP CONTAINER */}
          <div className="group relative inline-block cursor-help">
            <svg 
              className="w-3.5 h-3.5 text-slate-600 hover:text-blue-400 transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            
            {/* TOOLTIP DROP PANEL REFLECTING YOUR NEW SYSTEM */}
            <div className="absolute left-0 bottom-6 hidden group-hover:block z-50 w-72 p-3 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
              <p className="text-[10px] uppercase font-black text-blue-400 tracking-wider mb-2">
                DOTS Classification Matrix
              </p>
              <div className="text-[11px] font-medium text-slate-400 space-y-1">
                <div className="flex justify-between font-bold text-slate-500 border-b border-slate-900 pb-0.5 mb-1 text-[10px] uppercase">
                  <span>Tier</span>
                  <span>Men 🚹</span>
                  <span>Women 🚺</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>Elite / National</span>
                  <span>500+</span>
                  <span>400+</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Excellent / Regional</span>
                  <span>400 – 499</span>
                  <span>325 – 399</span>
                </div>
                <div className="flex justify-between text-teal-400">
                  <span>Advanced / Competitive</span>
                  <span>300 – 399</span>
                  <span>250 – 324</span>
                </div>
                <div className="flex justify-between text-blue-400">
                  <span>Intermediate</span>
                  <span>200 – 299</span>
                  <span>150 – 249</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Novice</span>
                  <span>&lt; 200</span>
                  <span>&lt; 150</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <span className={`text-xs font-bold ${tier.color.split(' ')[0]}`}>{tier.title}</span>
      </div>
    </div>
  );
}