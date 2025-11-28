import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
  _id?: string;
  email: string;
  password: string;
  createdAt?: Date;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  const client = await clientPromise;
  const db = client.db();
  
  let user;
  try {
    user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
  } catch {
    user = await db.collection('users').findOne({ _id: decoded.userId });
  }

  if (!user) {
    return null;
  }

  return {
    ...user,
    _id: user._id.toString(),
  } as User;
}

