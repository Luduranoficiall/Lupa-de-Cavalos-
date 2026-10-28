import React from 'react';
import { Download, Heart, Gamepad2, FileText, Wrench, Sparkles, BookOpen, Globe } from 'lucide-react';

interface GodotHeaderProps {
  currentTab: 'game' | 'article' | 'editor' | 'ai' | 'docs';
  onSelectTab: (tab: 'game' | 'article' | 'editor' | 'ai' | 'docs') => void;
  lang: 'pt' | 'en';
  onToggleLang: () => void;
}

export const GodotHeader: React.FC<GodotHeaderProps> = ({
  currentTab,
  onSelectTab,
  lang,
  onToggleLang,
}) => {
  return (
    <header className="bg-[#202531] border-b border-[#2d3446] text-[#e0e1e5] sticky top-0 z-50 shadow-md">
      {/* Top Godot official brand bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onSelectTab('article')}
              className="flex items-center gap-3 group focus:outline-none cursor-pointer"
            >
              {/* Official Godot Engine Vector Mascot */}
              <div className="w-10 h-10 rounded-lg bg-[#478cbf] p-1.5 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 64 64" className="w-full h-full fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M32 4C16.5 4 4 16.5 4 32c0 6.6 2.3 12.7 6.1 17.5L8 56l9-2.3C21.4 57.6 26.5 60 32 60c15.5 0 28-12.5 28-28S47.5 4 32 4z" />
                  <circle cx="21" cy="30" r="5" fill="#202531" />
                  <circle cx="43" cy="30" r="5" fill="#202531" />
                  <circle cx="22" cy="29" r="2" fill="#fff" />
                  <circle cx="44" cy="29" r="2" fill="#fff" />
                  <path d="M26 44h12" stroke="#202531" strokeWidth="4" strokeLinecap="round" />
                  {/* Robot gear teeth */}
                  <rect x="29" y="1" width="6" height="5" rx="1" fill="#478cbf" />
                  <rect x="11" y="9" width="6" height="5" rx="1" transform="rotate(-35 14 11.5)" fill="#478cbf" />
                  <rect x="47" y="9" width="6" height="5" rx="1" transform="rotate(35 50 11.5)" fill="#478cbf" />
                </svg>
              </div>

              <div className="text-left">
                <span className="font-extrabold text-lg tracking-tight text-white block leading-none">
                  Godot Engine
                </span>
                <span className="text-[11px] font-mono text-[#478cbf] uppercase tracking-wider block mt-0.5">
                  v4.7.2 Manutenção
                </span>
              </div>
            </button>

            {/* Official Godot Links */}
            <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-gray-300 ml-6">
              <span className="hover:text-white cursor-pointer transition">
                {lang === 'pt' ? 'Características' : 'Features'}
              </span>
              <span className="hover:text-white cursor-pointer transition">
                {lang === 'pt' ? 'Vitrine' : 'Showcase'}
              </span>
              <span className="text-[#478cbf] font-bold cursor-pointer transition">
                Blog
              </span>
              <span className="hover:text-white cursor-pointer transition">
                {lang === 'pt' ? 'Comunidade' : 'Community'}
              </span>
              <span className="hover:text-white cursor-pointer transition">
                {lang === 'pt' ? 'Ativos' : 'Assets'}
              </span>
              <span className="hover:text-white cursor-pointer transition">
                {lang === 'pt' ? 'Documentos' : 'Documentation'}
              </span>
              <span className="hover:text-white cursor-pointer transition">
                {lang === 'pt' ? 'Contribuir' : 'Contribute'}
              </span>
            </nav>
          </div>

          {/* Right Header Utilities: Donate, Language, Download */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-gray-300 hover:text-white bg-[#191d26] rounded border border-gray-700 hover:border-gray-600 transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#478cbf]" />
              {lang === 'pt' ? 'PT-BR' : 'EN-US'}
            </button>

            <button
              onClick={() => onSelectTab('article')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 rounded border border-rose-500/30 transition cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              {lang === 'pt' ? 'Doar' : 'Donate'}
            </button>

            <button
              onClick={() => onSelectTab('article')}
              className="flex items-center gap-2 px-4 py-2 bg-[#478cbf] hover:bg-[#559fd9] text-white text-xs sm:text-sm font-bold rounded shadow transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download 4.7.2</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main App Navigation Tabs */}
      <div className="bg-[#191d26] border-t border-[#262c3a] px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2">
          <button
            onClick={() => onSelectTab('game')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
              currentTab === 'game'
                ? 'bg-[#478cbf] text-white shadow'
                : 'text-gray-300 hover:text-white hover:bg-[#202531]'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-amber-300" />
            <span>{lang === 'pt' ? 'Jogar: Lupa de Cavalos' : 'Play: Horse Magnifier'}</span>
            <span className="text-[10px] bg-amber-400 text-black font-extrabold px-1.5 py-0.5 rounded ml-1">
              JOGO
            </span>
          </button>

          <button
            onClick={() => onSelectTab('article')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
              currentTab === 'article'
                ? 'bg-[#478cbf] text-white shadow'
                : 'text-gray-300 hover:text-white hover:bg-[#202531]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{lang === 'pt' ? 'Artigo 4.7.2 & Changelog' : '4.7.2 Release & Changelog'}</span>
            <span className="text-[10px] bg-blue-900/60 text-blue-200 px-1.5 py-0.5 rounded border border-blue-500/30">
              57 correções
            </span>
          </button>

          <button
            onClick={() => onSelectTab('editor')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
              currentTab === 'editor'
                ? 'bg-[#478cbf] text-white shadow'
                : 'text-gray-300 hover:text-white hover:bg-[#202531]'
            }`}
          >
            <Wrench className="w-4 h-4 text-emerald-300" />
            <span>{lang === 'pt' ? 'Editor Web Godot 4.7.2' : 'Godot 4.7.2 Web Editor'}</span>
          </button>

          <button
            onClick={() => onSelectTab('ai')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
              currentTab === 'ai'
                ? 'bg-[#478cbf] text-white shadow'
                : 'text-gray-300 hover:text-white hover:bg-[#202531]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>{lang === 'pt' ? 'Consultor IA' : 'AI Advisor'}</span>
            <span className="text-[10px] bg-purple-900/60 text-purple-200 px-1.5 py-0.5 rounded border border-purple-500/30">
              Argon
            </span>
          </button>

          <button
            onClick={() => onSelectTab('docs')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
              currentTab === 'docs'
                ? 'bg-amber-600 text-white shadow'
                : 'text-amber-300 hover:text-white hover:bg-[#202531] border border-amber-500/30'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{lang === 'pt' ? 'Documentação do Cliente' : 'Client Documentation'}</span>
            <span className="text-[10px] bg-amber-400 text-black font-extrabold px-1.5 py-0.5 rounded">
              16 FASES
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
