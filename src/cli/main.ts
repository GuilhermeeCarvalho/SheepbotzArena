// Bootstrap da linha de comando (sem lógica; excluído da cobertura — plan 001, D-16).
import { run } from './run';

const result = await run(process.argv.slice(2));
process.stdout.write(result.stdout);
process.stderr.write(result.stderr);
process.exitCode = result.code;
