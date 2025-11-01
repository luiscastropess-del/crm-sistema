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
  dim: '\x1b[2m',
};

// Configuração
const config = {
  correctImport: '@/lib/db/models/',
  excludeDirs: ['node_modules', '.next', 'dist', 'build', '.git', 'coverage', '.turbo'],
  extensions: ['.ts', '.tsx'],
};

// Estatísticas
const stats = {
  totalFiles: 0,
  problematicFiles: [],
  issuesByType: {},
  totalIssues: 0,
  startTime: Date.now(),
  directoriesScanned: 0,
};

// Padrões de import incorretos
const wrongPatterns = [
  {
    regex: /from\s+['"]@\/models\//,
    description: "Import usando @/models/",
    priority: 'high',
  },
  {
    regex: /from\s+['"]@\/app\/models\//,
    description: "Import usando @/app/models/",
    priority: 'high',
  },
  {
    regex: /from\s+['"]@\/src\/models\//,
    description: "Import usando @/src/models/",
    priority: 'high',
  },
  {
    regex: /from\s+['"]\.\/models\//,
    description: "Import relativo ./models/",
    priority: 'medium',
  },
  {
    regex: /from\s+['"]\.\.\/models\//,
    description: "Import relativo ../models/",
    priority: 'medium',
  },
  {
    regex: /from\s+['"]\.\.\/\.\.\/models\//,
    description: "Import relativo ../../models/",
    priority: 'low',
  },
  {
    regex: /from\s+['"]\.\.\/\.\.\/\.\.\/models\//,
    description: "Import relativo ../../../models/",
    priority: 'low',
  },
];

// Funções de log
const log = {
  header: () => {
    console.log(`\n${colors.blue}╔${'═'.repeat(60)}╗${colors.reset}`);
    console.log(`${colors.blue}║${colors.cyan}  🔍 AUDITORIA DE IMPORTS - CRM SYSTEM  ${colors.blue}║${colors.reset}`);
    console.log(`${colors.blue}╚${'═'.repeat(60)}╝${colors.reset}\n`);
  },
  section: (title) => {
    console.log(`\n${colors.blue}╔${'═'.repeat(60)}╗${colors.reset}`);
    console.log(`${colors.blue}║${colors.cyan}${title.padStart(35).padEnd(60)}${colors.blue}║${colors.reset}`);
    console.log(`${colors.blue}╚${'═'.repeat(60)}╝${colors.reset}\n`);
  },
  progress: (current, dir) => {
    process.stdout.write(
      `\r${colors.cyan}📂 Escaneando: ${colors.dim}${dir.substring(0, 40).padEnd(40)}${colors.reset} ` +
      `${colors.yellow}(${current} arquivos)${colors.reset}   `
    );
  },
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
};

// Verificar se deve ignorar diretório
function shouldIgnoreDir(dirPath) {
  const parts = dirPath.split(path.sep);
  
  // Verificar cada parte do caminho
  for (const part of parts) {
    // Ignorar diretórios da lista
    if (config.excludeDirs.includes(part)) {
      return true;
    }
    // Ignorar diretórios que começam com ponto (exceto .)
    if (part.startsWith('.') && part !== '.') {
      return true;
    }
    // Ignorar backups
    if (part.startsWith('backup_')) {
      return true;
    }
  }
  
  return false;
}

// Verificar se é arquivo válido
function isValidFile(fileName) {
  // Verificar extensão
  if (!config.extensions.some(ext => fileName.endsWith(ext))) {
    return false;
  }
  
  // Ignorar arquivos de teste e definição
  if (fileName.endsWith('.test.ts') || 
      fileName.endsWith('.test.tsx') || 
      fileName.endsWith('.spec.ts') || 
      fileName.endsWith('.spec.tsx') ||
      fileName.endsWith('.d.ts')) {
    return false;
  }
  
  return true;
}

// Escanear arquivo
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];

    lines.forEach((line, index) => {
      // Verificar cada padrão
      wrongPatterns.forEach(pattern => {
        if (pattern.regex.test(line)) {
          const lineNumber = index + 1;
          
          // Sugerir correção
          let corrected = line
            .replace(/from\s+['"]@\/models\//g, `from '${config.correctImport}`)
            .replace(/from\s+['"]@\/app\/models\//g, `from '${config.correctImport}`)
            .replace(/from\s+['"]@\/src\/models\//g, `from '${config.correctImport}`)
            .replace(/from\s+['"]\.+\/models\//g, `from '${config.correctImport}`);

          issues.push({
            lineNumber,
            line: line.trim(),
            corrected: corrected.trim(),
            type: pattern.description,
            priority: pattern.priority,
          });

          // Atualizar estatísticas
          stats.issuesByType[pattern.description] = 
            (stats.issuesByType[pattern.description] || 0) + 1;
          stats.totalIssues++;
        }
      });
    });

    return issues;
    
  } catch (err) {
    // Ignorar erros silenciosamente
    return [];
  }
}

// Escanear diretório recursivamente
function scanDirectory(dir) {
  try {
    // Verificar se deve ignorar este diretório
    if (shouldIgnoreDir(dir)) {
      return;
    }

    stats.directoriesScanned++;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recursão para subdiretórios
        scanDirectory(fullPath);
      } else if (entry.isFile() && isValidFile(entry.name)) {
        stats.totalFiles++;

        // Mostrar progresso
        if (stats.totalFiles % 5 === 0) {
          log.progress(stats.totalFiles, dir);
        }

        const issues = scanFile(fullPath);
        if (issues.length > 0) {
          stats.problematicFiles.push({
            path: fullPath,
            issues,
          });
        }
      }
    }
  } catch (err) {
    // Ignorar erros de permissão
  }
}

// Exibir resumo
function showSummary() {
  const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(2);
  const filesPerSecond = (stats.totalFiles / parseFloat(elapsed)).toFixed(0);
  
  console.log('\n'); // Limpar linha de progresso
  log.section('📊 RESUMO');

  console.log(`${colors.cyan}⏱️  Tempo de execução: ${colors.green}${elapsed}s${colors.reset}`);
  console.log(`${colors.cyan}⚡ Velocidade: ${colors.green}${filesPerSecond} files/s${colors.reset}`);
  console.log(`${colors.cyan}📂 Diretórios escaneados: ${colors.green}${stats.directoriesScanned}${colors.reset}`);
  console.log(`${colors.cyan}📁 Total de arquivos encontrados: ${colors.green}${stats.totalFiles}${colors.reset}`);
  console.log(`${colors.cyan}📄 Arquivos com problemas: ${colors.red}${stats.problematicFiles.length}${colors.reset}`);
  console.log(`${colors.cyan}⚠️  Total de issues: ${colors.red}${stats.totalIssues}${colors.reset}\n`);

  if (Object.keys(stats.issuesByType).length > 0) {
    console.log(`${colors.yellow}📋 Tipos de problemas encontrados:${colors.reset}\n`);
    
    // Ordenar por quantidade
    const sorted = Object.entries(stats.issuesByType)
      .sort((a, b) => b[1] - a[1]);
    
    sorted.forEach(([type, count]) => {
      const priority = wrongPatterns.find(p => p.description === type)?.priority || 'low';
      const priorityIcon = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🔵';
      console.log(`  ${priorityIcon} ${type}: ${colors.yellow}${count}${colors.reset} ocorrências`);
    });
    console.log('');
  }
}

// Exibir detalhes de arquivo
function showFileDetails(fileData) {
  console.log(`${colors.yellow}${'━'.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}📄 Arquivo: ${colors.magenta}${fileData.path}${colors.reset}`);
  console.log(`${colors.dim}   ${fileData.issues.length} issue(s) encontrado(s)${colors.reset}`);
  console.log(`${colors.yellow}${'━'.repeat(60)}${colors.reset}\n`);

  // Agrupar por prioridade
  const highPriority = fileData.issues.filter(i => i.priority === 'high');
  const mediumPriority = fileData.issues.filter(i => i.priority === 'medium');
  const lowPriority = fileData.issues.filter(i => i.priority === 'low');

  const showIssues = (issues, label, color) => {
    if (issues.length === 0) return;
    console.log(`${color}  ${label} (${issues.length}):${colors.reset}\n`);
    issues.forEach(issue => {
      console.log(`${colors.red}    ❌ Linha ${issue.lineNumber}:${colors.reset}`);
      console.log(`${colors.blue}       ${issue.line}${colors.reset}`);
      console.log(`${colors.green}       ✅ ${issue.corrected}${colors.reset}\n`);
    });
  };

  showIssues(highPriority, '🔴 ALTA PRIORIDADE', colors.red);
  showIssues(mediumPriority, '🟡 MÉDIA PRIORIDADE', colors.yellow);
  showIssues(lowPriority, '🔵 BAIXA PRIORIDADE', colors.blue);
}

// Exibir todos os arquivos problemáticos
function showDetailedIssues() {
  if (stats.problematicFiles.length === 0) return;

  log.section('📝 ARQUIVOS PROBLEMÁTICOS');

  // Ordenar por número de issues (decrescente)
  const sorted = [...stats.problematicFiles].sort((a, b) => b.issues.length - a.issues.length);

  sorted.forEach(fileData => {
    showFileDetails(fileData);
  });
}

// Gerar relatório em arquivo
function generateReport() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').substring(0, 19);
  const reportFile = `import-audit-report-${timestamp}.txt`;
  const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(2);
  const filesPerSecond = (stats.totalFiles / parseFloat(elapsed)).toFixed(0);

  let report = '';
  report += '╔══════════════════════════════════════════════════════════╗\n';
  report += '║        RELATÓRIO DE AUDITORIA DE IMPORTS                ║\n';
  report += '╚══════════════════════════════════════════════════════════╝\n\n';
  report += `Data: ${new Date().toLocaleString('pt-BR')}\n`;
  report += `Projeto: ${path.basename(process.cwd())}\n`;
  report += `Tempo de execução: ${elapsed}s\n`;
  report += `Velocidade: ${filesPerSecond} files/s\n\n`;
  report += '════════════════════════════════════════════════════════════\n';
  report += 'RESUMO\n';
  report += '════════════════════════════════════════════════════════════\n\n';
  report += `Diretórios escaneados: ${stats.directoriesScanned}\n`;
  report += `Total de arquivos encontrados: ${stats.totalFiles}\n`;
  report += `Arquivos com problemas: ${stats.problematicFiles.length}\n`;
  report += `Total de issues encontrados: ${stats.totalIssues}\n\n`;

  if (stats.problematicFiles.length > 0) {
    report += '════════════════════════════════════════════════════════════\n';
    report += 'TIPOS DE PROBLEMAS\n';
    report += '════════════════════════════════════════════════════════════\n\n';

    Object.entries(stats.issuesByType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const priority = wrongPatterns.find(p => p.description === type)?.priority || 'low';
        report += `  [${priority.toUpperCase()}] ${type}: ${count} ocorrências\n`;
      });

    report += '\n════════════════════════════════════════════════════════════\n';
    report += 'ARQUIVOS PROBLEMÁTICOS (ordenados por quantidade de issues)\n';
    report += '════════════════════════════════════════════════════════════\n\n';

    const sorted = [...stats.problematicFiles].sort((a, b) => b.issues.length - a.issues.length);

    sorted.forEach(fileData => {
      report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      report += `📄 ${fileData.path} (${fileData.issues.length} issues)\n`;
      report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

      fileData.issues.forEach(issue => {
        report += `  [${issue.priority.toUpperCase()}] Linha ${issue.lineNumber}:\n`;
        report += `     ❌ ${issue.line}\n`;
        report += `     ✅ ${issue.corrected}\n\n`;
      });
    });

    report += '════════════════════════════════════════════════════════════\n';
    report += 'COMANDO PARA CORRIGIR\n';
    report += '════════════════════════════════════════════════════════════\n\n';
    report += 'Execute o script de migração para corrigir automaticamente:\n';
    report += '  ./migrate-models.sh\n';
    report += '  OU\n';
    report += '  node migrate-models.js\n\n';
  }

  fs.writeFileSync(reportFile, report);
  return reportFile;
}

// Exibir resultado final
function showFinalResult(reportFile) {
  log.section('🎯 RESULTADO FINAL');

  if (stats.problematicFiles.length === 0) {
    log.success('PARABÉNS! Todos os imports estão corretos!');
    console.log(`${colors.green}   Todos os arquivos usam: @/lib/db/models/${colors.reset}\n`);
  } else {
    log.error('ATENÇÃO! Foram encontrados problemas nos imports\n');
    console.log(`${colors.yellow}📄 Relatório detalhado salvo em:${colors.reset}`);
    console.log(`   ${colors.cyan}${reportFile}${colors.reset}\n`);
    console.log(`${colors.yellow}🔧 Para corrigir automaticamente, execute:${colors.reset}`);
    console.log(`   ${colors.green}node migrate-models.js${colors.reset}\n`);
    
    console.log(`${colors.yellow}📋 Top 10 arquivos com mais problemas:${colors.reset}\n`);
    const sorted = [...stats.problematicFiles]
      .sort((a, b) => b.issues.length - a.issues.length)
      .slice(0, 10);
    
    sorted.forEach((file, index) => {
      const priorityIcon = file.issues.some(i => i.priority === 'high') ? '🔴' : 
                          file.issues.some(i => i.priority === 'medium') ? '🟡' : '🔵';
      console.log(`   ${priorityIcon} ${colors.red}${index + 1}.${colors.reset} ${file.path} ${colors.dim}(${file.issues.length} issues)${colors.reset}`);
    });
    console.log('');
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
    console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
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

// Listar estrutura de diretórios (debug)
function listDirectories(dir, level = 0) {
  if (level > 3) return; // Limitar profundidade
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      if (entry.isDirectory()) {
        const fullPath = path.join(dir, entry.name);
        if (!shouldIgnoreDir(fullPath)) {
          console.log(`${'  '.repeat(level)}📁 ${entry.name}`);
          listDirectories(fullPath, level + 1);
        }
      }
    });
  } catch (err) {
    // Ignorar erros
  }
}

// Função principal
async function main() {
  log.header();

  // Verificar se está na raiz
  if (!fs.existsSync('package.json')) {
    log.error('Execute este script na raiz do projeto Next.js');
    process.exit(1);
  }

  // Mostrar estrutura (debug)
  log.info('📂 Estrutura do projeto:');
  console.log('');
  listDirectories('.', 0);
  console.log('');

  // Escanear projeto
  log.info('🔍 Iniciando escaneamento recursivo...\n');
  scanDirectory('.');

  console.log('\n'); // Limpar linha de progresso

  if (stats.totalFiles === 0) {
    log.warning('Nenhum arquivo TypeScript encontrado!');
    log.info('Verifique se você está na raiz do projeto Next.js');
    process.exit(0);
  }

  // Exibir resumo
  showSummary();

  // Gerar relatório
  const reportFile = generateReport();
  log.success(`Relatório salvo em: ${colors.cyan}${reportFile}${colors.reset}`);

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