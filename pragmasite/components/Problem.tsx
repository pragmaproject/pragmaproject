import React from 'react';
import FadeIn from './FadeIn';

const Problem: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-slate-50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="mb-16 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Why Now? The Trust Gap.</h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            In an age of deepfakes, document fraud, and generative AI, distinguishing real from fake is the hardest problem on the internet.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Context */}
          <FadeIn delay="delay-100" className="h-full">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 mb-6">
                <i className="fas fa-exclamation-triangle text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">The Problem</h3>
              <p className="text-slate-500 leading-relaxed">
                Traditional files have no provenance. Anyone can edit metadata, fake a timestamp, or clone a voice. Trust is collapsing.
              </p>
            </div>
          </FadeIn>

          {/* Legacy Tech */}
          <FadeIn delay="delay-200" className="h-full">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 mb-6">
                <i className="fas fa-history text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Legacy Tech</h3>
              <p className="text-slate-500 leading-relaxed">
                Digital Signatures (DocuSign) and TSA (Timestamping) are manual, expensive, and rely on centralized servers that can be hacked.
              </p>
            </div>
          </FadeIn>

          {/* Solution */}
          <FadeIn delay="delay-300" className="h-full">
            <div className="bg-indigo-600 p-8 rounded-2xl border border-indigo-500 shadow-lg shadow-indigo-200 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-6 backdrop-blur-sm">
                <i className="fas fa-check text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">The Solution</h3>
              <p className="text-indigo-100 leading-relaxed">
                Pragma provides mathematical, trustless proof of existence via API. We anchor the fingerprint of your data to the Blockchain.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default Problem;