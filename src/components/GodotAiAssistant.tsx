import React, { useState } from 'react';
import { Send, Bot, Sparkles, Brain, Code2, AlertTriangle, Check, Copy } from 'lucide-react';

export const GodotAiAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: `Olá! Sou o **Especialista em Engenharia Godot 4.7.2**, equipado com **Raciocínio Profundo (gemini-4-argon · Thinking Level: HIGH)**.\n\nPosso ajudar com:\n- Implementação de shaders de lentes e magnificação 2D com \`ViewportTexture\`\n- Otimização de polling de mouse e eventos de entrada (GH-109639)\n- Arquitetura de nós, servidores de física 2D/3D e GDExtension em C++ e Rust\n- Detecção de pontos de cócegas e sistemas de squash-and-stretch procedural\n\nComo posso ajudar no seu projeto Godot hoje?`,
      time: 'Agora',
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const quickPrompts = [
    'Como criar um shader 2D de lente de aumento com aberração cromática no Godot 4.7?',
    'Explique como a correção GH-120004 no RandomPCG previne falhas em rand_weighted.',
    'Como implementar interpolação de mouse para altas taxas de polling no Windows (GH-109639)?',
    'Escreva um script GDScript 2.0 completo para animação squash & stretch procedural ao sofrer impacto.',
  ];

  const handleSubmit = async (userPrompt?: string) => {
    const textToSend = userPrompt || prompt;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/godot-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context: 'Godot Engine 4.7.2 Maintenance Release & Horse Magnifier game mechanics',
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.text || 'Nenhuma resposta recebida do motor de raciocínio.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ **Erro na consulta:** ${err.message || 'Falha na comunicação com o servidor'}.\n\n*Nota:* O assistente requer a chave \`GEMINI_API_KEY\` configurada para o modelo gemini-4-argon.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-[#202531] border border-[#2d3446] p-6 rounded-2xl mb-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/40">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Consultor Técnico Godot 4.7.2</h2>
              <span className="text-[11px] font-mono bg-purple-900/60 text-purple-200 border border-purple-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-300" />
                Thinking Mode: HIGH (gemini-4-argon)
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Raciocínio avançado de nível de engenharia para GDScript 2.0, Shaders e arquitetura de motores de jogos
            </p>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <span className="text-xs text-gray-400 font-mono block mb-2">Perguntas Rápidas Sugeridas:</span>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSubmit(qp)}
                className="text-xs bg-[#191d26] hover:bg-[#252c3b] border border-gray-700 hover:border-[#478cbf] text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition text-left cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="bg-[#191d26] border border-[#2d3446] rounded-2xl p-4 sm:p-6 mb-4 min-h-[420px] max-h-[580px] overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-[#478cbf] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold shadow">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed relative group ${
                msg.role === 'user'
                  ? 'bg-[#478cbf] text-white rounded-tr-none'
                  : 'bg-[#202531] text-gray-200 border border-gray-700/80 rounded-tl-none shadow'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                <span className="font-mono font-semibold">
                  {msg.role === 'user' ? 'Você' : 'Godot Architect AI'}
                </span>
                <span>{msg.time}</span>
              </div>

              {/* Message text with preformatted code handling */}
              <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                {msg.text}
              </div>

              {msg.role === 'assistant' && (
                <button
                  onClick={() => handleCopyText(msg.text, index)}
                  className="absolute bottom-2 right-2 p-1.5 text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700 rounded transition opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Copiar Resposta"
                >
                  {copiedIndex === index ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center text-purple-400 text-xs font-mono p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl animate-pulse">
            <Brain className="w-4 h-4 animate-spin" />
            <span>Raciocinando profundamente com gemini-4-argon (Thinking Level: HIGH)...</span>
          </div>
        )}
      </div>

      {/* Input Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex items-center gap-2 bg-[#202531] border border-gray-700 p-2 rounded-xl focus-within:border-[#478cbf] transition shadow-lg"
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Pergunte sobre GDScript, nós, shaders 2D/3D ou correções do Godot 4.7.2..."
          className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-5 py-2.5 bg-[#478cbf] hover:bg-[#559fd9] disabled:opacity-40 text-white font-bold text-sm rounded-lg transition flex items-center gap-2 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </form>
    </div>
  );
};
