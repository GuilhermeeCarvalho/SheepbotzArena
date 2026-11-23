# Controlador remoto (feature 009)

O programa do robô roda fora do simulador e conversa com ele por WebSocket, no estilo
Player/ROS. A cada tick o simulador envia as leituras dos sensores e espera a resposta
`{ "v": ..., "w": ... }` antes de avançar, então o resultado continua determinístico.
As mensagens estão em [`contracts/protocol.md`](../../specs/009-controle-remoto/contracts/protocol.md).

## Rodando o exemplo do Sumô

```bash
cd examples/remote
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python sumo_remoto.py            # escuta em ws://localhost:8765
```

Com o programa rodando, em outro terminal:

- **Interface**: `npm run dev`, abra o exemplo "Mini Sumô — busca e ataque × flanco", aba
  **Controlador**, robô **Sheep**, e clique em **Conectar** (endereço `ws://localhost:8765`).
  Depois, **Executar**.
- **Linha de comando**:

  ```bash
  npm run sim -- examples/worlds/sumo-mini.json --ticks 600 --remote sheep=ws://localhost:8765
  ```

O `sumo_remoto.py` é a mesma estratégia "busca e ataque" de
`examples/controllers/sumo-search-attack.js`; os dois terminam o round no mesmo tick e com o
mesmo vencedor.

## Escrevendo o seu

Qualquer linguagem com WebSocket serve. O programa precisa:

1. escutar num endereço (`ws://localhost:<porta>`);
2. para cada mensagem `tick`, responder `{ "v": <m/s>, "w": <rad/s> }` em até 2 s;
3. opcionalmente tratar `start` (início ou reinício: zere a memória) e `end` (fim).
