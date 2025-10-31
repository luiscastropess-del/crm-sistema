'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PerfilPage() {
  const router = useRouter()
  const [abaSelecionada, setAbaSelecionada] = useState('perfil')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' })

  // Dados do perfil
  const [perfil, setPerfil] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    cargo: '',
    avatar: ''
  })

  // Alteração de senha
  const [senhas, setSenhas] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  })

  // Configurações
  const [configuracoes, setConfiguracoes] = useState({
    notificacoesEmail: true,
    notificacoesPush: true,
    notificacoesLeads: true,
    notificacoesVendas: true,
    notificacoesTarefas: true,
    tema: 'claro',
    idioma: 'pt-BR',
    fusoHorario: 'America/Sao_Paulo'
  })

  useEffect(() => {
    carregarPerfil()
  }, [])

  const carregarPerfil = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/perfil', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await res.json()
      if (data.sucesso) {
        setPerfil(data.perfil)
        if (data.perfil.configuracoes) {
          setConfiguracoes({ ...configuracoes, ...data.perfil.configuracoes })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    } finally {
      setCarregando(false)
    }
  }

  const salvarPerfil = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setMensagem({ tipo: '', texto: '' })

    try {
      const token = localStorage.getItem('token')

      const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(perfil)
      })

      const data = await res.json()
      if (data.sucesso) {
        setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso!' })
        setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000)
      } else {
        setMensagem({ tipo: 'erro', texto: data.erro || 'Erro ao atualizar perfil' })
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      setMensagem({ tipo: 'erro', texto: 'Erro ao atualizar perfil' })
    } finally {
      setSalvando(false)
    }
  }

  const alterarSenha = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setMensagem({ tipo: '', texto: '' })

    // Validações
    if (senhas.novaSenha.length < 6) {
      setMensagem({ tipo: 'erro', texto: 'A nova senha deve ter no mínimo 6 caracteres' })
      setSalvando(false)
      return
    }

    if (senhas.novaSenha !== senhas.confirmarSenha) {
      setMensagem({ tipo: 'erro', texto: 'As senhas não coincidem' })
      setSalvando(false)
      return
    }

    try {
      const token = localStorage.getItem('token')

      const res = await fetch('/api/perfil/alterar-senha', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senhaAtual: senhas.senhaAtual,
          novaSenha: senhas.novaSenha
        })
      })

      const data = await res.json()
      if (data.sucesso) {
        setMensagem({ tipo: 'sucesso', texto: 'Senha alterada com sucesso!' })
        setSenhas({ senhaAtual: '', novaSenha: '', confirmarSenha: '' })
        setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000)
      } else {
        setMensagem({ tipo: 'erro', texto: data.erro || 'Erro ao alterar senha' })
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      setMensagem({ tipo: 'erro', texto: 'Erro ao alterar senha' })
    } finally {
      setSalvando(false)
    }
  }

  const salvarConfiguracoes = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setMensagem({ tipo: '', texto: '' })

    try {
      const token = localStorage.getItem('token')

      const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ configuracoes })
      })

      const data = await res.json()
      if (data.sucesso) {
        setMensagem({ tipo: 'sucesso', texto: 'Configurações salvas com sucesso!' })
        setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000)
      } else {
        setMensagem({ tipo: 'erro', texto: data.erro || 'Erro ao salvar configurações' })
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar configurações' })
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

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
              <h1 className="text-2xl font-bold text-gray-900">👤 Meu Perfil</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-3">
                  {perfil.avatar || '👤'}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{perfil.nome}</h3>
                <p className="text-sm text-gray-600">{perfil.email}</p>
              </div>

              {/* Menu de Abas */}
              <nav className="space-y-2">
                <button
                  onClick={() => setAbaSelecionada('perfil')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    abaSelecionada === 'perfil'
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  📝 Dados Pessoais
                </button>
                <button
                  onClick={() => setAbaSelecionada('senha')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    abaSelecionada === 'senha'
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🔒 Alterar Senha
                </button>
                <button
                  onClick={() => setAbaSelecionada('configuracoes')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    abaSelecionada === 'configuracoes'
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ⚙️ Configurações
                </button>
              </nav>

              {/* Informações Adicionais */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Membro desde:</span>
                    <p className="text-gray-900">
                      {perfil.criadoEm 
                        ? new Date(perfil.criadoEm).toLocaleDateString('pt-BR')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Última atualização:</span>
                    <p className="text-gray-900">
                      {perfil.atualizadoEm 
                        ? new Date(perfil.atualizadoEm).toLocaleDateString('pt-BR')
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Aba: Dados Pessoais */}
              {abaSelecionada === 'perfil' && (
                <form onSubmit={salvarPerfil}>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">📝 Dados Pessoais</h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={perfil.nome}
                          onChange={(e) => setPerfil({...perfil, nome: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          disabled
                          value={perfil.email}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          value={perfil.telefone}
                          onChange={(e) => setPerfil({...perfil, telefone: e.target.value})}
                          placeholder="(00) 00000-0000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Empresa
                        </label>
                        <input
                          type="text"
                          value={perfil.empresa}
                          onChange={(e) => setPerfil({...perfil, empresa: e.target.value})}
                          placeholder="Nome da empresa"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cargo
                      </label>
                      <input
                        type="text"
                        value={perfil.cargo}
                        onChange={(e) => setPerfil({...perfil, cargo: e.target.value})}
                        placeholder="Seu cargo na empresa"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Avatar (Emoji)
                      </label>
                      <input
                        type="text"
                        value={perfil.avatar}
                        onChange={(e) => setPerfil({...perfil, avatar: e.target.value})}
                        placeholder="😀"
                        maxLength={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Escolha um emoji para seu avatar</p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      disabled={salvando}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {salvando ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button
                      type="button"
                      onClick={carregarPerfil}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Aba: Alterar Senha */}
              {abaSelecionada === 'senha' && (
                <form onSubmit={alterarSenha}>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">🔒 Alterar Senha</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senha Atual *
                      </label>
                      <input
                        type="password"
                        required
                        value={senhas.senhaAtual}
                        onChange={(e) => setSenhas({...senhas, senhaAtual: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nova Senha *
                      </label>
                      <input
                        type="password"
                        required
                        value={senhas.novaSenha}
                        onChange={(e) => setSenhas({...senhas, novaSenha: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Nova Senha *
                      </label>
                      <input
                        type="password"
                        required
                        value={senhas.confirmarSenha}
                        onChange={(e) => setSenhas({...senhas, confirmarSenha: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">⚠️</span>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Atenção</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Após alterar sua senha, você precisará fazer login novamente.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      disabled={salvando}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {salvando ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSenhas({ senhaAtual: '', novaSenha: '', confirmarSenha: '' })}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Limpar
                    </button>
                  </div>
                </form>
              )}

              {/* Aba: Configurações */}
              {abaSelecionada === 'configuracoes' && (
                <form onSubmit={salvarConfiguracoes}>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">⚙️ Configurações</h2>

                  <div className="space-y-6">
                    {/* Notificações */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔔 Notificações</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <span className="text-gray-700">Notificações por Email</span>
                          <input
                            type="checkbox"
                            checked={configuracoes.notificacoesEmail}
                            onChange={(e) => setConfiguracoes({...configuracoes, notificacoesEmail: e.target.checked})}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <span className="text-gray-700">Notificações Push</span>
                          <input
                            type="checkbox"
                            checked={configuracoes.notificacoesPush}
                            onChange={(e) => setConfiguracoes({...configuracoes, notificacoesPush: e.target.checked})}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <span className="text-gray-700">Notificar sobre Novos Leads</span>
                          <input
                            type="checkbox"
                            checked={configuracoes.notificacoesLeads}
                            onChange={(e) => setConfiguracoes({...configuracoes, notificacoesLeads: e.target.checked})}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <span className="text-gray-700">Notificar sobre Vendas</span>
                          <input
                            type="checkbox"
                            checked={configuracoes.notificacoesVendas}
                            onChange={(e) => setConfiguracoes({...configuracoes, notificacoesVendas: e.target.checked})}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <span className="text-gray-700">Notificar sobre Tarefas</span>
                          <input
                            type="checkbox"
                            checked={configuracoes.notificacoesTarefas}
                            onChange={(e) => setConfiguracoes({...configuracoes, notificacoesTarefas: e.target.checked})}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Preferências */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Preferências</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tema
                          </label>
                          <select
                            value={configuracoes.tema}
                            onChange={(e) => setConfiguracoes({...configuracoes, tema: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="claro">Claro</option>
                            <option value="escuro">Escuro</option>
                            <option value="auto">Automático</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Idioma
                          </label>
                          <select
                            value={configuracoes.idioma}
                            onChange={(e) => setConfiguracoes({...configuracoes, idioma: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="pt-BR">Português (Brasil)</option>
                            <option value="en-US">English (US)</option>
                            <option value="es-ES">Español</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fuso Horário
                          </label>
                          <select
                            value={configuracoes.fusoHorario}
                            onChange={(e) => setConfiguracoes({...configuracoes, fusoHorario: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                            <option value="America/New_York">Nova York (GMT-5)</option>
                            <option value="Europe/London">Londres (GMT+0)</option>
                            <option value="Asia/Tokyo">Tóquio (GMT+9)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      disabled={salvando}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {salvando ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                    <button
                      type="button"
                      onClick={carregarPerfil}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}