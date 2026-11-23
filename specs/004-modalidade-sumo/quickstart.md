# Roteiro de validação: Modalidade Sumô

```bash
npm test                                                     # inclui tests/acceptance/sumo/*
npm run sim -- examples/worlds/sumo-mini.json --ticks 6000 --pretty | head -40
```

**Esperado**: `match.phase = "finished"` com `winner` e `reason`.

Na interface (`npm run dev`): escolha "Mini Sumô — busca e ataque × flanco", execute e veja
o round terminar com o resultado no canto da cena e a reprodução pausada. No modo de câmera
"Seguir", acompanhe um robô. Edite a estratégia (aba Controlador) e reaplique.
