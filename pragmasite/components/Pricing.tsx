import React from 'react';
import FadeIn from './FadeIn';

const PricingCard: React.FC<{ 
  title: string; 
  price: string; 
  period?: string;
  description: string; 
  features: string[]; 
  primary?: boolean;
}> = ({ title, price, period = '', description, features, primary = false }) => (
  <div className={`rounded-3xl p-8 flex flex-col h-full ${primary ? 'bg-slate-900 text-white shadow-xl ring-1 ring-slate-900 scale-105 z-10' : 'bg-white text-slate-900 border border-slate-200 shadow-sm'}`}>
    <div className="mb-8">
      <h3 className={`text-lg font-bold mb-2 ${primary ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      <div className="flex items-baseline mb-4">
         <span className="text-4xl font-bold tracking-tight">{price}</span>
         {period && <span className={`ml-1 text-sm ${primary ? 'text-slate-400' : 'text-slate-500'}`}>{period}</span>}
      </div>
      <p className={`text-sm leading-relaxed ${primary ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
    </div>
    
    <div className="flex-grow">
      <ul className="space-y-4 mb-8">
        {features.map((feat, i) => (
          <li key={i} className="flex items-start">
            <i className={`fas fa-check mt-1 mr-3 text-xs ${primary ? 'text-indigo-400' : 'text-indigo-600'}`}></i>
            <span className={`text-sm ${primary ? 'text-slate-300' : 'text-slate-600'}`}>{feat}</span>
          </li>
        ))}
      </ul>
    </div>
    
    <button className={`w-full py-3 rounded-xl font-bold transition-colors text-sm ${primary ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200'}`}>
      {title === 'Enterprise' ? 'Contact Sales' : 'Start Building'}
    </button>
  </div>
);

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Predictable Pricing.</h2>
          <p className="text-slate-500 text-lg">Infrastructure that scales with your margin.</p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
          <FadeIn delay="delay-0">
            <PricingCard 
              title="Developer" 
              price="Free" 
              description="Cost of Acquisition. Perfect for testing and prototypes."
              features={[
                "50 requests / month",
                "Testnet Settlements",
                "API Keys",
                "Community Support"
              ]}
            />
          </FadeIn>

          <FadeIn delay="delay-100">
            <PricingCard 
              title="Startup" 
              price="€299" 
              period="/ mo"
              description="Value: Predictability. For production apps."
              features={[
                "5,000 requests / month",
                "Polygon Mainnet",
                "Permanent Storage",
                "Email Support"
              ]}
              primary
            />
          </FadeIn>
          
          <FadeIn delay="delay-200">
             <PricingCard 
              title="Scale" 
              price="€999" 
              period="/ mo"
              description="Value: Volume Optimization."
              features={[
                "25,000 requests / month",
                "Priority Queue",
                "Custom Metadata",
                "SLA 99.9%"
              ]}
            />
          </FadeIn>

          <FadeIn delay="delay-300">
            <PricingCard 
              title="Enterprise" 
              price="Custom" 
              description="Value: 99.9% Margin via L2 Batching."
              features={[
                "Unlimited Volume",
                "Dedicated L2 Rollup",
                "On-premise Options",
                "24/7 Phone Support"
              ]}
            />
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default Pricing;