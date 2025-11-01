// scripts/seed.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Configurar dotenv
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI não está definido no .env.local');
  process.exit(1);
}

// ============================================
// DEFINIR SCHEMAS INLINE (para evitar problemas de import)
// ============================================

const UserSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    avatar: { type: String, default: null },
    empresa: { type: String },
    cargo: { type: String },
    telefone: { type: String },
    ativo: { type: Boolean, default: true },
    ultimoAcesso: { type: Date, default: null },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

const CustomerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nome: { type: String, required: true },
    email: { type: String },
    telefone: { type: String },
    empresa: { type: String },
    cargo: { type: String },
    endereco: { type: String },
    cidade: { type: String },
    estado: { type: String },
    cep: { type: String },
    cpfCnpj: { type: String },
    tipo: { type: String, enum: ['pessoa_fisica', 'pessoa_juridica'], default: 'pessoa_fisica' },
    status: { type: String, enum: ['ativo', 'inativo', 'bloqueado'], default: 'ativo' },
    observacoes: { type: String },
    tags: { type: [String], default: [] },
    valorTotal: { type: Number, default: 0 },
    ultimaCompra: { type: Date, default: null },
  },
  { timestamps: true }
);

const LeadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nome: { type: String, required: true },
    email: { type: String },
    telefone: { type: String },
    empresa: { type: String },
    cargo: { type: String },
    origem: { type: String, enum: ['site', 'indicacao', 'redes_sociais', 'evento', 'ligacao', 'email', 'outro'], default: 'site' },
    status: { type: String, enum: ['novo', 'contato', 'qualificado', 'proposta', 'negociacao', 'ganho', 'perdido'], default: 'novo' },
    interesse: { type: String },
    valorEstimado: { type: Number, default: 0 },
    probabilidade: { type: Number, default: 0 },
    dataContato: { type: Date, default: null },
    dataFollowup: { type: Date, default: null },
    observacoes: { type: String },
    tags: { type: [String], default: [] },
    convertidoParaCliente: { type: Boolean, default: false },
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  },
  { timestamps: true }
);

const DealSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    titulo: { type: String, required: true },
    descricao: { type: String },
    valor: { type: Number, required: true },
    status: { type: String, enum: ['em_andamento', 'ganho', 'perdido', 'cancelado'], default: 'em_andamento' },
    estagio: { type: String, enum: ['prospeccao', 'qualificacao', 'proposta', 'negociacao', 'fechamento'], default: 'prospeccao' },
    probabilidade: { type: Number, default: 50 },
    dataFechamentoPrevista: { type: Date, default: null },
    dataFechamentoReal: { type: Date, default: null },
    motivoPerda: { type: String },
    observacoes: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const ActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', default: null },
    tipo: { type: String, required: true, enum: ['ligacao', 'email', 'reuniao', 'tarefa', 'nota'] },
    titulo: { type: String, required: true },
    descricao: { type: String },
    status: { type: String, enum: ['pendente', 'concluido', 'cancelado'], default: 'pendente' },
    dataVencimento: { type: Date, default: null },
    dataConclusao: { type: Date, default: null },
    duracao: { type: Number, default: null },
    resultado: { type: String },
    prioridade: { type: String, enum: ['baixa', 'media', 'alta', 'urgente'], default: 'media' },
  },
  { timestamps: true }
);

const TaskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', default: null },
    titulo: { type: String, required: true },
    descricao: { type: String },
    status: { type: String, enum: ['pendente', 'em_andamento', 'concluido', 'cancelado'], default: 'pendente' },
    prioridade: { type: String, enum: ['baixa', 'media', 'alta', 'urgente'], default: 'media' },
    dataVencimento: { type: Date, default: null },
    dataConclusao: { type: Date, default: null },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Criar models
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
const Deal = mongoose.models.Deal || mongoose.model('Deal', DealSchema);
const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

// ============================================
// FUNÇÕES DE SEED
// ============================================

async function conectar() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

async function limparBanco() {
  try {
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Lead.deleteMany({});
    await Deal.deleteMany({});
    await Activity.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Banco de dados limpo');
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error);
    throw error;
  }
}

