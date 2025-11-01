#!/usr/bin/env python3

import os
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Tuple

# Cores ANSI
class Colors:
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    RESET = '\033[0m'

# Configuração
CORRECT_IMPORT = '@/lib/db/models/'
EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '.git']
EXTENSIONS = ['.ts', '.tsx']

# Padrões de import incorretos
WRONG_PATTERNS = [
    {
        'regex': re.compile(r"from\s+['\"]@/models/"),
        'description': "Import usando @/models/",
    },
    {
        'regex': re.compile(r"from\s+['\"]@/app/models/"),
        'description': "Import usando @/app/models/",
    },
    {
        'regex': re.compile(r"from\s+['\"]@/src/models/"),
        'description': "Import usando @/src/models/",
    },
    {
        'regex': re.compile(r"from\s+['\"]\.\/models/"),
        'description': "Import relativo ./models/",
    },
    {
        'regex': re.compile(r"from\s+['\"]\.\.\/models/"),
        'description': "Import relativo ../models/",
    },
    {
        'regex': re.compile(r"from\s+['\"]\.\.\/\.\.\/models/"),
        'description': "Import relativo ../../models/",
    },
]

# Estatísticas
stats = {
    'total_files': 0,
    'problematic_files': [],
    'issues_by_type': {},
    'total_issues': 0,
}

def should_ignore(path: str) -> bool:
    """Verificar se deve ignorar diretório/arquivo"""
    return any(excluded in path for excluded in EXCLUDE_DIRS) or 'backup_' in path

def scan_file(file_path: str) -> List[Dict]:
    """Escanear arquivo em busca de imports incorretos"""
    issues = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        for line_num, line in enumerate(lines, 1):
            for pattern in WRONG_PATTERNS:
                if pattern['regex'].search(line):
                    # Sugerir correção
                    corrected = re.sub(
                        r"from\s+['\"](@/)?(app/|src/)?\.*(/)?(models/)",
                        f"from '{CORRECT_IMPORT}",
                        line
                    )
                    
                    issues.append({
                        'line_number': line_num,
                        'line': line.strip(),
                        'corrected': corrected.strip(),
                        'type': pattern['description'],
                    })
                    
                    # Atualizar estatísticas
                    desc = pattern['description']
                    stats['issues_by_type'][desc] = stats['issues_by_type'].get(desc, 0) + 1
                    stats['total_issues'] += 1
                    
    except Exception as e:
        print(f"{Colors.RED}Erro ao ler {file_path}: {e}{Colors.RESET}")
        
    return issues

def scan_directory(directory: str = '.'):
    """Escanear diretório recursivamente"""
    for root, dirs, files in os.walk(directory):
        # Filtrar diretórios
        dirs[:] = [d for d in dirs if not should_ignore(os.path.join(root, d))]
        
        for file in files:
            if any(file.endswith(ext) for ext in EXTENSIONS):
                file_path = os.path.join(root, file)
                stats['total_files'] += 1
                
                # Mostrar progresso
                if stats['total_files'] % 10 == 0:
                    print(f"\r{Colors.BLUE}   Escaneados: {stats['total_files']} arquivos...{Colors.RESET}", end='')
                
                issues = scan_file(file_path)
                if issues:
                    stats['problematic_files'].append({
                        'path': file_path,
                        'issues': issues,
                    })

def show_summary():
    """Exibir resumo"""
    print('\n')
    print(f"{Colors.BLUE}╔{'═' * 50}╗{Colors.RESET}")
    print(f"{Colors.BLUE}║{'📊 RESUMO'.center(50)}║{Colors.RESET}")
    print(f"{Colors.BLUE}╚{'═' * 50}╝{Colors.RESET}\n")
    
    print(f"{Colors.CYAN}📁 Total de arquivos escaneados: {Colors.GREEN}{stats['total_files']}{Colors.RESET}")
    print(f"{Colors.CYAN}📄 Arquivos com problemas: {Colors.RED}{len(stats['problematic_files'])}{Colors.RESET}")
    print(f"{Colors.CYAN}⚠️  Total de issues: {Colors.RED}{stats['total_issues']}{Colors.RESET}\n")
    
    if stats['issues_by_type']:
        print(f"{Colors.YELLOW}📋 Tipos de problemas encontrados:{Colors.RESET}\n")
        for issue_type, count in stats['issues_by_type'].items():
            print(f"  {Colors.RED}•{Colors.RESET} {issue_type}: {Colors.YELLOW}{count}{Colors.RESET} ocorrências")
        print()

def show_file_details(file_data: Dict):
    """Exibir detalhes de um arquivo"""
    print(f"{Colors.YELLOW}{'━' * 50}{Colors.RESET}")
    print(f"{Colors.CYAN}📄 Arquivo: {Colors.MAGENTA}{file_data['path']}{Colors.RESET}")
    print(f"{Colors.YELLOW}{'━' * 50}{Colors.RESET}\n")
    
    for issue in file_data['issues']:
        print(f"{Colors.RED}  ❌ Linha {issue['line_number']}:{Colors.RESET}")
        print(f"{Colors.BLUE}     {issue['line']}{Colors.RESET}")
        print(f"{Colors.GREEN}     ✅ Sugestão: {issue['corrected']}{Colors.RESET}\n")

def show_detailed_issues():
    """Exibir todos os arquivos problemáticos"""
    if not stats['problematic_files']:
        return
    
    print(f"{Colors.BLUE}╔{'═' * 50}╗{Colors.RESET}")
    print(f"{Colors.BLUE}║{'📝 ARQUIVOS PROBLEMÁTICOS'.center(50)}║{Colors.RESET}")
    print(f"{Colors.BLUE}╚{'═' * 50}╝{Colors.RESET}\n")
    
    for file_data in stats['problematic_files']:
        show_file_details(file_data)

