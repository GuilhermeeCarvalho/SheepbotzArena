// Atualiza a linha "N testes · X% de cobertura" do README (constitution, princípio VII).
import { readFileSync, writeFileSync } from 'node:fs';

const README = 'README.md';
const START = '<!-- stats:start -->';
const END = '<!-- stats:end -->';

const summary = JSON.parse(readFileSync('coverage/coverage-summary.json', 'utf8'));
const results = JSON.parse(readFileSync('coverage/test-results.json', 'utf8'));

const tests = results.numTotalTests;
const coverage = summary.total.lines.pct;
const line = `**${tests} testes · ${coverage.toFixed(1).replace('.', ',')}% de cobertura** (linhas; relatório em [\`coverage/\`](coverage/index.html))`;

const readme = readFileSync(README, 'utf8');
const pattern = new RegExp(`${START}[\\s\\S]*?${END}`);
if (!pattern.test(readme)) {
  console.error(`Marcadores ${START} / ${END} não encontrados no README.`);
  process.exit(1);
}
writeFileSync(README, readme.replace(pattern, `${START}\n${line}\n${END}`));
console.log(line);