async function criarUsuario() {
  try {
    const senhaHash = await bcrypt.hash('123456', 10);

    const user = await User.create({
      nome: 'João Silva',
      email: 'joao@exemplo.com',
      senha: senhaHash,
      empresa: 'Empresa Demo LTDA',
      cargo: 'Gerente de Vendas',
      telefone: '(11) 98765-4321',
      ativo: true,
    });

    console.log('✅ Usuário criado:', user.email);
    return user;
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    throw error;
  }
}

async function criarClientes(userId: string) {
  try {
    const clientes = await Customer.insertMany([
      {
        userId,
        nome: 'Maria Santos',
        email: 'maria@cliente.com',
        telefone: '(11) 91234-5678',
        empresa: 'Tech Solutions',
        cargo: 'CTO',
        endereco: 'Av. Paulista, 1000',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100',
        tipo: 'pessoa_juridica',
        status: 'ativo',
        observacoes: 'Cliente VIP',
        tags: ['vip', 'tecnologia'],
        valorTotal: 50000,
        ultimaCompra: new Date('2024-10-15'),
      },
      {
        userId,
        nome: 'Pedro Oliveira',
        email: 'pedro@cliente.com',
        telefone: '(21) 98765-4321',
        empresa: 'Consultoria ABC',
        cargo: 'CEO',
        endereco: 'Rua das Flores, 500',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        cep: '20000-000',
        tipo: 'pessoa_juridica',
        status: 'ativo',
        tags: ['consultoria'],
        valorTotal: 35000,
        ultimaCompra: new Date('2024-10-20'),
      },
      {
        userId,
        nome: 'Ana Costa',
        email: 'ana@cliente.com',
        telefone: '(31) 99876-5432',
        empresa: null,
        cargo: null,
        endereco: 'Rua dos Pinheiros, 200',
        cidade: 'Belo Horizonte',
        estado: 'MG',
        cep: '30000-000',
        tipo: 'pessoa_fisica',
        status: 'ativo',
        tags: ['pessoa_fisica'],
        valorTotal: 15000,
        ultimaCompra: new Date('2024-10-25'),
      },
      {
        userId,
        nome: 'Carlos Mendes',
        email: 'carlos@cliente.com',
        telefone: '(41) 97654-3210',
        empresa: 'Indústria XYZ',
        cargo: 'Diretor',
        endereco: 'Av. Industrial, 1500',
        cidade: 'Curitiba',
        estado: 'PR',
        cep: '80000-000',
        tipo: 'pessoa_juridica',
        status: 'inativo',
        tags: ['industria'],
        valorTotal: 80000,
        ultimaCompra: new Date('2024-08-10'),
      },
    ]);

    console.log(`✅ ${clientes.length} clientes criados`);
    return clientes;
  } catch (error) {
    console.error('❌ Erro ao criar clientes:', error);
    throw error;
  }
}

