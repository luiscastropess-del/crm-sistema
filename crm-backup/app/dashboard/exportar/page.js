'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ExportarPage() {
  const router = useRouter()
  const [tipoExportacao, setTipoExportacao] = useState('clientes')
  const [formato, setFormato] = useState('csv')
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    status: 'todos',
    incluirInativos: false
  })
  const [exportando, setExportando] = useState(false)
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' })
  const [historico, setHistorico] = useState([])

  const tiposDisponiveis = [
    { valor: 'clientes', label: '👥 Clientes', descricao: 'Exportar lista de clientes' },
    { valor: 'leads', label: '🎯 Leads', descricao: 'Exportar lista de leads' },
    { valor: 'vendas', label: '💰 Vendas', descricao: 'Exportar histórico de vendas' },
    { valor: 'tarefas', label: '✅ Tarefas', descricao: 'Exportar lista de tarefas' },
    { valor: 'atividades', label: '📋 Atividades', descricao: 'Exportar log de atividades' },
    { valor: 'relatorio-completo', label: '📊 Relatório Completo', descricao: 'Exportar todos os dados' }
  ]

  const formatosDisponiveis = [
    { valor: 'csv', label: 'CSV', icone: '📄', descricao: 'Arquivo CSV (Excel, Google Sheets)' },
    { valor: 'json', label: 'JSON', icone: '📋', descricao: 'Formato JSON para desenvolvedores' },
    { valor: 'excel', label: 'Excel', icone: '📊', descricao: 'Arquivo Excel (.xlsx)' }
  ]

  const exportarDados = async () => {
    setExportando(true)
    setMensagem({ tipo: '', texto: '' })

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      // Construir query params
      const params = new URLSearchParams({
        tipo: tipoExportacao,
        formato: formato,
        ...filtros
      })

      const res = await fetch(`/api/exportar?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!res.ok) {
        throw new Error('Erro ao exportar dados')
      }

      // Obter o blob do arquivo
      const blob = await res.blob()
      
      // Determinar o nome e extensão do arquivo
      let extensao = formato
      if (formato === 'excel') extensao = 'xlsx'
      
      const nomeArquivo = `${tipoExportacao}_${new Date().toISOString().split('T')[0]}.${extensao}`

      // Criar link de download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nomeArquivo
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setMensagem({ 
        tipo: 'sucesso', 
        texto: `Dados exportados com sucesso! Download iniciado: ${nomeArquivo}` 
      })

      // Adicionar ao histórico
      const novaExportacao = {
        id: Date.now(),
        tipo: tipoExportacao,
        formato: formato,
        arquivo: nomeArquivo,
        data: new Date().toISOString()
      }
      setHistorico([novaExportacao, ...historico])

    } catch (error) {
      console.error('Erro ao exportar:', error)
      setMensagem({ 
        tipo: 'erro', 
        texto: 'Erro ao exportar dados. Tente novamente.' 
      })
    } finally {
      setExportando(false)
    }
  }

  const tipoSelecionado = tiposDisponiveis.find(t => t.valor === tipoExportacao)
  const formatoSelecionado = formatosDisponiveis.find(f => f.valor === formato)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Voltar
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">📥 Exportar Dados</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensagem de Feedback */}
        {mensagem.texto && (
          <div className={`mb-6 p-4 rounded-lg ${
            mensagem.tipo === 'sucesso' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {mensagem.tipo === 'sucesso' ? '✅' : '❌'}
              </span>
              <span>{mensagem.texto}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de Exportação */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selecionar Tipo de Dados */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">1️⃣ Selecione o Tipo de Dados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tiposDisponiveis.map(tipo => (
                  <button
                    key={tipo.valor}
                    onClick={() => setTipoExportacao(tipo.valor)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      tipoExportacao === tipo.valor
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">{tipo.label}</div>
                    <div className="text-sm text-gray-600">{tipo.descricao}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selecionar Formato */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">2️⃣ Selecione o Formato</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {formatosDisponiveis.map(fmt => (
                  <button
                    key={fmt.valor}
                    onClick={() => setFormato(fmt.valor)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      formato === fmt.valor
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{fmt.icone}</div>
                    <div className="font-semibold text-gray-900 mb-1">{fmt.label}</div>
                    <div className="text-xs text-gray-600">{fmt.descricao}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filtros Avançados */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">3️⃣ Filtros (Opcional)</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Início
                    </label>
                    <input
                      type="date"
                      value={filtros.dataInicio}
                      onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Fim
                    </label>
                    <input
                      type="date"
                      value={filtros.dataFim}
                      onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {(tipoExportacao === 'clientes' || tipoExportacao === 'leads') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filtros.status}
                      onChange={(e) => setFiltros({...filtros, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="todos">Todos</option>
                      <option value="ativo">Apenas Ativos</option>
                      <option value="inativo">Apenas Inativos</option>
                    </select>
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtros.incluirInativos}
                    onChange={(e) => setFiltros({...filtros, incluirInativos: e.target.checked})}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Incluir registros inativos</span>
                </label>
              </div>
            </div>

            {/* Botão de Exportação */}
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={exportarDados}
                disabled={exportando}
                className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
              >
                {exportando ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Exportando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    📥 Exportar {tipoSelecionado?.label}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar - Resumo e Histórico */}
          <div className="space-y-6">
            {/* Resumo da Exportação */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Resumo</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{tipoSelecionado?.label.split(' ')[0]}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Tipo de Dados</p>
                    <p className="text-sm text-gray-600">{tipoSelecionado?.label}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">{formatoSelecionado?.icone}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Formato</p>
                    <p className="text-sm text-gray-600">{formatoSelecionado?.label}</p>
                  </div>
                </div>

                {(filtros.dataInicio || filtros.dataFim) && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📅</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Período</p>
                      <p className="text-sm text-gray-600">
                        {filtros.dataInicio && new Date(filtros.dataInicio).toLocaleDateString('pt-BR')}
                        {filtros.dataInicio && filtros.dataFim && ' - '}
                        {filtros.dataFim && new Date(filtros.dataFim).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informações */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-xl">ℹ️</span>
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">Dica</p>
                  <p className="text-sm text-blue-700">
                    Os arquivos CSV podem ser abertos no Excel, Google Sheets ou qualquer editor de planilhas.
                  </p>
                </div>
              </div>
            </div>

            {/* Histórico de Exportações */}
            {historico.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📜 Histórico</h3>
                <div className="space-y-3">
                  {historico.slice(0, 5).map(exp => (
                    <div key={exp.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{exp.arquivo}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(exp.data).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estatísticas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Exportações hoje</span>
                  <span className="font-semibold text-gray-900">{historico.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Formato mais usado</span>
                  <span className="font-semibold text-gray-900">CSV</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guia de Uso */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📖 Como Usar</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">1️⃣</div>
              <h4 className="font-semibold text-gray-900 mb-1">Escolha os Dados</h4>
              <p className="text-sm text-gray-600">
                Selecione o tipo de dados que deseja exportar: clientes, leads, vendas, etc.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">2️⃣</div>
              <h4 className="font-semibold text-gray-900 mb-1">Selecione o Formato</h4>
              <p className="text-sm text-gray-600">
                Escolha entre CSV (Excel), JSON (desenvolvedores) ou Excel (.xlsx).
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">3️⃣</div>
              <h4 className="font-semibold text-gray-900 mb-1">Aplique Filtros</h4>
              <p className="text-sm text-gray-600">
                Opcionalmente, filtre por período, status ou outras opções disponíveis.
              </p>
            </div>
          </div>
        </div>

        {/* Formatos Suportados */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📄 Formatos Suportados</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl mb-2">📄</div>
              <h4 className="font-semibold text-gray-900 mb-1">CSV</h4>
              <p className="text-sm text-gray-600 mb-2">
                Formato universal compatível com Excel, Google Sheets e outras planilhas.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>✓ Fácil de importar</li>
                <li>✓ Tamanho reduzido</li>
                <li>✓ Compatível com tudo</li>
              </ul>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl mb-2">📋</div>
              <h4 className="font-semibold text-gray-900 mb-1">JSON</h4>
              <p className="text-sm text-gray-600 mb-2">
                Formato estruturado ideal para desenvolvedores e integrações.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>✓ Estrutura completa</li>
                <li>✓ Fácil de processar</li>
                <li>✓ Para APIs</li>
              </ul>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold text-gray-900 mb-1">Excel (.xlsx)</h4>
              <p className="text-sm text-gray-600 mb-2">
                Arquivo Excel nativo com formatação e múltiplas planilhas.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>✓ Formatação rica</li>
                <li>✓ Múltiplas abas</li>
                <li>✓ Gráficos inclusos</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}