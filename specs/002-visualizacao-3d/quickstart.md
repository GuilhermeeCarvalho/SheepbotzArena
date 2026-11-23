# Roteiro de validação: Visualização 3D e controles

## Pré-requisitos
Node.js 22+, `npm install`.

## 1. Testes
```bash
npm test && npm run test:coverage && npm run lint
```
**Esperado**: suíte verde, cobertura ≥ 80%, lint sem erros (inclui independência de `src/ui`).

## 2. Interface
```bash
npm run dev     # abre http://localhost:5173
```
1. A arena "Corredor com obstáculos" aparece pausada no tick 0 (US4-AC1).
2. Arraste para girar, role para aproximar, botão direito para deslocar; "Centralizar
   vista" volta ao enquadramento (US1-AC4).
3. "Avançar um tick" 3× → tick 3 e tempo 0,15 s (US2-AC1).
4. "Executar": o robô percorre o corredor desviando; raios vermelhos indicam detecção
   (US2, US3). "Mostrar raios" desligado oculta os raios (US3-AC4).
5. Aba "Controlador": mude `CRUISE_SPEED` para `0.9` e aplique → reinicia mais rápido
   (US5-AC2, SC-004). Insira um erro de sintaxe e aplique → mensagem com linha (US5-AC3).
6. Aba "Mundo": troque `"radius": 0.1` por `0` e aplique → `robots[0].radius: deve ser
   maior que 0` e a cena anterior permanece (US4-AC3).
7. Troque o exemplo para "Campo de obstáculos com dois robôs" → dois robôs na lista
   (US4-AC2, US6).

## 3. Build
```bash
npm run build && npm run preview
```
