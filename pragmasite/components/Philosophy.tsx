import React from 'react';
import FadeIn from './FadeIn';

const PhilosophyCard: React.FC<{ title: string; desc: string; icon: string }> = ({ title, desc, icon }) => (
  <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-soft h-full flex flex-col items-start hover:shadow-lg transition-shadow duration-300">
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl mb-8 border border-slate-100">
      <i className={`fas ${icon}`}></i>
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
    <p className="text-slate-500 leading-relaxed font-light">{desc}</p>
  </div>
);

const Philosophy: React.FC = () => {
  return (
    <section id="philosophy" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="mb-16 max-w-2xl">
          <span className="text-indigo-600 font-bold tracking-wider uppercase text-xs mb-2 block">Our DNA</span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">The Pragma Philosophy.</h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            The difference between a simple API and a complete Trust System.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FadeIn delay="delay-100">
            <PhilosophyCard 
              title="Radical Simplicity" 
              desc="All the power of Blockchain, without the complexity. No wallets to manage, no gas fees to calculate, no smart contracts to deploy."
              icon="fa-layer-group"
            />
          </FadeIn>
          
          <FadeIn delay="delay-200">
            <PhilosophyCard 
              title="Zero-Data Privacy" 
              desc="Your files NEVER leave your servers. We only process the cryptographic fingerprint (Hash). Absolute privacy by design."
              icon="fa-shield-halved"
            />
          </FadeIn>

          <FadeIn delay="delay-300">
            <PhilosophyCard 
              title="Price is Value" 
              desc="Our pricing reflects the immutable legal guarantee we provide, not the fluctuating cost of gas. Predictable, high-margin infrastructure."
              icon="fa-coins"
            />
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;