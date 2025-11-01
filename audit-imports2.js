#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Cores
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Configuração
const config = {
  correctImport: '@/lib/db/models/',
  excludeDirs: ['node_modules', '.next', 'dist', 'build', '.git'],
  extensions: ['.ts', '.tsx'],
};

// Estatísticas
const stats = {
  totalFiles: 0,
  problematicFiles: [],
  issuesByType: {},
  totalIssues: 0,
};

// Padrões de import incorretos
const wrongPatterns = [
  {
    regex: /from\s+['"]@\/models\//g,
    description: "Import usando @/models/",
    suggestion: "from '@/lib/db/models/",
  },
  {
    regex: /from\s+['"]@\/app\/models\//g,
    description: "Import usando @/app/models/",
    suggestion: "from '@/lib/db/models/",
  },
  {
    regex: /from\s+['"]@\/src\/models\//g,
    description: "Import usando @/src/models/",
    suggestion: "from '@/lib/db/models/",
  },
  {
    regex: /from\s+['"]\.\/models\//g,
    description: "Import relativo ./models/",
    suggestion: "from '@/lib/db/models/",
  },
  {
    regex: /from\s+['"]\.\.\/models\//g,
    description: "Import relativo ../models/",
    suggestion: "from '@/lib/db/models/",
  },
  {
    regex: /from\s+['"]\.\.\/\.\.\/models\//g,
    description: "Import relativo ../../models/",
    suggestion: "from '@/lib/db/models/",
  },
  {
    regex: /from\s+['"]\.\.\/\.\.\/\.\.\/models\//g,
    description: "Import relativo ../../../models/",
    suggestion: "from '@/lib/db/models/",
  },
];

// Funções de log
const log = {
  header: (msg) => console.log(`\n${colors.blue}╔${'═'.repeat(50)}╗${colors.reset}`),
  title: (msg) => console.log(`${colors.blue}║  ${msg.padEnd(48)}║${colors.reset}`),
  footer: () => console.log(`${colors.blue}╚${'═'.repeat(50)}╝${colors.reset}\n`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  file: (msg) => console.log(`${colors.cyan}📄 ${msg}${colors.reset}`),
  line: (msg) => console.log(`${colors.magenta}   ${msg}${colors.reset}`),
};

// Verificar se deve ignorar diretório
function shouldIgnoreDir(dir) {
  return config.excludeDirs.some(excluded => 
    dir.includes(excluded) || dir.startsWith('backup_')
  );
}

// Verificar se é arquivo válido
function isValidFile(file) {
  return config.extensions.some(ext => file.endsWith(ext));
}

// Escanear arquivo
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    wrongPatterns.forEach(pattern => {
      if (pattern.regex.test(line)) {
        const lineNumber = index + 1;
        const corrected = line.replace(
          /from\s+['"](@\/)?(app\/|src\/)?\.*(\/)?models\//g,
          pattern.suggestion
        );

        issues.push({
          lineNumber,
          line: line.trim(),
          corrected: corrected.trim(),
          type: pattern.description,
        });

        // Atualizar estatísticas
        stats.issuesByType[pattern.description] = 
          (stats.issuesByType[pattern.description] || 0) + 1;
        stats.totalIssues++;
      }
      // Reset regex
      pattern.regex.lastIndex = 0;
    });
  });

  return issues;
}

// Escanear diretório recursivamente
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!shouldIgnoreDir(filePath)) {
        scanDirectory(filePath);
      }
    } else if (isValidFile(file)) {
      stats.totalFiles++;

      // Mostrar progresso
      if (stats.totalFiles % 10 === 0) {
        process.stdout.write(`\r${colors.blue}   Escaneados: ${stats.totalFiles} arquivos...${colors.reset}`);
      }

      const issues = scanFile(filePath);
      if (issues.length > 0) {
        stats.problematicFiles.push({
          path: filePath,
          issues,
        });
      }
    }
  });
}

// Exibir resumo
function showSummary() {
  console.log('\n');
  log.header();
  log.title('📊 RESUMO');
  log.footer();

  console.log(`${colors.cyan}📁 Total de arquivos escaneados: ${colors.green}${stats.totalFiles}${colors.reset}`);
  console.log(`${colors.cyan}📄 Arquivos com problemas: ${colors.red}${stats.problematicFiles.length}${colors.reset}`);
  console.log(`${colors.cyan}⚠️  Total de issues: ${colors.red}${stats.totalIssues}${colors.reset}\n`);

  if (Object.keys(stats.issuesByType).length > 0) {
    console.log(`${colors.yellow}📋 Tipos de problemas encontrados:${colors.reset}\n`);
    Object.entries(stats.issuesByType).forEach(([type, count]) => {
      console.log(`  ${colors.red}•${colors.reset} ${type}: ${colors.yellow}${count}${colors.reset} ocorrências`);
    });
    console.log('');
  }
}

// Exibir detalhes de arquivo
function showFileDetails(fileData) {
  console.log(`${colors.yellow}${'━'.repeat(50)}${colors.reset}`);
  console.log(`${colors.cyan}📄 Arquivo: ${colors.magenta}${fileData.path}${colors.reset}`);
  console.log(`${colors.yellow}${'━'.repeat(50)}${colors.reset}\n`);

  fileData.issues.forEach(issue => {
    console.log(`${colors.red}  ❌ Linha ${issue.lineNumber}:${colors.reset}`);
    console.log(`${colors.blue}     ${issue.line}${colors.reset}`);
    console.log(`${colors.green}     ✅ Sugestão: ${issue.corrected}${colors.reset}\n`);
  });
}

// Exibir todos os arquivos problemáticos
function showDetailedIssues() {
  if (stats.problematicFiles.length === 0) return;

  log.header();
  log.title('📝 ARQUIVOS PROBLEMÁTICOS');
  log.footer();

  stats.problematicFiles.forEach(fileData => {
    showFileDetails(fileData);
  });
}

// Gerar relatório em arquivo
function generateReport() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = `import-audit-report-${timestamp}.txt`;

  let report = '';
  report += '╔══════════════════════════════════════════════════╗\n';
  report += '║     RELATÓRIO DE AUDITORIA DE IMPORTS           ║\n';
  report += '╚══════════════════════════════════════════════════╝\n\n';
  report += `Data: ${new Date().toLocaleString()}\n`;
  report += `Projeto: ${path.basename(process.cwd())}\n\n`;
  report += '════════════════════════════════════════════════════\n';
  report += 'RESUMO\n';
  report += '════════════════════════════════════════════════════\n\n';
  report += `Total de arquivos escaneados: ${stats.totalFiles}\n`;
  report += `Arquivos com problemas: ${stats.problematicFiles.length}\n`;
  report += `Total de issues encontrados: ${stats.totalIssues}\n\n`;

  if (stats.problematicFiles.length > 0) {
    report += '════════════════════════════════════════════════════\n';
    report += 'TIPOS DE PROBLEMAS\n';
    report += '════════════════════════════════════════════════════\n\n';

    Object.entries(stats.issuesByType).forEach(([type, count]) => {
      report += `  • ${type}: ${count} ocorrências\n`;
    });

    report += '\n════════════════════════════════════════════════════\n';
    report += 'ARQUIVOS PROBLEMÁTICOS\n';
    report += '════════════════════════════════════════════════════\n\n';

    stats.problematicFiles.forEach(fileData => {
      report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      report += `📄 ${fileData.path}\n`;
      report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

      fileData.issues.forEach(issue => {
        report += `  ❌ Linha ${issue.lineNumber}:\n`;
        report += `     ${issue.line}\n`;
        report += `     ✅ Sugestão: ${issue.corrected}\n\n`;
      });
    });

    report += '════════════════════════════════════════════════════\n';
    report += 'COMANDO PARA CORRIGIR\n';
    report += '════════════════════════════════════════════════════\n\n';
    report += 'Execute o script de migração para corrigir automaticamente:\n';
    report += '  ./migrate-models.sh\n';
    report += '  OU\n';
    report += '  node migrate-models.js\n\n';
    report += 'Ou corrija manualmente substituindo os imports por:\n';
    report += "  from '@/lib/db/models/NomeDoModelo'\n\n";
  }

  fs.writeFileSync(reportFile, report);
  return reportFile;
}

