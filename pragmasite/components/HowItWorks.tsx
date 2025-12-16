import React from 'react';
import FadeIn from './FadeIn';

const Step: React.FC<{ num: string; title: string; desc: string; icon: string }> = ({ num, title, desc, icon }) => (
  <div className="flex flex-col items-center text-center relative z-10 px-4">
    <div className="w-16 h-16 bg-white rounded-2xl shadow-soft flex items-center justify-center text-2xl text-apple-text mb-6 border border-gray-100">
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="mb-2 text-xs font-bold text-apple-accent uppercase tracking-widest">Step {num}</div>
    <h3 className="text-xl font-semibold text-apple-text mb-2">{title}</h3>
    <p className="text-gray-500 font-light text-sm leading-relaxed">{desc}</p>
  </div>
);

const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-apple-text mb-6">Proof in 4 steps.</h2>
          <p className="text-gray-500 text-lg">Seamless integration into your existing data pipeline.</p>
        </FadeIn>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4">
          {/* Connector Line (Desktop only) */}
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 z-0"></div>

          <FadeIn delay="delay-100">
            <Step 
              num="01" 
              title="Your File" 
              desc="Any digital asset: JSON, PDF, Image, or Model Weights." 
              icon="fa-file-alt" 
            />
          </FadeIn>
          
          <FadeIn delay="delay-200">
            <Step 
              num="02" 
              title="Pragma API" 
              desc="We generate a cryptographic hash locally (Client-side)." 
              icon="fa-cogs" 
            />
          </FadeIn>

          <FadeIn delay="delay-300">
            <Step 
              num="03" 
              title="Polygon" 
              desc="Hash is anchored to the Polygon Blockchain forever." 
              icon="fa-cubes" 
            />
          </FadeIn>

          <FadeIn delay="delay-400">
            <Step 
              num="04" 
              title="Certificate" 
              desc="Instant PDF Proof with Etherscan verification link." 
              icon="fa-certificate" 
            />
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;