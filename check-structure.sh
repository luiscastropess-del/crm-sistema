#!/bin/bash

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🔍 VERIFICAÇÃO DE ESTRUTURA       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Verificar se está na raiz
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Execute na raiz do projeto${NC}"
  exit 1
fi

HAS_ERRORS=false

# 1. Verificar diretórios incorretos
echo -e "${YELLOW}📁 Verificando diretórios incorretos...${NC}"
WRONG_DIRS=("models" "app/models" "src/models")

for dir in "${WRONG_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    file_count=$(find "$dir" -name "*.ts" 2>/dev/null | wc -l)
    if [ $file_count -gt 0 ]; then
      echo -e "${RED}❌ ERRO: /$dir existe com $file_count arquivos .ts${NC}"
      HAS_ERRORS=true
    else
      echo -e "${YELLOW}⚠️  /$dir existe mas está vazio${NC}"
    fi
  fi
done

# 2. Verificar diretório correto
echo ""
echo -e "${YELLOW}📁 Verificando diretório correto...${NC}"
CORRECT_DIR="lib/db/models"

if [ ! -d "$CORRECT_DIR" ]; then
  echo -e "${RED}❌ ERRO: /$CORRECT_DIR não existe${NC}"
  HAS_ERRORS=true
else
  echo -e "${GREEN}✅ /$CORRECT_DIR existe${NC}"
  
  # Listar modelos esperados
  EXPECTED_MODELS=("User" "Customer" "Lead" "Deal" "Task" "Activity")
  
  for model in "${EXPECTED_MODELS[@]}"; do
    if [ -f "$CORRECT_DIR/$model.ts" ]; then
      echo -e "${GREEN}  ✅ $model.ts${NC}"
    else
      echo -e "${YELLOW}  ⚠️  $model.ts não encontrado${NC}"
    fi
  done
fi

# 3. Verificar imports incorretos
echo ""
echo -e "${YELLOW}🔍 Verificando imports incorretos...${NC}"

WRONG_IMPORTS=$(grep -r "from ['\"]@/models/" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
WRONG_IMPORTS_APP=$(grep -r "from ['\"]@/app/models/" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
WRONG_IMPORTS_RELATIVE=$(grep -r "from ['\"].*\/models/" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)

TOTAL_WRONG=$((WRONG_IMPORTS + WRONG_IMPORTS_APP + WRONG_IMPORTS_RELATIVE))

if [ $TOTAL_WRONG -gt 0 ]; then
  echo -e "${RED}❌ Encontrados $TOTAL_WRONG imports incorretos${NC}"
  echo -e "${BLUE}   Exemplos:${NC}"
  grep -r "from ['\"]@/models/" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next -n 2>/dev/null | head -3
  HAS_ERRORS=true
else
  echo -e "${GREEN}✅ Nenhum import incorreto encontrado${NC}"
fi

# 4. Verificar arquivos essenciais
echo ""
echo -e "${YELLOW}📄 Verificando arquivos essenciais...${NC}"

ESSENTIAL_FILES=(
  "lib/db/mongodb.ts"
  "lib/auth/utils.ts"
  "lib/services/cache.ts"
  "lib/validations/auth.ts"
)

for file in "${ESSENTIAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}  ✅ $file${NC}"
  else
    echo -e "${YELLOW}  ⚠️  $file não encontrado${NC}"
  fi
done

# 5. Resultado final
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           📊 RESULTADO FINAL          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

if [ "$HAS_ERRORS" = true ]; then
  echo -e "${RED}❌ ESTRUTURA INCORRETA!${NC}"
  echo ""
  echo -e "${YELLOW}🔧 Para corrigir, execute:${NC}"
  echo -e "${GREEN}   chmod +x migrate-models.sh${NC}"
  echo -e "${GREEN}   ./migrate-models.sh${NC}"
  exit 1
else
  echo -e "${GREEN}✅ ESTRUTURA CORRETA!${NC}"
  echo -e "${GREEN}   Tudo está no lugar certo! 🎉${NC}"
  exit 0
fi