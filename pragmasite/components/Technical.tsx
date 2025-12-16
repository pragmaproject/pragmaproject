import React from 'react';
import FadeIn from './FadeIn';

const Technical: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-slate-50 border-y border-slate-200">
      <div className="max-w-5xl mx-auto text-center">
        <FadeIn>
           <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">System Architecture</h2>
           <div className="flex flex-col md:flex-row justify-center items-center md:space-x-12 space-y-8 md:space-y-0">
              
              <div className="flex items-center space-x-4">
                 <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                    <i className="fas fa-code-branch"></i>
                 </div>
                 <div className="text-left">
                    <div className="font-bold text-slate-900">Smart Contract</div>
                    <div className="text-xs text-slate-500">Proprietary Registry</div>
                 </div>
              </div>

              <div className="hidden md:block w-12 h-[1px] bg-slate-300"></div>

              <div className="flex items-center space-x-4">
                 <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                    <i className="fas fa-layer-group"></i>
                 </div>
                 <div className="text-left">
                    <div className="font-bold text-slate-900">L2 Scaling</div>
                    <div className="text-xs text-slate-500">Merkle Tree Batching</div>
                 </div>
              </div>

              <div className="hidden md:block w-12 h-[1px] bg-slate-300"></div>

              <div className="flex items-center space-x-4">
                 <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                    <i className="fas fa-bolt"></i>
                 </div>
                 <div className="text-left">
                    <div className="font-bold text-slate-900">Webhooks</div>
                    <div className="text-xs text-slate-500">Instant Confirmation</div>
                 </div>
              </div>

           </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default Technical;