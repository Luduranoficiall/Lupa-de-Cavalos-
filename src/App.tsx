import React, { useState } from 'react';
import { GodotHeader } from './components/GodotHeader';
import { GodotReleaseArticle } from './components/GodotReleaseArticle';
import { HorseGame } from './game/HorseGame';
import { GodotWebEditor } from './components/GodotWebEditor';
import { GodotAiAssistant } from './components/GodotAiAssistant';
import { ClientDocumentation } from './components/ClientDocumentation';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'game' | 'article' | 'editor' | 'ai' | 'docs'>('game');
  const [lang, setLang] = useState<'pt' | 'en'>('pt');

  const toggleLang = () => {
    setLang((prev) => (prev === 'pt' ? 'en' : 'pt'));
  };

  // Full-viewport Game Shell without external website navbars/footers during gameplay
  if (currentTab === 'game') {
    return (
      <main className="w-screen h-screen overflow-hidden bg-[#10141d]">
        <HorseGame
          onExitGame={() => setCurrentTab('article')}
          onOpenDocs={() => setCurrentTab('docs')}
        />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#191d26] text-[#e0e1e5] flex flex-col font-sans">
      {/* Official Godot Navigation Header */}
      <GodotHeader
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        lang={lang}
        onToggleLang={toggleLang}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {currentTab === 'article' && (
          <GodotReleaseArticle
            onPlayGame={() => setCurrentTab('game')}
            onOpenWebEditor={() => setCurrentTab('editor')}
            lang={lang}
          />
        )}

        {currentTab === 'docs' && (
          <ClientDocumentation onPlayGame={() => setCurrentTab('game')} />
        )}

        {currentTab === 'editor' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Editor Web Godot 4.7.2</h2>
                <p className="text-xs text-gray-400">
                  Ambiente Web oficial simulado com suporte a GDScript 2.0 e inspeção de nós em tempo real.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('docs')}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/30 transition cursor-pointer"
                >
                  📚 Ver Manual
                </button>
                <button
                  onClick={() => setCurrentTab('game')}
                  className="px-4 py-2 bg-[#478cbf] hover:bg-[#559fd9] text-white text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  🎮 Jogar Lupa de Cavalos
                </button>
              </div>
            </div>
            <GodotWebEditor />
          </div>
        )}

        {currentTab === 'ai' && <GodotAiAssistant />}
      </main>

      {/* Official Godot Footer */}
      <footer className="bg-[#14171f] border-t border-[#232936] text-gray-400 text-xs py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#478cbf] flex items-center justify-center text-white font-bold text-sm">
              G
            </div>
            <div>
              <p className="text-white font-semibold">Motor Godot (Godot Engine)</p>
              <p className="text-[11px] text-gray-500">
                © 2007-2026 Juan Linietsky, Ariel Manzur e colaboradores. Hospedado pela Fundação Godot.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-[12px] text-gray-400">
            <button onClick={() => setCurrentTab('docs')} className="hover:text-amber-300 text-amber-400/80 transition cursor-pointer">
              Manual & Documentação do Cliente
            </button>
            <a href="https://github.com/godotengine/godot" target="_blank" rel="noreferrer" className="hover:text-white transition">
              Código-fonte no GitHub
            </a>
            <span className="hover:text-white cursor-pointer transition">Política de Privacidade</span>
            <span className="hover:text-white cursor-pointer transition">Contato</span>
            <span className="hover:text-white cursor-pointer transition">Governança</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