async function criarLeads(userId: string) {
  try {
    const leads = await Lead.insertMany([
      {
        userId,
        nome: 'Juliana Ferreira',
        email: 'juliana@lead.com',
        telefone: '(11) 96543-2109',
        empresa: 'Startup Inovadora',
        cargo: 'Fundadora',
        origem: 'site',
        status: 'novo',
        interesse: 'Plano Enterprise',
        valorEstimado: 25000,
        probabilidade: 70,
        dataContato: new Date(),
        dataFollowup: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        tags: ['startup', 'tecnologia'],
      },
      {
        userId,
        nome: 'Roberto Lima',
        email: 'roberto@lead.com',
        telefone: '(21) 95432-1098',
        empresa: 'Comércio Digital',
        cargo: 'Gerente',
        origem: 'indicacao',
        status: 'contato',
        interesse: 'Plano Professional',
        valorEstimado: 15000,
        probabilidade: 50,
        dataContato: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        dataFollowup: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        tags: ['comercio', 'digital'],
      },
      {
        userId,
        nome: 'Fernanda Souza',
        email: 'fernanda@lead.com',
        telefone: '(31) 94321-0987',
        empresa: 'Educação Online',
        cargo: 'Coordenadora',
        origem: 'redes_sociais',
        status: 'qualificado',
        interesse: 'Plano Basic',
        valorEstimado: 8000,
        probabilidade: 80,
        dataContato: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dataFollowup: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        tags: ['educacao'],
      },
      {
        userId,
        nome: 'Marcos Alves',
        email: 'marcos@lead.com',
        telefone: '(41) 93210-9876',
        empresa: 'Logística Rápida',
        cargo: 'Supervisor',
        origem: 'evento',
        status: 'proposta',
        interesse: 'Plano Custom',
        valorEstimado: 40000,
        probabilidade: 60,
        dataContato: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        dataFollowup: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        tags: ['logistica'],
      },
      {
        userId,
        nome: 'Patricia Rocha',
        email: 'patricia@lead.com',
        telefone: '(51) 92109-8765',
        empresa: 'Saúde & Bem Estar',
        cargo: 'Diretora',
        origem: 'ligacao',
        status: 'negociacao',
        interesse: 'Plano Enterprise',
        valorEstimado: 55000,
        probabilidade: 90,
        dataContato: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        dataFollowup: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        tags: ['saude', 'vip'],
      },
    ]);

    console.log(`✅ ${leads.length} leads criados`);
    return leads;
  } catch (error) {
    console.error('❌ Erro ao criar leads:', error);
    throw error;
  }
}

async function criarDeals(userId: string, clientes: any[], leads: any[]) {
  try {
    const deals = await Deal.insertMany([
      {
        userId,
        customerId: clientes[0]._id,
        titulo: 'Renovação Contrato Anual',
        descricao: 'Renovação do contrato de serviços por mais 12 meses',
        valor: 50000,
        status: 'em_andamento',
        estagio: 'negociacao',
        probabilidade: 85,
        dataFechamentoPrevista: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        tags: ['renovacao', 'vip'],
      },
      {
        userId,
        customerId: clientes[1]._id,
        titulo: 'Upgrade Plano Enterprise',
        descricao: 'Cliente quer fazer upgrade do plano atual',
        valor: 35000,
        status: 'em_andamento',
        estagio: 'proposta',
        probabilidade: 70,
        dataFechamentoPrevista: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        tags: ['upgrade'],
      },
      {
        userId,
        leadId: leads[4]._id,
        titulo: 'Novo Contrato Enterprise',
        descricao: 'Lead qualificado para plano enterprise',
        valor: 55000,
        status: 'em_andamento',
        estagio: 'fechamento',
        probabilidade: 90,
        dataFechamentoPrevista: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        tags: ['novo', 'enterprise'],
      },
      {
        userId,
        customerId: clientes[2]._id,
        titulo: 'Serviço Adicional',
        descricao: 'Venda de serviço complementar',
        valor: 8000,
        status: 'ganho',
        estagio: 'fechamento',
        probabilidade: 100,
        dataFechamentoPrevista: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dataFechamentoReal: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        tags: ['adicional'],
      },
      {
        userId,
        leadId: leads[1]._id,
        titulo: 'Proposta Rejeitada',
        descricao: 'Cliente optou por concorrente',
        valor: 15000,
        status: 'perdido',
        estagio: 'proposta',
        probabilidade: 0,
        dataFechamentoPrevista: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        dataFechamentoReal: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        motivoPerda: 'Preço muito alto',
        tags: ['perdido'],
      },
    ]);

    console.log(`✅ ${deals.length} deals criados`);
    return deals;
  } catch (error) {
    console.error('❌ Erro ao criar deals:', error);
    throw error;
  }
}

