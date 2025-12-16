import React from 'react';
import FadeIn from './FadeIn';

const UseCaseCard: React.FC<{ title: string; subtitle: string; desc: string; icon: string }> = ({ title, subtitle, desc, icon }) => (
  <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-indigo-100 hover:shadow-glow transition-all duration-300 group">
    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 text-xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">{subtitle}</div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

const UseCases: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Revenue Protection.</h2>
          <p className="text-slate-500 text-lg">Pragma is the infrastructure that protects economic value.</p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FadeIn delay="delay-100">
            <UseCaseCard 
              subtitle="Creator Economy"
              title="Anti-Leak & Piracy" 
              desc="For platforms like OnlyFans and Patreon. Prove original ownership instantly to issue DMCA takedowns and protect creator revenue."
              icon="fa-copyright"
            />
          </FadeIn>
          
          <FadeIn delay="delay-200">
            <UseCaseCard 
              subtitle="Compliance"
              title="AI Labeling" 
              desc="Certify content as 'Human', 'AI', or 'Mixed'. Create an immutable audit trail for regulatory compliance (AI Act)."
              icon="fa-robot"
            />
          </FadeIn>

          <FadeIn delay="delay-300">
            <UseCaseCard 
              subtitle="Legal Tech"
              title="Forensic Proof" 
              desc="Automated evidence generation for lawyers and courts. Establish an indisputable timeline of events without manual notary costs."
              icon="fa-gavel"
            />
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default UseCases;