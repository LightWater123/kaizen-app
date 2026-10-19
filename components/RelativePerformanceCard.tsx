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
    const isMale = userGender === 'male';
    const elite = isMale ? 500 : 400;
    const regional = isMale ? 400 : 325;
    const comp = isMale ? 300 : 250;
    const inter = isMale ? 200 : 150;

    if (score >= elite) return { title: 'Elite / National', color: 'text-amber-700 bg-amber-500/10 border-amber-500/30 dark:text-amber-400' };
    if (score >= regional) return { title: 'Excellent / Regional', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-300' };
    if (score >= comp) return { title: 'Advanced / Competitive', color: 'text-amber-700 bg-amber-500/10 border-amber-500/30 dark:text-amber-400' };
    if (score >= inter) return { title: 'Intermediate', color: 'text-amber-700 bg-amber-500/10 border-amber-500/30 dark:text-amber-400' };
    return { title: 'Novice', color: 'text-amber-700 bg-amber-500/10 border-amber-500/30 dark:text-amber-400' };
  };

  const tier = getScoreTier(dotsScore, gender);

  return (
    <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-white/10 rounded-2xl p-6 shadow-sm text-zinc-900 dark:text-zinc-50 transition-colors">
      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/80 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold tracking-tight">Relative Standing Engine</h3>
              
              {/* 1. WEIGHT CLASS INFO TOOLTIP */}
              <div className="group relative inline-block cursor-help">
                <svg 
                  className="w-3.5 h-3.5 text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                
                <div className="absolute left-0 top-6 hidden group-hover:block z-50 w-56 p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  <p className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-wider mb-2">
                    Official IPF Weight Classes
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 text-[11px] font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 block mb-0.5">MALE</span>
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
                      <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 block mb-0.5">FEMALE</span>
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
        <span className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
          {dotsScore}
        </span>
        <span className="text-xs font-bold text-amber-700 bg-amber-500/10 border border-amber-500/20 dark:text-amber-400 px-2 py-0.5 rounded-md uppercase tracking-widest">
          DOTS Points
        </span>
      </div>

      {/* RATING CLASSIFICATION BAR WITH NEW SCORE TIER TOOLTIP */}
      <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Coached Rating Classification:</span>
          
          {/* 2. SCORE TIER INFO TOOLTIP CONTAINER */}
          <div className="group relative inline-block cursor-help">
            <svg 
              className="w-3.5 h-3.5 text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            
            {/* TOOLTIP DROP PANEL */}
            <div className="absolute left-0 bottom-6 hidden group-hover:block z-50 w-80 p-3.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl">
              <p className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-wider mb-2.5">
                DOTS Classification Matrix
              </p>
              
              <div className="space-y-1.5 text-[11px] font-medium">
                {/* Table Header */}
                <div className="grid grid-cols-12 font-bold text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-1 text-[10px] uppercase tracking-wider">
                  <span className="col-span-6">Tier</span>
                  <span className="col-span-3 text-right">Men</span>
                  <span className="col-span-3 text-right">Women</span>
                </div>

                {/* Table Rows */}
                <div className="grid grid-cols-12 items-center text-amber-600 dark:text-amber-400 font-semibold py-0.5">
                  <span className="col-span-6 truncate">Elite / National</span>
                  <span className="col-span-3 text-right font-mono">500+</span>
                  <span className="col-span-3 text-right font-mono">400+</span>
                </div>

                <div className="grid grid-cols-12 items-center text-zinc-800 dark:text-zinc-200 py-0.5">
                  <span className="col-span-6 truncate">Excellent / Regional</span>
                  <span className="col-span-3 text-right font-mono text-[10.5px]">400–499</span>
                  <span className="col-span-3 text-right font-mono text-[10.5px]">325–399</span>
                </div>

                <div className="grid grid-cols-12 items-center text-zinc-800 dark:text-zinc-200 py-0.5">
                  <span className="col-span-6 truncate">Advanced / Competitive</span>
                  <span className="col-span-3 text-right font-mono text-[10.5px]">300–399</span>
                  <span className="col-span-3 text-right font-mono text-[10.5px]">250–324</span>
                </div>

                <div className="grid grid-cols-12 items-center text-zinc-600 dark:text-zinc-400 py-0.5">
                  <span className="col-span-6 truncate">Intermediate</span>
                  <span className="col-span-3 text-right font-mono text-[10.5px]">200–299</span>
                  <span className="col-span-3 text-right font-mono text-[10.5px]">150–249</span>
                </div>

                <div className="grid grid-cols-12 items-center text-zinc-400 dark:text-zinc-500 py-0.5">
                  <span className="col-span-6 truncate">Novice</span>
                  <span className="col-span-3 text-right font-mono">&lt; 200</span>
                  <span className="col-span-3 text-right font-mono">&lt; 150</span>
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