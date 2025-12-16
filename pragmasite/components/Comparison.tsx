import React from 'react';
import FadeIn from './FadeIn';

const Comparison: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-slate-50 border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Don't sign manually. Notarize automatically.</h2>
          <p className="text-slate-500 text-lg">The shift from identity-based signing to integrity-based proof.</p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch">
          
          {/* Left: The Old Way */}
          <FadeIn className="h-full">
            <div className="h-full bg-white rounded-3xl p-8 md:p-12 border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <i className="fas fa-file-signature text-8xl text-slate-900"></i>
              </div>
              
              <div className="mb-8 flex items-center space-x-3 relative z-10">
                 <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-md text-xs font-bold uppercase tracking-wider">Legacy</span>
                 <h3 className="text-2xl font-bold text-slate-700">Digital Signature</h3>
              </div>
              
              <div className="space-y-8 relative z-10">
                <div className="border-l-2 border-slate-200 pl-6">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Focus</div>
                  <div className="text-lg font-medium text-slate-800">Identity (Who signed it)</div>
                </div>
                 <div className="border-l-2 border-slate-200 pl-6">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Method</div>
                  <div className="text-lg font-medium text-slate-800">Manual (Human + USB Key)</div>
                </div>
                 <div className="border-l-2 border-slate-200 pl-6">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Speed</div>
                  <div className="text-lg font-medium text-slate-800">Slow (Minutes/Hours)</div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right: The Pragma Way */}
          <FadeIn className="h-full" delay="delay-100">
            <div className="h-full bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-800 shadow-xl relative overflow-hidden group">
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-16 -mt-16 animate-pulse"></div>

              <div className="mb-8 flex items-center space-x-3 relative z-10">
                 <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-md text-xs font-bold uppercase tracking-wider border border-indigo-500/30">System</span>
                 <h3 className="text-2xl font-bold text-white">Pragma Protocol</h3>
              </div>
              
              <div className="space-y-8 relative z-10">
                <div className="border-l-2 border-indigo-500 pl-6">
                  <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">Focus</div>
                  <div className="text-lg font-medium text-white">Integrity (What happened & When)</div>
                </div>
                 <div className="border-l-2 border-indigo-500 pl-6">
                  <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">Method</div>
                  <div className="text-lg font-medium text-white">Automated (Machine-to-Machine)</div>
                </div>
                 <div className="border-l-2 border-indigo-500 pl-6">
                  <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">Speed</div>
                  <div className="text-lg font-medium text-white">Instant (&lt;200ms)</div>
                </div>
              </div>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
};

export default Comparison;