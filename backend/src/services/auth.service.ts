import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';
import { JwtPayload, LoginDto, RegisterDto } from '../types';

export class AuthService {
  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
  }

  async register(dto: RegisterDto) {
    const existing = await userRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await userRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: dto.role || Role.AGENT,
    });

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return {
      token: this.generateToken(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async login(dto: LoginDto) {
    const user = await userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return {
      token: this.generateToken(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }
}

export const authService = new AuthService();
