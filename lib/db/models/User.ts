// lib/db/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  nome: string;
  email: string;
  senha: string;
  avatar?: string;
  empresa?: string;
  cargo?: string;
  telefone?: string;
  ativo: boolean;
  ultimoAcesso?: Date;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    senha: {
      type: String,
      required: [true, 'Senha é obrigatória'],
    },
    avatar: {
      type: String,
      default: null,
    },
    empresa: {
      type: String,
      default: null,
    },
    cargo: {
      type: String,
      default: null,
    },
    telefone: {
      type: String,
      default: null,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
    ultimoAcesso: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Remover índice duplicado - o unique: true já cria o índice
// UserSchema.index({ email: 1 }); // ❌ REMOVER ESTA LINHA

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
