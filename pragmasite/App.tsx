import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
import Comparison from './components/Comparison';
import UseCases from './components/UseCases';
import Technical from './components/Technical';
import Pricing from './components/Pricing';
import Footer from './components/Footer';

function App() {
  return (
    <div className="font-sans antialiased text-slate-900 selection:bg-indigo-500 selection:text-white bg-white">
      <Navbar />
      <main>
        <Hero />
        <Philosophy />
        <Comparison />
        <UseCases />
        <Technical />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}

export default App;