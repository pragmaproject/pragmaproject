import React from 'react';
import FadeIn from './FadeIn';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const BentoGrid: React.FC = () => {
  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="mb-16">
           <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Technical Edge.</h2>
           <p className="text-slate-500 text-lg">Built for scale, privacy, and compliance.</p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Smart Contract Registry (Large) */}
          <FadeIn className="md:col-span-2">
            <Card className="h-full flex flex-col justify-between overflow-hidden relative group min-h-[320px]">
              <div className="relative z-10 max-w-lg">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-lg mb-6 shadow-lg shadow-slate-900/20">
                  <i className="fas fa-file-contract"></i>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Smart Contract Registry</h3>
                <p className="text-slate-500 leading-relaxed">
                  Proprietary <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono text-sm">ContentCert</code> contract. 
                  We don't just send empty transactions. We mint structured proofs that verify file integrity, timestamp, and ownership.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-5 translate-x-12 translate-y-12">
                 <i className="fas fa-fingerprint text-9xl"></i>
              </div>
            </Card>
          </FadeIn>

          {/* Card 2: AI Labeling */}
          <FadeIn delay="delay-100">
            <Card className="h-full flex flex-col justify-between min-h-[320px] bg-slate-50 border-slate-100">
              <div>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-lg mb-6">
                  <i className="fas fa-tags"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">AI Labeling</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  On-chain classification of content.
                </p>
                <div className="flex flex-col space-y-2">
                   <div className="flex items-center text-xs font-mono text-slate-400 bg-white px-3 py-2 rounded border border-slate-200">
                      <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span> type: "AI_GENERATED"
                   </div>
                   <div className="flex items-center text-xs font-mono text-slate-400 bg-white px-3 py-2 rounded border border-slate-200">
                      <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span> type: "HUMAN_VERIFIED"
                   </div>
                </div>
              </div>
            </Card>
          </FadeIn>

          {/* Card 3: Zero-Knowledge Privacy */}
          <FadeIn delay="delay-200">
            <Card className="h-full flex flex-col justify-between min-h-[320px]">
              <div>
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-lg mb-6">
                  <i className="fas fa-user-secret"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Zero-Knowledge</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We NEVER store original files. Only the cryptographic hash (SHA-256) is processed by our servers. Your secrets stay on your machine.
                </p>
              </div>
            </Card>
          </FadeIn>

          {/* Card 4: Chain Agnostic / Scalability */}
          <FadeIn delay="delay-300" className="md:col-span-2">
             <Card className="h-full flex flex-row items-center justify-between min-h-[240px] relative overflow-hidden">
                <div className="relative z-10 max-w-md">
                   <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-lg mb-6">
                    <i className="fas fa-layer-group"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Chain-Agnostic Scaling</h3>
                  <p className="text-slate-500 leading-relaxed">
                    Built for high volume. We use Merkle Tree batching to anchor thousands of files in a single L2 transaction, keeping costs negligible and throughput high.
                  </p>
                </div>
                <div className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2">
                   <div className="flex -space-x-4 opacity-50">
                      <div className="w-16 h-16 rounded-full bg-indigo-400 opacity-20 blur-xl"></div>
                      <div className="w-24 h-24 rounded-full bg-emerald-400 opacity-20 blur-xl"></div>
                   </div>
                </div>
             </Card>
          </FadeIn>

        </div>
      </div>
    </section>
  );
};

export default BentoGrid;