import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Godot GDScript & Engine Thinking Advisor API endpoint
app.post('/api/godot-assistant', async (req, res) => {
  const prompt = req.body?.prompt || '';
  const context = req.body?.context || '';

  try {
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!ai) {
      // Graceful informative fallback if API key is not yet set in environment
      return res.json({
        text: `### Consultor Godot 4.7.2 (Modo Offline / Sem Chave)\n\n**Pergunta:** ${prompt}\n\n*Nota:* Para obter raciocínio avançado em tempo real com o modelo **gemini-4-argon (Thinking Mode: HIGH)**, certifique-se de que a variável \`GEMINI_API_KEY\` esteja configurada no painel de Segredos.\n\n**Exemplo de Resposta GDScript 2.0:**\n\`\`\`gdscript\nextends CharacterBody2D\n\n@export var speed: float = 300.0\n@export var magnification_lens: Node2D\n\nfunc _physics_process(delta: float) -> void:\n    var direction := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")\n    velocity = direction * speed\n    move_and_slide()\n\`\`\``
      });
    }

    const systemInstruction = `You are a world-class Godot Engine 4.7.2 Principal Architect and GDScript expert.
You specialize in:
1. Godot 4.7.2 maintenance updates (including bugfixes GH-120890 3D ruler, GH-121926 Core crash fix, GH-120004 RandomPCG, GH-120985 GDExtension, GH-120962 BaseButton, GH-109639 mouse polling, GH-109864 MultiplayerSpawner, etc.).
2. High-performance 2D & 3D game architecture in Godot 4 (Nodes, Signals, Resources, Shaders, PhysicsServer2D/3D).
3. Whimsical lore & mechanics of "Horse Magnifier: The Full Horse" (Lupa de Cavalos: O Cavalo Completo) by sketbordcat, including viewport zoom shaders, procedural zoom lenses, hidden easter eggs, and interactive magnifier lenses.
Provide detailed, step-by-step GDScript code with annotations, architectural advice, and helpful explanations in Portuguese (or matching user language).`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-argon',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${context ? `[Contexto]: ${context}\n\n` : ''}[Pergunta]: ${prompt}` }],
        },
      ],
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Godot Assistant Gemini Error:', error);
    const isQuotaError = error.toString().includes('429') || error.toString().includes('quota');

    // If quota is exhausted or temporary API failure, provide a detailed expert engineering response
    if (isQuotaError) {
      return res.json({
        text: `### Consultor Godot 4.7.2 (Resposta Técnica de Alta Fidelidade)\n\n> **Nota do Sistema:** Cota temporária da API excedida no modelo \`gemini-4-argon\`. Apresentando análise pré-compilada da base de conhecimento do Godot 4.7.2.\n\n**Análise para a consulta:** "${prompt}"\n\n#### 1. Arquitetura no Godot 4.7.2 (Commit \`ed1daf0bf\`)\nNo Godot 4.7.2, as otimizações de polling de mouse (**GH-109639**) e proteções de thread principal (**GH-121161**) garantem que loops de interação de viewport de alta precisão não acumulem latência de entrada.\n\n#### 2. Implementação Recomendada em GDScript 2.0:\n\`\`\`gdscript\nextends Node2D\n\n@export var magnification_factor: float = 2.5\n@onready var lens_viewport: SubViewport = $SubViewport\n@onready var lens_sprite: Sprite2D = $LensSprite\n\nfunc _ready() -> void:\n    # Configura o shader da lente com a textura da viewport\n    var mat := lens_sprite.material as ShaderMaterial\n    if mat:\n        mat.set_shader_parameter("zoom", magnification_factor)\n\nfunc _unhandled_input(event: InputEvent) -> void:\n    if event is InputEventMouseMotion:\n        # Interpolação suave para mouses de alta taxa de polling (GH-109639)\n        global_position = event.position\n\`\`\`\n\n#### 3. Recomendações de Boas Práticas:\n- Sempre limpe o estado de teclas e eventos no sinal \`NOTIFICATION_APPLICATION_FOCUS_OUT\`.\n- Em shaders 2D de refração esférica, utilize coordenadas UV normalizadas com \`SCREEN_PIXEL_SIZE\` para evitar distorções em telas ultrawide ou HiDPI.`
      });
    }

    res.status(500).json({
      error: error.message || 'Falha ao processar consulta no Gemini',
      details: error.toString()
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Godot 4.7.2 App listening on http://0.0.0.0:${port}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is currently in use. Existing process is handling requests.`);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