async function criarAtividades(userId: string, clientes: any[], leads: any[]) {
  try {
    const atividades = await Activity.insertMany([
      {
        userId,
        customerId: clientes[0]._id,
        tipo: 'ligacao',
        titulo: 'Ligação de Follow-up',
        descricao: 'Discutir renovação de contrato',
        status: 'concluido',
        dataConclusao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        duracao: 30,
        resultado: 'Cliente interessado, aguardando proposta',
        prioridade: 'alta',
      },
      {
        userId,
        leadId: leads[0]._id,
        tipo: 'email',
        titulo: 'Envio de Proposta',
        descricao: 'Enviar proposta comercial detalhada',
        status: 'concluido',
        dataConclusao: new Date(),
        resultado: 'Proposta enviada com sucesso',
        prioridade: 'alta',
      },
      {
        userId,
        customerId: clientes[1]._id,
        tipo: 'reuniao',
        titulo: 'Reunião de Apresentação',
        descricao: 'Apresentar novos recursos do produto',
        status: 'pendente',
        dataVencimento: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        duracao: 60,
        prioridade: 'media',
      },
      {
        userId,
        leadId: leads[2]._id,
        tipo: 'tarefa',
        titulo: 'Preparar Demonstração',
        descricao: 'Preparar demo personalizada do produto',
        status: 'pendente',
        dataVencimento: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        prioridade: 'urgente',
      },
      {
        userId,
        customerId: clientes[0]._id,
        tipo: 'nota',
        titulo: 'Anotação Importante',
        descricao: 'Cliente mencionou interesse em expandir contrato no próximo trimestre',
        status: 'concluido',
        dataConclusao: new Date(),
        prioridade: 'media',
      },
    ]);

    console.log(`✅ ${atividades.length} atividades criadas`);
    return atividades;
  } catch (error) {
    console.error('❌ Erro ao criar atividades:', error);
    throw error;
  }
}

async function criarTarefas(userId: string, clientes: any[], leads: any[]) {
  try {
    const tarefas = await Task.insertMany([
      {
        userId,
        customerId: clientes[0]._id,
        titulo: 'Enviar contrato para assinatura',
        descricao: 'Preparar e enviar contrato de renovação',
        status: 'pendente',
        prioridade: 'alta',
        dataVencimento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        tags: ['contrato', 'urgente'],
      },
      {
        userId,
        leadId: leads[0]._id,
        titulo: 'Agendar reunião de apresentação',
        descricao: 'Marcar reunião para apresentar o produto',
        status: 'em_andamento',
        prioridade: 'media',
        dataVencimento: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        tags: ['reuniao'],
      },
      {
        userId,
        customerId: clientes[1]._id,
        titulo: 'Solicitar feedback do cliente',
        descricao: 'Enviar pesquisa de satisfação',
        status: 'pendente',
        prioridade: 'baixa',
        dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        tags: ['feedback'],
      },
      {
        userId,
        leadId: leads[4]._id,
        titulo: 'Preparar proposta customizada',
        descricao: 'Criar proposta personalizada para o lead',
        status: 'concluido',
        prioridade: 'alta',
        dataVencimento: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dataConclusao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tags: ['proposta', 'concluido'],
      },
      {
        userId,
        titulo: 'Atualizar CRM',
        descricao: 'Atualizar informações de todos os clientes',
        status: 'pendente',
        prioridade: 'media',
        dataVencimento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        tags: ['administrativo'],
      },
    ]);

    console.log(`✅ ${tarefas.length} tarefas criadas`);
    return tarefas;
  } catch (error) {
    console.error('❌ Erro ao criar tarefas:', error);
    throw error;
  }
}

async function seed() {
  console.log('\n🌱 Iniciando seed do banco de dados...\n');

  try {
    await conectar();
    await limparBanco();

    const user = await criarUsuario();
    const clientes = await criarClientes(user._id.toString());
    const leads = await criarLeads(user._id.toString());
    const deals = await criarDeals(user._id.toString(), clientes, leads);
    const atividades = await criarAtividades(user._id.toString(), clientes, leads);
    const tarefas = await criarTarefas(user._id.toString(), clientes, leads);

    console.log('\n✅ Seed concluído com sucesso!\n');
    console.log('📊 Resumo:');
    console.log(`   - 1 usuário`);
    console.log(`   - ${clientes.length} clientes`);
    console.log(`   - ${leads.length} leads`);
    console.log(`   - ${deals.length} deals`);
    console.log(`   - ${atividades.length} atividades`);
    console.log(`   - ${tarefas.length} tarefas`);
    console.log('\n🔐 Credenciais de login:');
    console.log('   Email: joao@exemplo.com');
    console.log('   Senha: 123456\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

seed();
