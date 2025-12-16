import React, { useState } from 'react';
import FadeIn from './FadeIn';

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 last:border-0">
      <button 
        className="w-full py-6 flex justify-between items-center text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-slate-900 pr-8">{question}</span>
        <span className={`transform transition-transform duration-200 text-slate-400 ${isOpen ? 'rotate-180' : ''}`}>
          <i className="fas fa-chevron-down"></i>
        </span>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-slate-500 leading-relaxed text-sm pr-8">
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <FadeIn className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
        </FadeIn>

        <FadeIn delay="delay-100">
          <div className="space-y-1">
            <FAQItem 
              question="Why use Blockchain instead of a Database?" 
              answer="Databases are centralized and mutable. An admin can change a date record. Blockchain provides a decentralized, trustless, and immutable timestamp that holds up as forensic evidence in court." 
            />
            <FAQItem 
              question="What if Pragma shuts down?" 
              answer="Your data remains verifiable. The proof is anchored on the public Polygon/Ethereum blockchain, independent of our servers. We provide a standalone open-source verification tool so you have no vendor lock-in." 
            />
             <FAQItem 
              question="How do you compare to competitors like Notarify?" 
              answer="Most competitors offer a SaaS interface for manual uploads. Pragma is an API-first Infrastructure (Middleware) designed for developers to integrate trust directly into their software workflows automatically." 
            />
             <FAQItem 
              question="Is it expensive?" 
              answer="No. We use Merkle Tree batching (Rollups) to aggregate thousands of proofs into single blockchain transactions. This allows us to keep per-request costs negligible (<$0.01) while maintaining high margins." 
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default FAQ;