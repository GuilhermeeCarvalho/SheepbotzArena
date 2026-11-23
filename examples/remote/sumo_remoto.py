"""Estratégia de Sumô "busca e ataque" rodando fora do simulador (spec 009).

O programa escuta em ws://localhost:8765. No simulador, conecte o robô "sheep" a esse
endereço (aba Controlador → Controle remoto) ou rode pela linha de comando:

    npm run sim -- examples/worlds/sumo-mini.json --ticks 600 --remote sheep=ws://localhost:8765

Mensagens: specs/009-controle-remoto/contracts/protocol.md.
Requer Python 3.10+ e a biblioteca websockets (pip install -r requirements.txt).
"""

import asyncio
import json

from websockets.asyncio.server import serve

PORTA = 8765
BORDA = 0.5  # refletância acima disto = Tawara (borda branca)
TEMPO_RE = 0.12  # s de ré ao ver a borda
TEMPO_GIRO = 0.3  # s girando depois da ré
MAXIMO = 10  # pede o máximo; o simulador limita à velocidade do robô


class BuscaEAtaque:
    """Mesma lógica de examples/controllers/sumo-search-attack.js."""

    def __init__(self):
        self.re_ate = -1.0
        self.giro_ate = -1.0
        self.sentido = 1
        self.alcance = 0.0

    def decidir(self, t, sensores):
        esquerda_branca = sensores["piso-esq"] > BORDA
        direita_branca = sensores["piso-dir"] > BORDA
        if esquerda_branca or direita_branca:
            self.re_ate = t + TEMPO_RE
            self.giro_ate = self.re_ate + TEMPO_GIRO
            self.sentido = -1 if esquerda_branca else 1
        if t < self.re_ate:
            return -MAXIMO, 0
        if t < self.giro_ate:
            return 0, MAXIMO * self.sentido

        direita, centro, esquerda = sensores["oponente"]
        self.alcance = max(self.alcance, direita, centro, esquerda)

        def detectou(leitura):
            return leitura < self.alcance * 0.98

        if sensores["frente"] or detectou(centro):
            return MAXIMO, 0
        if detectou(esquerda):
            return 0, MAXIMO
        if detectou(direita):
            return 0, -MAXIMO
        return 0, MAXIMO * self.sentido


async def atender(conexao):
    estrategia = BuscaEAtaque()
    async for texto in conexao:
        mensagem = json.loads(texto)
        if mensagem["type"] == "start":
            estrategia = BuscaEAtaque()  # reinício: memória zerada
            print(f"conectado ao robô {mensagem['robot']} (dt = {mensagem['dt']} s)")
        elif mensagem["type"] == "tick":
            v, w = estrategia.decidir(mensagem["time"], mensagem["sensors"])
            await conexao.send(json.dumps({"v": v, "w": w}))
        elif mensagem["type"] == "end":
            print(f"fim no tick {mensagem['tick']}: {mensagem['match']}")


async def main():
    async with serve(atender, "localhost", PORTA) as servidor:
        print(f"controlador remoto escutando em ws://localhost:{PORTA}")
        await servidor.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())