def generate_report() -> str:
    """Gerar relatório em arquivo"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    report_file = f'import-audit-report-{timestamp}.txt'
    
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write('╔══════════════════════════════════════════════════╗\n')
        f.write('║     RELATÓRIO DE AUDITORIA DE IMPORTS           ║\n')
        f.write('╚══════════════════════════════════════════════════╝\n\n')
        f.write(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Projeto: {os.path.basename(os.getcwd())}\n\n")
        f.write('════════════════════════════════════════════════════\n')
        f.write('RESUMO\n')
        f.write('════════════════════════════════════════════════════\n\n')
        f.write(f"Total de arquivos escaneados: {stats['total_files']}\n")
        f.write(f"Arquivos com problemas: {len(stats['problematic_files'])}\n")
        f.write(f"Total de issues encontrados: {stats['total_issues']}\n\n")
        
        if stats['problematic_files']:
            f.write('════════════════════════════════════════════════════\n')
            f.write('TIPOS DE PROBLEMAS\n')
            f.write('════════════════════════════════════════════════════\n\n')
            
            for issue_type, count in stats['issues_by_type'].items():
                f.write(f"  • {issue_type}: {count} ocorrências\n")
            
            f.write('\n════════════════════════════════════════════════════\n')
            f.write('ARQUIVOS PROBLEMÁTICOS\n')
            f.write('════════════════════════════════════════════════════\n\n')
            
            for file_data in stats['problematic_files']:
                f.write('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
                f.write(f"📄 {file_data['path']}\n")
                f.write('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n')
                
                for issue in file_data['issues']:
                    f.write(f"  ❌ Linha {issue['line_number']}:\n")
                    f.write(f"     {issue['line']}\n")
                    f.write(f"     ✅ Sugestão: {issue['corrected']}\n\n")
            
            f.write('════════════════════════════════════════════════════\n')
            f.write('COMANDO PARA CORRIGIR\n')
            f.write('════════════════════════════════════════════════════\n\n')
            f.write('Execute o script de migração para corrigir automaticamente:\n')
            f.write('  ./migrate-models.sh\n')
            f.write('  OU\n')
            f.write('  node migrate-models.js\n\n')
    
    return report_file

def show_final_result(report_file: str):
    """Exibir resultado final"""
    print()
    print(f"{Colors.BLUE}╔{'═' * 50}╗{Colors.RESET}")
    print(f"{Colors.BLUE}║{'🎯 RESULTADO FINAL'.center(50)}║{Colors.RESET}")
    print(f"{Colors.BLUE}╚{'═' * 50}╝{Colors.RESET}\n")
    
    if not stats['problematic_files']:
        print(f"{Colors.GREEN}✅ PARABÉNS! Todos os imports estão corretos!{Colors.RESET}")
        print(f"{Colors.GREEN}   Todos os arquivos usam: @/lib/db/models/{Colors.RESET}\n")
    else:
        print(f"{Colors.RED}❌ ATENÇÃO! Foram encontrados problemas nos imports{Colors.RESET}\n")
        print(f"{Colors.YELLOW}📄 Relatório detalhado salvo em:{Colors.RESET}")
        print(f"   {Colors.CYAN}{report_file}{Colors.RESET}\n")
        print(f"{Colors.YELLOW}🔧 Para corrigir automaticamente, execute:{Colors.RESET}")
        print(f"   {Colors.GREEN}./migrate-models.sh{Colors.RESET}")
        print(f"   {Colors.GREEN}OU{Colors.RESET}")
        print(f"   {Colors.GREEN}node migrate-models.js{Colors.RESET}\n")

def main():
    """Função principal"""
    print(f"{Colors.BLUE}╔{'═' * 50}╗{Colors.RESET}")
    print(f"{Colors.BLUE}║{'🔍 AUDITORIA DE IMPORTS - CRM SYSTEM'.center(50)}║{Colors.RESET}")
    print(f"{Colors.BLUE}╚{'═' * 50}╝{Colors.RESET}\n")
    
    # Verificar se está na raiz
    if not os.path.exists('package.json'):
        print(f"{Colors.RED}❌ Execute este script na raiz do projeto Next.js{Colors.RESET}")
        sys.exit(1)
    
    # Escanear projeto
    print(f"{Colors.YELLOW}🔍 Escaneando projeto...{Colors.RESET}\n")
    scan_directory()
    print(f"\n{Colors.GREEN}   ✅ Escaneamento concluído: {stats['total_files']} arquivos{Colors.RESET}\n")
    
    # Exibir resumo
    show_summary()
    
    # Gerar relatório
    report_file = generate_report()
    
    # Menu interativo
    if stats['problematic_files']:
        print(f"{Colors.CYAN}{'═' * 50}{Colors.RESET}")
        response = input(f"{Colors.YELLOW}Deseja ver os detalhes de cada arquivo? (s/n): {Colors.RESET}")
        if response.lower() == 's':
            show_detailed_issues()
    
    # Resultado final
    show_final_result(report_file)
    
    # Exit code
    sys.exit(1 if stats['problematic_files'] else 0)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}⚠️  Auditoria cancelada pelo usuário{Colors.RESET}")
        sys.exit(1)
    except Exception as e:
        print(f"{Colors.RED}❌ Erro fatal: {e}{Colors.RESET}")
        sys.exit(1)