#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
};

// Configuração
const config = {
  wrongDirs: ['models', 'app/models', 'src/models'],
  correctDir: 'lib/db/models',
  backupDir: `backup_models_${Date.now()}`,
};

let stats = {
  filesMoved: 0,
  importsFixed: 0,
};

// Criar diretório se não existir
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log.success(`Diretório criado: ${dir}`);
  }
}

// Copiar arquivo
function copyFile(source, dest) {
  fs.copyFileSync(source, dest);
}

// Mover arquivo
function moveFile(source, dest) {
  fs.renameSync(source, dest);
}

// Listar arquivos .ts em um diretório
function getTsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.ts'))
    .map(file => path.join(dir, file));
}

// Fazer backup
function createBackup(sourceDir) {
  if (!fs.existsSync(sourceDir)) return;
  
  log.info(`Criando backup de ${sourceDir}...`);
  ensureDir(config.backupDir);
  
  const backupPath = path.join(config.backupDir, path.basename(sourceDir));
  ensureDir(backupPath);
  
  const files = getTsFiles(sourceDir);
  files.forEach(file => {
    const dest = path.join(backupPath, path.basename(file));
    copyFile(file, dest);
  });
  
  log.success(`Backup criado em ${config.backupDir}`);
}

// Mover modelos
function moveModels(sourceDir) {
  if (!fs.existsSync(sourceDir)) return;
  
  log.info(`Verificando ${sourceDir}...`);
  
  const files = getTsFiles(sourceDir);
  if (files.length === 0) {
    log.info(`Nenhum arquivo .ts em ${sourceDir}`);
    return;
  }
  
  createBackup(sourceDir);
  ensureDir(config.correctDir);
  
  files.forEach(file => {
    const filename = path.basename(file);
    const dest = path.join(config.correctDir, filename);
    
    if (fs.existsSync(dest)) {
      log.warning(`${filename} já existe no destino. Pulando...`);
      return;
    }
    
    log.info(`Movendo ${filename}...`);
    moveFile(file, dest);
    stats.filesMoved++;
    log.success(`${filename} movido`);
  });
  
  // Remover diretório vazio
  try {
    if (fs.readdirSync(sourceDir).length === 0) {
      fs.rmdirSync(sourceDir);
      log.success(`Diretório vazio ${sourceDir} removido`);
    }
  } catch (err) {
    // Ignorar erro
  }
}

// Corrigir imports em um arquivo
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  const patterns = [
    { from: /from ['"]@\/models\//g, to: "from '@/lib/db/models/" },
    { from: /from ['"]\.\/models\//g, to: "from '@/lib/db/models/" },
    { from: /from ['"]\.\.\/models\//g, to: "from '@/lib/db/models/" },
    { from: /from ['"]\.\.\/\.\.\/models\//g, to: "from '@/lib/db/models/" },
    { from: /from ['"]@\/app\/models\//g, to: "from '@/lib/db/models/" },
    { from: /from ['"]@\/src\/models\//g, to: "from '@/lib/db/models/" },
  ];
  
  patterns.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });
  
  if (content !== originalContent) {
    // Backup do arquivo original
    fs.copyFileSync(filePath, `${filePath}.bak`);
    
    // Salvar arquivo corrigido
    fs.writeFileSync(filePath, content, 'utf8');
    stats.importsFixed++;
    log.success(`Corrigido: ${filePath}`);
  }
}

// Corrigir imports em todos os arquivos
function fixAllImports(dir = '.') {
  log.info('Corrigindo imports...');
  
  function walkDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    files.forEach(file => {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      // Ignorar node_modules, .next, backups
      if (file === 'node_modules' || file === '.next' || file.startsWith('backup_')) {
        return;
      }
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        fixImportsInFile(filePath);
      }
    });
  }
  
  walkDir(dir);
}

// Verificar estrutura final
function verifyStructure() {
  log.info('Verificando estrutura final...');
  console.log('');
  
  let hasErrors = false;
  
  // Verificar diretórios incorretos
  config.wrongDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = getTsFiles(dir);
      if (files.length > 0) {
        log.error(`${dir} ainda contém ${files.length} arquivos .ts`);
        hasErrors = true;
      }
    }
  });
  
  // Verificar diretório correto
  if (!fs.existsSync(config.correctDir)) {
    log.error(`${config.correctDir} não existe`);
    hasErrors = true;
  } else {
    log.success(`${config.correctDir} existe`);
    
    const models = ['User', 'Customer', 'Lead', 'Deal', 'Task', 'Activity'];
    console.log(`${colors.blue}📋 Modelos:${colors.reset}`);
    
    models.forEach(model => {
      const filePath = path.join(config.correctDir, `${model}.ts`);
      if (fs.existsSync(filePath)) {
        log.success(`${model}.ts`);
      } else {
        log.warning(`${model}.ts não encontrado`);
      }
    });
  }
  
  console.log('');
  if (!hasErrors) {
    log.success('Estrutura verificada com sucesso!');
  } else {
    log.error('Estrutura contém erros!');
  }
}

// Gerar relatório
function generateReport() {
  console.log('');
  console.log(`${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║           📊 RELATÓRIO FINAL          ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════╝${colors.reset}`);
  console.log('');
  log.success(`📦 Arquivos movidos: ${stats.filesMoved}`);
  log.success(`🔧 Imports corrigidos: ${stats.importsFixed}`);
  
  if (fs.existsSync(config.backupDir)) {
    log.warning(`💾 Backup salvo em: ${config.backupDir}`);
  }
  
  console.log('');
  console.log(`${colors.blue}📝 Próximos passos:${colors.reset}`);
  console.log(`  1. Verifique os arquivos em ${colors.green}${config.correctDir}${colors.reset}`);
  console.log(`  2. Teste a aplicação: ${colors.green}npm run dev${colors.reset}`);
  console.log(`  3. Se OK, delete o backup: ${colors.yellow}rm -rf ${config.backupDir}${colors.reset}`);
  console.log('');
}

// Função principal
function main() {
  console.log(`${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  🔧 MIGRAÇÃO DE MODELOS - CRM SYSTEM  ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════╝${colors.reset}`);
  console.log('');
  
  // Verificar se está na raiz
  if (!fs.existsSync('package.json')) {
    log.error('Execute na raiz do projeto Next.js');
    process.exit(1);
  }
  
  // Criar estrutura correta
  ensureDir(config.correctDir);
  console.log('');
  
  // Mover modelos
  config.wrongDirs.forEach(dir => moveModels(dir));
  console.log('');
  
  // Corrigir imports
  fixAllImports();
  console.log('');
  
  // Verificar estrutura
  verifyStructure();
  
  // Gerar relatório
  generateReport();
  
  log.success('Migração concluída!');
}

// Executar
main();