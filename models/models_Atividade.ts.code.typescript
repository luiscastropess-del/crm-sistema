import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAtividade extends Document {
  _id: string
  tipo: 'ligacao' | 'email' | 'reuniao' | 'tarefa' | 'nota' | 'outro'
  titulo: string
  descricao?: string
  cliente?: mongoose.Types.ObjectId
  venda?: mongoose.Types.ObjectId
  usuario: mongoose.Types.ObjectId
  status: 'pendente' | 'concluida' | 'cancelada'
  dataAgendada?: Date
  dataConclusao?: Date
  prioridade: 'baixa' | 'media' | 'alta'
  duracao?: number // em minutos
  resultado?: string
  createdAt: Date
  updatedAt: Date
}

const AtividadeSchema = new Schema<IAtividade>(
  {
    tipo: {
      type: String,
      enum: ['ligacao', 'email', 'reuniao', 'tarefa', 'nota', 'outro'],
      required: true,
    },
    titulo: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
    },
    descricao: {
      type: String,
    },
    cliente: {
      type: Schema.Types.ObjectId,
      ref: 'Cliente',
    },
    venda: {
      type: Schema.Types.ObjectId,
      ref: 'Venda',
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pendente', 'concluida', 'cancelada'],
      default: 'pendente',
    },
    dataAgendada: {
      type: Date,
    },
    dataConclusao: {
      type: Date,
    },
    prioridade: {
      type: String,
      enum: ['baixa', 'media', 'alta'],
      default: 'media',
    },
    duracao: {
      type: Number,
      min: 0,
    },
    resultado: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Índices
AtividadeSchema.index({ usuario: 1 })
AtividadeSchema.index({ cliente: 1 })
AtividadeSchema.index({ venda: 1 })
AtividadeSchema.index({ status: 1 })
AtividadeSchema.index({ dataAgendada: 1 })

const Atividade: Model<IAtividade> = mongoose.models.Atividade || mongoose.model<IAtividade>('Atividade', AtividadeSchema)

export default Atividade