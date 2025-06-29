"use client";

import type { NextPage } from "next";
import React, { useState, useEffect } from 'react';

interface Milestone {
  left: string;
  date: string;
  label: string;
  details: string;
}

const milestones: Milestone[] = [
  { left: '10%', date: 'Q3 2025', label: 'Pilot Launch', details: 'Launch pilot phase to validate core functionalities.' },
  { left: '30%', date: 'Q4 2025', label: 'Full Integration', details: 'Integrate all Chainlink modules and Eliza agents.' },
  { left: '55%', date: 'Q1 2026', label: 'Native CCIP Bridge', details: 'Deploy native bridge using Chainlink CCIP.' },
  { left: '80%', date: 'Q2 2026', label: 'Agent Expansion', details: 'Scale AI agents for broader data coverage.' },
];

const Home: NextPage = () => {
  const chainlinkLogoUrl: string = 'https://altcoinsbox.com/wp-content/uploads/2023/10/full-chainlink-logo.png';
  const [navBg, setNavBg] = useState<string>('bg-transparent');
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = (): void => {
      const offset = window.scrollY;
      if (offset > 50) setNavBg('bg-black bg-opacity-50 backdrop-filter backdrop-blur-md');
      else setNavBg('bg-transparent');
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-800 to-indigo-900 text-white p-6"
      style={{ scrollBehavior: 'smooth' }}
    >


      {/* Spacer for sticky nav */}
      <div className="h-16" />

      {/* Header with slogan */}
      <header
        id="vision"
        className="bg-indigo-700 rounded-xl py-12 text-center shadow-xl"
      >
        <h1 className="text-5xl font-extrabold">RWA MultiChain Infrastructure</h1>
        <p className="text-xl mt-4">
          Integrating Real-World Assets Seamlessly with AI & Blockchain
        </p>
        <p className="text-indigo-300 italic mt-2">Built by Chainlink</p>
      </header>

      {/* Our Vision Section */}
      <section className="bg-gradient-to-r from-indigo-800 to-gray-800 mt-8 rounded-xl overflow-hidden shadow-lg">
        <div className="md:flex items-center">
          <div className="md:w-1/3 p-6 flex justify-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/7364/7364291.png"
              alt="Vision Illustration"
              className="rounded-full w-48 h-48 ring-4 ring-indigo-500 filter brightness-150"
              style={{ filter: 'brightness(1.5)' }}
            />
          </div>
          <div className="md:w-2/3 p-6">
            <h2 className="text-4xl font-bold text-white mb-4">Our Vision</h2>
            <p className="text-gray-300 leading-relaxed">
              We envision a world where Real-World Asset (RWA) tokens are powered by intelligent AI Oracles and seamless multi-chain bridges, ensuring real-time trust, transparency, and adaptability across decentralized ecosystems.
            </p>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section
        id="roadmap"
        className="bg-gradient-to-r from-gray-800 to-gray-900 mt-12 rounded-xl p-8 shadow-lg relative overflow-hidden"
      >
        <h2 className="text-3xl font-semibold text-indigo-400 text-center mb-8">Roadmap</h2>
        <div className="relative w-full h-72">
          {/* Curved path */}
          <svg
            viewBox="0 0 1000 200"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <linearGradient id="roadmapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
            <path
              d="M0,120 C200,40 300,200 500,120 C700,40 800,200 1000,120"
              fill="none"
              stroke="url(#roadmapGradient)"
              strokeWidth={6}
            />
          </svg>
          {/* Milestones */}
          {milestones.map((milestone, idx) => (
            <div
              key={idx}
              className="absolute"
              style={{ left: milestone.left, top: idx % 2 === 0 ? '20%' : '55%' }}
            >
              <div className="bg-gray-800 bg-opacity-80 p-3 rounded-lg shadow-lg w-40 text-center transform -translate-x-1/2 hover:scale-105 transition-transform">
                <p className="text-indigo-300 font-bold">{milestone.date}</p>
                <p className="text-gray-300 text-sm">{milestone.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem Statement Section */}
      <section
        id="problem"
        className="bg-gray-900 mt-12 rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-3xl font-semibold text-indigo-400 text-center mb-6">What Problem Are We Solving?</h2>
        <p className="text-center text-gray-300 max-w-2xl mx-auto">
          Real-World Asset (RWA) tokens struggle with fragmented data sources, low transparency, and high operational costs due to manual data verification and limited cross-chain connectivity. Our solution leverages AI-driven Oracles and automated multi-chain bridges to deliver real-time, secure, and cost-effective asset data, unlocking seamless interoperability and trust across decentralized networks.
        </p>
      </section>

      {/* Future of RWAs Section */}
      <section
        id="future"
        className="bg-gradient-to-r from-indigo-900 via-gray-800 to-indigo-900 mt-12 rounded-xl p-8 shadow-2xl overflow-hidden"
      >
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-indigo-300 mb-4">The Future of RWAs</h2>
          <p className="max-w-3xl mx-auto text-lg text-gray-200 leading-relaxed mb-6">
            Imagine a world where Real-World Assets evolve in real time: where tokenized property, commodities, and securities adjust their value and governance automatically based on live economic data, environmental metrics, and community-driven inputs. Powered by Chainlink’s AI Oracles and seamless multi-chain bridges, RWAs will become:
          </p>
          <ul className="max-w-2xl mx-auto text-left grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <li className="flex items-start"><span className="text-indigo-400 mr-3">•</span><span className="text-gray-200">Adaptive and responsive to global market changes in real time.</span></li>
            <li className="flex items-start"><span className="text-indigo-400 mr-3">•</span><span className="text-gray-200">Governed by transparent, decentralized protocols with automated compliance checks.</span></li>
            <li className="flex items-start"><span className="text-indigo-400 mr-3">•</span><span className="text-gray-200">Seamlessly transferable across blockchains, unlocking new liquidity pools.</span></li>
            <li className="flex items-start"><span className="text-indigo-400 mr-3">•</span><span className="text-gray-200">Empowered by AI-driven insights to forecast risks and opportunities.</span></li>
          </ul>
        </div>
      </section>

      {/* Footer with Core Technologies and Logo */}
      <footer id="footer" className="mt-16 text-center">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-indigo-400 mb-4">Core Technologies</h2>
          <div className="flex flex-wrap justify-center gap-6 w-full mb-6">
            {[
              { title: 'Eliza', desc: 'AI framework for intelligent agents', icon: 'https://cdn-icons-png.flaticon.com/512/835/835500.png' },
              { title: 'Chainlink Functions', desc: 'Off-chain data integration', icon: 'https://cdn-icons-png.flaticon.com/512/2659/2659980.png' },
              { title: 'Chainlink Automation', desc: 'Scheduled oracle updates', icon: 'https://cdn-icons-png.flaticon.com/512/2331/2331654.png' },
              { title: 'Chainlink CCIP', desc: 'Secure multi-chain bridges', icon: 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png' },
            ].map((tech, i) => (
              <div key={i} className="bg-gray-700 p-4 rounded-lg shadow-lg w-52 flex flex-col items-center">
                <div className="bg-indigo-600 p-3 rounded-full mb-3">
                  <img src={tech.icon} alt={`${tech.title} icon`} className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-indigo-200 mb-1">{tech.title}</h3>
                <p className="text-gray-300 text-sm text-center">{tech.desc}</p>
              </div>
            ))}
          </div>
          <img
            src={chainlinkLogoUrl}
            alt="Chainlink Logo"
            className="w-32 opacity-50 filter brightness-0 invert"
          />
        </div>
        <p className="mt-6 text-gray-500">© 2025 RWA Project. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
