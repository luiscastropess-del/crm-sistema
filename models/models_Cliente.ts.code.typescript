import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICliente extends Document {
  _id: string
  nome: string
  email: string
  telefone?: string
  empresa?: string
  cargo?: string
  endereco?: {
    rua?: string
    cidade?: string
    estado?: string
    cep?: string
    pais?: string
  }
  status: 'lead' | 'prospect' | 'cliente' | 'inativo'
  origem: 'website' | 'indicacao' | 'redes_sociais' | 'evento' | 'outro'
  valorPotencial?: number
  observacoes?: string
  tags?: string[]
  responsavel: mongoose.Types.ObjectId
  ultimoContato?: Date
  proximoFollowUp?: Date
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

const ClienteSchema = new Schema<ICliente>(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    telefone: {
      type: String,
      trim: true,
    },
    empresa: {
      type: String,
      trim: true,
    },
    cargo: {
      type: String,
      trim: true,
    },
    endereco: {
      rua: String,
      cidade: String,
      estado: String,
      cep: String,
      pais: { type: String, default: 'Brasil' },
    },
    status: {
      type: String,
      enum: ['lead', 'prospect', 'cliente', 'inativo'],
      default: 'lead',
    },
    origem: {
      type: String,
      enum: ['website', 'indicacao', 'redes_sociais', 'evento', 'outro'],
      default: 'website',
    },
    valorPotencial: {
      type: Number,
      min: 0,
    },
    observacoes: {
      type: String,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    responsavel: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ultimoContato: {
      type: Date,
    },
    proximoFollowUp: {
      type: Date,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Índices para performance
ClienteSchema.index({ email: 1 })
ClienteSchema.index({ responsavel: 1 })
ClienteSchema.index({ status: 1 })
ClienteSchema.index({ createdAt: -1 })

const Cliente: Model<ICliente> = mongoose.models.Cliente || mongoose.model<ICliente>('Cliente', ClienteSchema)

export default Cliente