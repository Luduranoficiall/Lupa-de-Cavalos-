# 📖 Game Design Document (GDD) & Manual Oficial do Jogo
# Lupa de Cavalos: O Cavalo Completo (Horse Magnifier: The Full Horse)

[![Game Engine](https://img.shields.io/badge/Powered%20By-Godot%204.7.2%20Ecosystem-478cbf?logo=godotengine&logoColor=white)]()
[![Genre](https://img.shields.io/badge/Genre-Hidden%20Object%20%2F%20Comedy%20Puzzle-f59e0b)]()
[![Phases](https://img.shields.io/badge/Campaign-16%20Fases%20%7C%204%20Níveis-10b981)]()
[![Platform](https://img.shields.io/badge/Platform-Web%20(HTML5%20Canvas)%20%7C%20PC-blue)]()

---

## 1. Identidade & Ficha Técnica do Jogo

- **Título Comercial Principal:** *Lupa de Cavalos: O Cavalo Completo*
- **Título Internacional:** *Horse Magnifier: The Full Horse*
- **Subtítulo / Tagline:** *"Use sua lente de alta precisão para desvendar os segredos anatômicos mais bizarros do universo equino!"*
- **Gênero:** Quebra-cabeça de Inspeção Óptica, Hidden Object Cômico, Exploração Casual
- **Público-Alvo:** Jogadores casuais, entusiastas de jogos independentes, comunidade Godot Engine e fãs do humor surreal de sketbordcat.
- **Faixa Etária:** Livre para todas as idades (Classificação Indicativa: Livre / E for Everyone)
- **Modo de Jogo:** Um Jogador (Single-player)
- **Tempo de Campanha:** 45 a 90 minutos para atingir 100% (48 Estrelas)

---

## 2. Visão Geral & Premissa

Inspirado na ilustração de capa oficial do **Godot Engine 4.7.2** por **sketbordcat**, o jogador assume o papel de um curioso zoologista equipado com uma pesada lente de aumento de latão com propriedades de refração esférica.

Diante do jogador está **O Cavalo Completo** — uma criatura aparentemente majestosa e serena pastando em colinas verdes. No entanto, ao aproximar a lente de sua anatomia e ajustar o foco para níveis de zoom microscópicos (de 1.2x até 6.0x), o jogador descobre um ecossistema oculto de absurdos cômicos: desde um cavalheiro inglês tomando chá dentro da narina, uma montanha-russa em miniatura operando na crina, até um micro buraco negro estelar no peito e um caranguejo soldando extensões C++ no casco!

---

## 3. Core Loop (Ciclo Principal de Gameplay)

```
[Selecionar Fase & Dificuldade] 
       │
       ▼
[Escanear Anatomia do Cavalo com a Lente] 
       │
       ▼
[Ajustar Nível de Zoom Óptico (+/-)]
       │
       ▼
[Radar Sonoro Aumenta de Frequência] 
       │
       ▼
[Retícula Trava em Verde sobre o Ponto Secreto] 
       │
       ▼
[Clique de Inspeção: Reação de Squash-and-Stretch + Chime Pentatônico] 
       │
       ▼
[Registro no Álbum de Carimbos ➔ Conclusão da Fase ➔ Estrelas ⭐⭐⭐]
```

---

## 4. Matriz de Dificuldades (4 Níveis Balanceados)

### Nível 1: Fácil (*Iniciante no Rancho*)
- **Fases:** 1 a 4
- **Lente:** Ampla (Raio 110–120px)
- **Tempo:** Ilimitado / Livre
- **Zoom Requerido:** 1.8x a 2.0x
- **Auxílios:** Retícula de mira luminosa com alta tolerância e bipes sonoros contínuos de proximidade.
- **Objetivo:** Introduzir o jogador à mecânica de movimentação e zoom.

### Nível 2: Médio (*Zoologista Equino*)
- **Fases:** 5 a 8
- **Lente:** Padrão (Raio 90–95px)
- **Tempo Limite:** 75 a 90 segundos por fase
- **Zoom Requerido:** 2.2x a 2.4x
- **Desafios:** Leve tremor de respiração do cavalo (física senoidal no eixo X/Y) e novos segredos menores.

### Nível 3: Difícil (*Veterinário Quântico*)
- **Fases:** 9 a 12
- **Lente:** Cirúrgica (Raio 72–78px)
- **Tempo Limite:** 50 a 65 segundos por fase
- **Zoom Requerido:** 2.8x a 3.2x
- **Desafios:** Névoa dinâmica nas bordas da tela, segredos de escala microscópica e oscilação de vento.

### Nível 4: Hard Master (*O Cavalo Cósmico / Nível Pesadelo*)
- **Fases:** 13 a 16
- **Lente:** Microscópica Ultra-precisa (Raio 64–68px)
- **Tempo Limite:** 40 a 55 segundos por fase
- **Zoom Requerido:** 3.8x a 4.5x
- **Desafios:** Cronômetro com **batimento cardíaco procedural** abaixo de 15 segundos, aberração cromática, buraco negro estelar e névoa densa.

---

## 5. Catálogo Completo dos 16 Segredos Anatômicos

| ID | Nome do Segredo | Região do Corpo | Categoria | Zoom Mínimo | Efeito Especial / Som |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `nostril_tea` | **Chá das Cinco no Focinho** | Narina / Focinho | Segredo | 2.0x | Apito de chaleira + xícara de chá com fumaça |
| `eye_galaxy` | **Galáxia da Sabedoria** | Olho Esquerdo | Anatomia | 2.2x | Brilho cósmico + espiral estelar giratório |
| `ear_antenna` | **Antena Godot GH-121759** | Orelha Direita | Godot | 1.9x | Beep de rádio Morse do commit ed1daf0bf |
| `mane_coaster` | **Montanha-Russa da Crina** | Crina Superior | Segredo | 2.4x | Trilho em looping com carrinhos em movimento |
| `chest_clockwork` | **Motor a Vapor & Hamster** | Caixa Torácica | Godot | 2.0x | Engrenagens giratórias a 60 FPS + roda de corrida |
| `saddle_nodes` | **Árvore de Nós Godot 4.7** | Dorso / Sela | Godot | 1.9x | Holograma neon verde de hierarquia de nós |
| `belly_tickle` | **Ponto de Cócegas Secreto** | Barriga | Cócegas | 1.8x | **Gargalhada, relincho FM e squash-and-stretch** |
| `tail_fiber` | **Cabos de Fibra Óptica RGB** | Cauda | Anatomia | 2.2x | Feixes de luz RGB alternando cores de shader |
| `hoof_rune` | **Ferradura de Ouro Rúnica** | Casco Dianteiro | Segredo | 2.4x | Runas nórdicas gravadas com brilho dourado |
| `crab_gdextension` | **Ferris o Caranguejo** | Casco Traseiro | Godot | 2.5x | Caranguejo soldando extensões C++ nativas |
| `golden_carrot` | **Cenoura Dourada** | Queixo / Maxilar | Segredo | 2.2x | Reflexo especular amarelo 24 quilates |
| `steam_valve` | **Válvula de Escape 8000Hz** | Peitoral Inferior | Godot | 2.3x | Manômetro com ponteiro oscilante |
| `quantum_signal` | **Sinal Quântico GDScript** | Coluna Dorsal | Godot | 2.5x | Ondas de pulso concêntricas púrpuras |
| `micro_clover` | **Trevo de 7 Folhas** | Pasto / Casco Central| Segredo | 2.6x | Trevo microscópico que garante zero bugs |
| `black_hole_core` | **Micro Buraco Negro** | Centro do Tronco | Cósmico | 3.0x | Disco de acreção estelar e horizonte de eventos |
| `cosmic_monocle` | **Monóculo Hiper-Dimensional**| Ponta da Orelha | Cósmico | 3.2x | Hipercubo 4D giratório com feixes de laser |

---

## 6. Sistema de Áudio Procedural (Web Audio Synth)

Desenvolvido sem dependência de bibliotecas ou arquivos MP3/WAV externos, garantindo latência zero:
- **Zumbido da Lente (Focus Hum):** Onda senoidal modulada conforme o zoom óptico.
- **Bipe de Proximidade:** Tom cristalino crescente à medida que a mira se aproxima do ponto secreto.
- **Chime Pentatônico de Descoberta:** Arpejo C5-E5-G5-B5-C6 com decaimento suave.
- **Relincho do Cavalo:** Sintetizador com modulação de frequência (FM) a 14Hz acoplado a filtro passa-banda.
- **Batimento Cardíaco Tenso:** Pulso grave sub-bass de 65Hz acionado nos últimos 15 segundos de fases cronometradas.
- **Fanfarra da Vitória:** Progressão triunfal de acordes ao atingir 100% de uma fase ou da campanha.

---

## 7. Controles & Acessibilidade

- **Mouse / Trackpad:** Movimentação fluida da lente com interpolação suave (lerp).
- **Roda do Mouse (Scroll):** Zoom milimétrico.
- **Toque em Telas Móveis / Tablets:** Arraste com o dedo e botões de zoom dedicados na HUD.
- **Teclado:**
  - `Espaço` / `Enter`: Iniciar fase / avançar
  - `Esc` / `P`: Pausar simulação
  - `M`: Mutar/desmutar áudio
  - `+` / `-`: Aumentar/diminuir ampliação

---

## 8. Garantia Técnica & Homologação ("Sem Erros & Sem Bugs")

- **Zero Alocação de Memória no Game Loop:** Objetos de simulação e partículas pré-alocados para evitar garbage collection stutter.
- **Clamping de Delta Time:** `Math.min(rawDt, 0.05)` impede saltos na física após alternância de abas no navegador.
- **Isolamento Total do Canvas:** O loop de 60 FPS nunca força re-renderizações desnecessárias no componente React principal.
- **Persistência Segura:** Dados de progresso salvos automaticamente em `localStorage` com tratamento para dados corrompidos.