// Exibir resultado final
function showFinalResult(reportFile) {
  console.log('');
  log.header();
  log.title('🎯 RESULTADO FINAL');
  log.footer();

  if (stats.problematicFiles.length === 0) {
    log.success('PARABÉNS! Todos os imports estão corretos!');
    console.log(`${colors.green}   Todos os arquivos usam: @/lib/db/models/${colors.reset}\n`);
  } else {
    log.error('ATENÇÃO! Foram encontrados problemas nos imports\n');
    console.log(`${colors.yellow}📄 Relatório detalhado salvo em:${colors.reset}`);
    console.log(`   ${colors.cyan}${reportFile}${colors.reset}\n`);
    console.log(`${colors.yellow}🔧 Para corrigir automaticamente, execute:${colors.reset}`);
    console.log(`   ${colors.green}./migrate-models.sh${colors.reset}`);
    console.log(`   ${colors.green}OU${colors.reset}`);
    console.log(`   ${colors.green}node migrate-models.js${colors.reset}\n`);
  }
}

// Menu interativo
async function showMenu() {
  if (stats.problematicFiles.length === 0) return;

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    console.log(`${colors.cyan}${'═'.repeat(50)}${colors.reset}`);
    readline.question(
      `${colors.yellow}Deseja ver os detalhes de cada arquivo? (s/n): ${colors.reset}`,
      answer => {
        readline.close();
        if (answer.toLowerCase() === 's') {
          showDetailedIssues();
        }
        resolve();
      }
    );
  });
}

// Função principal
async function main() {
  log.header();
  log.title('🔍 AUDITORIA DE IMPORTS - CRM SYSTEM');
  log.footer();

  // Verificar se está na raiz
  if (!fs.existsSync('package.json')) {
    log.error('Execute este script na raiz do projeto Next.js');
    process.exit(1);
  }

  // Escanear projeto
  console.log(`${colors.yellow}🔍 Escaneando projeto...${colors.reset}\n`);
  scanDirectory('.');
  console.log(`\n${colors.green}   ✅ Escaneamento concluído: ${stats.totalFiles} arquivos${colors.reset}\n`);

  // Exibir resumo
  showSummary();

  // Gerar relatório
  const reportFile = generateReport();

  // Menu interativo
  await showMenu();

  // Resultado final
  showFinalResult(reportFile);

  // Exit code
  process.exit(stats.problematicFiles.length > 0 ? 1 : 0);
}

// Executar
main().catch(err => {
  console.error(`${colors.red}Erro fatal:${colors.reset}`, err);
  process.exit(1);
});