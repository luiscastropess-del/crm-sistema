import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IVenda extends Document {
  _id: string
  titulo: string
  cliente: mongoose.Types.ObjectId
  responsavel: mongoose.Types.ObjectId
  valor: number
  status: 'prospeccao' | 'negociacao' | 'proposta' | 'fechada' | 'perdida'
  probabilidade: number
  dataFechamento?: Date
  descricao?: string
  produtos?: Array<{
    nome: string
    quantidade: number
    valorUnitario: number
    valorTotal: number
  }>
  observacoes?: string
  motivoPerdida?: string
  createdAt: Date
  updatedAt: Date
}

const VendaSchema = new Schema<IVenda>(
  {
    titulo: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
    },
    cliente: {
      type: Schema.Types.ObjectId,
      ref: 'Cliente',
      required: true,
    },
    responsavel: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    valor: {
      type: Number,
      required: [true, 'Valor é obrigatório'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['prospeccao', 'negociacao', 'proposta', 'fechada', 'perdida'],
      default: 'prospeccao',
    },
    probabilidade: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    dataFechamento: {
      type: Date,
    },
    descricao: {
      type: String,
    },
    produtos: [{
      nome: { type: String, required: true },
      quantidade: { type: Number, required: true, min: 1 },
      valorUnitario: { type: Number, required: true, min: 0 },
      valorTotal: { type: Number, required: true, min: 0 },
    }],
    observacoes: {
      type: String,
    },
    motivoPerdida: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Índices
VendaSchema.index({ cliente: 1 })
VendaSchema.index({ responsavel: 1 })
VendaSchema.index({ status: 1 })
VendaSchema.index({ dataFechamento: 1 })

const Venda: Model<IVenda> = mongoose.models.Venda || mongoose.model<IVenda>('Venda', VendaSchema)

export default Venda