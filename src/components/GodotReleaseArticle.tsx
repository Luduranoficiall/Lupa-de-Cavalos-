import React, { useState } from 'react';
import { Download, Search, CheckCircle2, Heart, ExternalLink, Play, Sparkles, AlertCircle, Copy, Check } from 'lucide-react';
import { CHANGELOG_ITEMS, GODOT_DOWNLOADS } from '../data/godotData';
import { ChangelogItem, GodotDownload } from '../types';

interface GodotReleaseArticleProps {
  onPlayGame: () => void;
  onOpenWebEditor: () => void;
  lang: 'pt' | 'en';
}

export const GodotReleaseArticle: React.FC<GodotReleaseArticleProps> = ({
  onPlayGame,
  onOpenWebEditor,
  lang,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadModal, setDownloadModal] = useState<GodotDownload | null>(null);
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const categories = ['All', '3D', 'Assetlib', 'Core', 'Editor', 'GDExtension', 'GUI', 'Input', 'Multiplayer', 'Navigation', 'Network', 'Platforms', 'Rendering', 'Thirdparty'];

  const filteredChangelog = CHANGELOG_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-[#e0e1e5]">
      {/* Article Header */}
      <div className="border-b border-[#2d3446] pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#478cbf]/15 border border-[#478cbf]/30 text-[#478cbf] text-xs font-semibold rounded mb-4">
          <span>{lang === 'pt' ? 'Liberar · Manutenção' : 'Release · Maintenance'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          {lang === 'pt' ? 'Versão de manutenção: Godot 4.7.2' : 'Maintenance release: Godot 4.7.2'}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-400 font-mono">
          <div>
            <span className="text-gray-500">{lang === 'pt' ? 'Por:' : 'By:'}</span>{' '}
            <strong className="text-gray-200">Thaddeus Crews</strong>
          </div>
          <span>•</span>
          <div>{lang === 'pt' ? '18 de agosto de 2026' : 'August 18, 2026'}</div>
          <span>•</span>
          <div className="text-[#478cbf]">commit ed1daf0bf</div>
        </div>
      </div>

      {/* Featured Artwork Hero: Horse Magnifier: The Full Horse */}
      <div className="bg-[#202531] border border-[#2d3446] rounded-2xl overflow-hidden shadow-2xl mb-10 group">
        <div className="relative aspect-video sm:aspect-[21/9] bg-gradient-to-br from-[#1e3a5f] to-[#0d1829] flex items-center justify-center p-6 overflow-hidden">
          {/* Animated decorative backdrop rings */}
          <div className="absolute w-96 h-96 rounded-full border border-white/5 -top-20 -right-20 pointer-events-none" />
          <div className="absolute w-72 h-72 rounded-full border border-[#478cbf]/20 bottom-0 left-10 pointer-events-none" />

          {/* Horse Silhouette & Magnifier Graphic */}
          <div className="flex flex-col sm:flex-row items-center gap-6 z-10 max-w-xl text-center sm:text-left">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 p-2 shadow-xl flex items-center justify-center text-5xl">
              🐎
            </div>
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-semibold block mb-1">
                Jogo em Destaque no Anúncio
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Lupa de Cavalos: O Cavalo Completo
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">
                Um jogo de <strong>sketbordcat</strong> criado em Godot.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  onClick={onPlayGame}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm rounded-lg transition-transform transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Jogar Agora no Navegador
                </button>
                <a
                  href="https://store.steampowered.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg border border-gray-700 flex items-center gap-1.5 transition"
                >
                  Steam <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#1a1e28] text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#2d3446]">
          <span>
            {lang === 'pt'
              ? 'A ilustração da capa é de Horse Magnifier: The Full Horse, um jogo de ampliação de cavalos.'
              : 'The cover illustration is from Horse Magnifier: The Full Horse, a horse magnifying game.'}
          </span>
          <span className="text-gray-500">Desenvolvido por sketbordcat</span>
        </div>
      </div>

      {/* Main Release Body */}
      <div className="prose prose-invert max-w-none text-gray-300 space-y-6 text-base sm:text-lg leading-relaxed mb-12">
        <p>
          Já se passou um mês desde a última atualização de manutenção da versão 4.7? Como o tempo voa… Bem, não há tempo para lamentar o passado; vamos, em vez disso, focar no presente com mais uma atualização de manutenção:{' '}
          <strong className="text-white">Godot 4.7.2</strong>!
        </p>

        <p className="bg-[#202531] p-4 rounded-xl border border-blue-500/20 text-sm text-gray-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#478cbf] flex-shrink-0 mt-0.5" />
          <span>
            Espera-se que as versões de manutenção sejam <strong>seguras para atualização</strong>, mas recomendamos sempre fazer backups ou usar um sistema de controle de versão como o <strong>Git</strong> para preservar seus projetos em caso de corrupção ou perda de dados.
          </span>
        </p>

        <p>
          Por favor, considere apoiar o projeto financeiramente, se possível. O Godot é mantido pelo trabalho de voluntários e uma pequena equipe de colaboradores remunerados. Suas doações são destinadas a patrocinar o trabalho deles e garantir que possam dedicar atenção integral às necessidades do projeto.
        </p>

        {/* Quick Action Banner: Web Editor & Downloads */}
        <div className="bg-gradient-to-r from-[#202531] to-[#1c2638] p-6 rounded-2xl border border-[#3b455b] flex flex-col sm:flex-row items-center justify-between gap-4 my-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {lang === 'pt' ? 'Experimente sem instalar nada' : 'Try without installing'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">
              {lang === 'pt'
                ? 'Baixe o Godot 4.7.2 agora mesmo ou experimente a versão online do editor Godot.'
                : 'Download Godot 4.7.2 right now or try the online version of the Godot editor.'}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onOpenWebEditor}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#478cbf] hover:bg-[#559fd9] text-white font-bold text-xs sm:text-sm rounded-lg transition shadow cursor-pointer text-center"
            >
              Abrir Editor Web Godot
            </button>
          </div>
        </div>
      </div>

      {/* Official Downloads Section */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {lang === 'pt' ? 'Baixe o Godot 4.7.2 estável' : 'Download Godot 4.7.2 stable'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Disponível para Linux, macOS e Windows nas versões Padrão e .NET (C#)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Linux', 'macOS', 'Windows'].map((osName) => {
            const osDownloads = GODOT_DOWNLOADS.filter((d) => d.os === osName);
            return (
              <div
                key={osName}
                className="bg-[#202531] border border-[#2d3446] rounded-xl p-5 flex flex-col justify-between hover:border-[#478cbf]/50 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-white">{osName}</span>
                    <span className="text-2xl">
                      {osName === 'Linux' ? '🐧' : osName === 'macOS' ? '🍏' : '🪟'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {osDownloads.map((pkg) => (
                      <button
                        key={pkg.edition}
                        onClick={() => setDownloadModal(pkg)}
                        className="w-full text-left p-3 rounded-lg bg-[#191d26] hover:bg-[#252c3b] border border-gray-800 hover:border-gray-700 transition cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-semibold text-sm text-gray-200 group-hover:text-white">
                            {pkg.edition}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {pkg.architecture} · {pkg.size}
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 group-hover:text-[#478cbf]" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#262c3a] text-[11px] text-gray-500 text-center">
                  Modelos de exportação inclusos
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Changelog Explorer (57 Fixes) */}
      <section className="mb-14">
        <div className="border-b border-[#2d3446] pb-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Mudanças (57 correções de 39 colaboradores)
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Consulte nosso changelog interativo compilado a partir do commit <code className="text-[#478cbf]">ed1daf0bf</code>
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar PR ou correção..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#191d26] border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#478cbf]"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-3 mt-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full font-mono transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#478cbf] text-white font-bold'
                    : 'bg-[#191d26] text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Changelog Item Cards */}
        <div className="space-y-3">
          {filteredChangelog.map((item) => (
            <div
              key={item.id}
              className="bg-[#202531] border border-[#2d3446] rounded-xl p-4 hover:border-gray-600 transition"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-500/30">
                    {item.category}
                  </span>
                  <a
                    href={`https://github.com/godotengine/godot/pull/${item.pr.replace('GH-', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-[#478cbf] hover:underline"
                  >
                    {item.pr}
                  </a>
                </div>
                <span className="text-[11px] text-gray-500 font-mono">commit ed1daf0bf</span>
              </div>

              <h4 className="text-base font-bold text-white mb-1.5">{item.title}</h4>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3">{item.description}</p>

              <div className="text-xs bg-[#191d26] p-2.5 rounded-lg border border-gray-800/80 flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  <strong>Impacto:</strong> {item.impact}
                </span>
              </div>
            </div>
          ))}

          {filteredChangelog.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">
              Nenhuma alteração encontrada para &quot;{searchQuery}&quot;.
            </div>
          )}
        </div>
      </section>

      {/* Incompatibilities, Bug Reports & Support */}
      <section className="space-y-6 border-t border-[#2d3446] pt-10">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Incompatibilidades conhecidas</h3>
          <p className="text-sm text-gray-300">
            Até o momento, <strong>não há incompatibilidades conhecidas</strong> com a versão anterior do Godot 4.7.1. Incentivamos todos os usuários a atualizarem seus projetos para o 4.7.2.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-2">Relatórios de bugs</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Como testador, nós o encorajamos a abrir relatórios de bugs se tiver problemas com esta versão. Por favor, verifique primeiro os problemas existentes no GitHub usando a função de pesquisa com palavras-chave relevantes. Em particular, qualquer alteração que cause uma regressão nos seus projetos é muito importante de relatar.
          </p>
        </div>

        <div className="bg-[#202531] p-6 rounded-2xl border border-[#2d3446] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Apoie a Fundação Godot</h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
              O Godot é um motor de jogo sem fins lucrativos e de código aberto desenvolvido por centenas de colaboradores e mantido por meio do Fundo de Desenvolvimento Godot.
            </p>
          </div>
          <button
            onClick={() => alert('Obrigado pelo seu apoio à Fundação Godot!')}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-lg shadow-lg flex items-center gap-2 flex-shrink-0 transition cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-white" />
            Fazer uma Doação
          </button>
        </div>
      </section>

      {/* Simulated Download Modal */}
      {downloadModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">
              Baixando Godot 4.7.2 {downloadModal.os}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{downloadModal.filename} ({downloadModal.size})</p>

            <div className="bg-[#0f172a] p-4 rounded-xl border border-gray-800 mb-6 space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Edição:</span>
                <span className="font-bold text-white">{downloadModal.edition}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Arquitetura:</span>
                <span className="font-bold text-white">{downloadModal.architecture}</span>
              </div>
              <div className="pt-2 border-t border-gray-800">
                <span className="text-[11px] text-gray-500 font-mono block mb-1">SHA-256 Checksum:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={downloadModal.sha256}
                    className="w-full bg-[#1e293b] text-gray-300 font-mono text-[10px] p-1.5 rounded border border-gray-700 select-all"
                  />
                  <button
                    onClick={() => handleCopySha(downloadModal.sha256)}
                    className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded cursor-pointer"
                    title="Copiar Hash"
                  >
                    {copiedSha === downloadModal.sha256 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDownloadModal(null)}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold rounded-lg transition cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
