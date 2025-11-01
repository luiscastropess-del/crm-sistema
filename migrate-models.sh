#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔧 MIGRAÇÃO DE MODELOS - CRM SYSTEM  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Variáveis
WRONG_DIRS=("models" "app/models" "src/models")
CORRECT_DIR="lib/db/models"
BACKUP_DIR="backup_models_$(date +%Y%m%d_%H%M%S)"
FILES_MOVED=0
IMPORTS_FIXED=0

# Função para criar diretório correto
create_correct_structure() {
  echo -e "${YELLOW}📁 Criando estrutura correta...${NC}"
  mkdir -p "$CORRECT_DIR"
  echo -e "${GREEN}✅ Diretório $CORRECT_DIR criado${NC}"
}

# Função para fazer backup
create_backup() {
  local source_dir=$1
  echo -e "${YELLOW}💾 Criando backup de $source_dir...${NC}"
  mkdir -p "$BACKUP_DIR"
  cp -r "$source_dir" "$BACKUP_DIR/"
  echo -e "${GREEN}✅ Backup criado em $BACKUP_DIR${NC}"
}

# Função para mover arquivos
move_models() {
  local source_dir=$1
  
  if [ ! -d "$source_dir" ]; then
    return
  fi
  
  echo -e "${YELLOW}🔄 Verificando $source_dir...${NC}"
  
  # Verificar se há arquivos .ts
  if [ -z "$(ls -A $source_dir/*.ts 2>/dev/null)" ]; then
    echo -e "${BLUE}ℹ️  Nenhum arquivo .ts encontrado em $source_dir${NC}"
    return
  fi
  
  # Criar backup
  create_backup "$source_dir"
  
  # Mover arquivos
  for file in "$source_dir"/*.ts; do
    if [ -f "$file" ]; then
      filename=$(basename "$file")
      
      # Verificar se arquivo já existe no destino
      if [ -f "$CORRECT_DIR/$filename" ]; then
        echo -e "${YELLOW}⚠️  $filename já existe no destino. Pulando...${NC}"
        continue
      fi
      
      echo -e "${BLUE}  📦 Movendo $filename...${NC}"
      mv "$file" "$CORRECT_DIR/"
      FILES_MOVED=$((FILES_MOVED + 1))
      echo -e "${GREEN}  ✅ $filename movido${NC}"
    fi
  done
  
  # Remover diretório vazio
  if [ -z "$(ls -A $source_dir)" ]; then
    rmdir "$source_dir"
    echo -e "${GREEN}✅ Diretório vazio $source_dir removido${NC}"
  fi
}

# Função para corrigir imports
fix_imports() {
  echo -e "${YELLOW}🔧 Corrigindo imports em arquivos TypeScript...${NC}"
  
  # Padrões de import incorretos
  declare -a patterns=(
    "from '@/models/"
    "from \"@/models/"
    "from './models/"
    "from \"./models/"
    "from '../models/"
    "from \"../models/"
    "from '../../models/"
    "from \"../../models/"
    "from '@/app/models/"
    "from \"@/app/models/"
    "from '@/src/models/"
    "from \"@/src/models/"
  )
  
  # Buscar e corrigir em todos os arquivos .ts e .tsx
  find . -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "./node_modules/*" ! -path "./.next/*" ! -path "./backup_*/*" | while read file; do
    local file_changed=false
    
    for pattern in "${patterns[@]}"; do
      if grep -q "$pattern" "$file"; then
        # Fazer backup do arquivo
        cp "$file" "$file.bak"
        
        # Substituir imports
        sed -i.tmp "s|from ['\"]@/models/|from '@/lib/db/models/|g" "$file"
        sed -i.tmp "s|from ['\"]./models/|from '@/lib/db/models/|g" "$file"
        sed -i.tmp "s|from ['\"]../models/|from '@/lib/db/models/|g" "$file"
        sed -i.tmp "s|from ['\"]../../models/|from '@/lib/db/models/|g" "$file"
        sed -i.tmp "s|from ['\"]@/app/models/|from '@/lib/db/models/|g" "$file"
        sed -i.tmp "s|from ['\"]@/src/models/|from '@/lib/db/models/|g" "$file"
        
        # Remover arquivo temporário
        rm -f "$file.tmp"
        
        file_changed=true
        IMPORTS_FIXED=$((IMPORTS_FIXED + 1))
        echo -e "${GREEN}  ✅ Corrigido: $file${NC}"
        break
      fi
    done
  done
}

# Função para verificar estrutura final
verify_structure() {
  echo -e "${YELLOW}🔍 Verificando estrutura final...${NC}"
  echo ""
  
  # Verificar diretórios incorretos
  local has_errors=false
  for dir in "${WRONG_DIRS[@]}"; do
    if [ -d "$dir" ] && [ -n "$(ls -A $dir/*.ts 2>/dev/null)" ]; then
      echo -e "${RED}❌ ERRO: $dir ainda contém arquivos .ts${NC}"
      has_errors=true
    fi
  done
  
  # Verificar diretório correto
  if [ ! -d "$CORRECT_DIR" ]; then
    echo -e "${RED}❌ ERRO: $CORRECT_DIR não existe${NC}"
    has_errors=true
  else
    echo -e "${GREEN}✅ $CORRECT_DIR existe${NC}"
    
    # Listar modelos
    if [ -n "$(ls -A $CORRECT_DIR/*.ts 2>/dev/null)" ]; then
      echo -e "${BLUE}📋 Modelos encontrados:${NC}"
      for file in "$CORRECT_DIR"/*.ts; do
        filename=$(basename "$file")
        echo -e "${GREEN}  ✅ $filename${NC}"
      done
    else
      echo -e "${YELLOW}⚠️  Nenhum modelo encontrado em $CORRECT_DIR${NC}"
    fi
  fi
  
  echo ""
  if [ "$has_errors" = false ]; then
    echo -e "${GREEN}✅ Estrutura verificada com sucesso!${NC}"
  else
    echo -e "${RED}❌ Estrutura contém erros!${NC}"
  fi
}

# Função para gerar relatório
generate_report() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║           📊 RELATÓRIO FINAL          ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${GREEN}📦 Arquivos movidos: $FILES_MOVED${NC}"
  echo -e "${GREEN}🔧 Imports corrigidos: $IMPORTS_FIXED${NC}"
  
  if [ -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}💾 Backup salvo em: $BACKUP_DIR${NC}"
  fi
  
  echo ""
  echo -e "${BLUE}📝 Próximos passos:${NC}"
  echo -e "  1. Verifique os arquivos em ${GREEN}$CORRECT_DIR${NC}"
  echo -e "  2. Teste a aplicação: ${GREEN}npm run dev${NC}"
  echo -e "  3. Se tudo estiver OK, delete o backup: ${YELLOW}rm -rf $BACKUP_DIR${NC}"
  echo ""
}

# EXECUÇÃO PRINCIPAL
main() {
  # Verificar se está na raiz do projeto
  if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ ERRO: Execute este script na raiz do projeto Next.js${NC}"
    exit 1
  fi
  
  # Criar estrutura correta
  create_correct_structure
  echo ""
  
  # Mover modelos de diretórios incorretos
  for dir in "${WRONG_DIRS[@]}"; do
    move_models "$dir"
  done
  echo ""
  
  # Corrigir imports
  fix_imports
  echo ""
  
  # Verificar estrutura final
  verify_structure
  
  # Gerar relatório
  generate_report
  
  echo -e "${GREEN}✅ Migração concluída!${NC}"
}

# Executar
main