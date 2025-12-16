import React from 'react';
import FadeIn from './FadeIn';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        
        <FadeIn delay="delay-100">
          <div className="inline-flex items-center space-x-2 bg-white border border-slate-200 rounded-full px-3 py-1 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">System Operational v2.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6 max-w-4xl">
            The Trust Layer <br /> for the AI Era.
          </h1>
        </FadeIn>

        <FadeIn delay="delay-200">
          <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            The Pragma System provides immutable notarization infrastructure. Automate IP protection, verify content integrity, and scale without blockchain complexity.
          </p>
        </FadeIn>

        <FadeIn delay="delay-300">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-20">
            <button className="bg-indigo-600 text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all transform active:scale-95 shadow-lg shadow-indigo-500/25 w-full sm:w-auto">
              Start Protecting Assets
            </button>
            <a href="#philosophy" className="group text-slate-700 font-medium px-8 py-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center w-full sm:w-auto justify-center shadow-sm">
              Discover the Philosophy
              <i className="fas fa-arrow-down ml-2 text-xs group-hover:translate-y-1 transition-transform text-slate-400"></i>
            </a>
          </div>
        </FadeIn>

        {/* Code Visual */}
        <FadeIn delay="delay-500" className="w-full max-w-3xl">
          <div className="bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden text-left border border-slate-800">
            <div className="flex items-center px-4 py-3 bg-[#252526] border-b border-white/5">
              <div className="flex space-x-2 mr-4">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              <div className="text-xs text-gray-500 font-mono">api_request.sh</div>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed">
<span className="text-[#569cd6]">curl</span> <span className="text-[#ce9178]">-X POST</span> https://api.pragma.so/v1/notarize \<br/>
  <span className="text-[#ce9178]">-H</span> <span className="text-[#ce9178]">"Authorization: Bearer sk_live_..."</span> \<br/>
  <span className="text-[#ce9178]">-d</span> <span className="text-[#ce9178]">{'{'}</span><br/>
    <span className="text-[#9cdcfe]">"file_hash"</span>: <span className="text-[#ce9178]">"8f434346648f6b96df89dda901c5176b10a6d..."</span>,<br/>
    <span className="text-[#9cdcfe]">"metadata"</span>: <span className="text-[#ce9178]">{'{'}</span><br/>
       <span className="text-[#9cdcfe]">"author"</span>: <span className="text-[#ce9178]">"Creator_ID_99"</span>,<br/>
       <span className="text-[#9cdcfe]">"license"</span>: <span className="text-[#ce9178]">"Copyright_2025"</span><br/>
    <span className="text-[#ce9178]">{'}'}</span><br/>
  <span className="text-[#ce9178]">{'}'}</span>
              </pre>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 px-4 text-xs font-mono text-slate-400">
             <span>PROTOCOL: <span className="text-emerald-500">ACTIVE</span></span>
             <span>LATENCY: <span className="text-slate-600">48ms</span></span>
          </div>
        </FadeIn>

      </div>
    </section>
  );
};

export default Hero;