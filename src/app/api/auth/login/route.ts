import pool from '@/database';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  // 用户名长度校验
  if (!username || username.length < 6 || username.length > 32) {
    return NextResponse.json({ error: '用户名长度需在6~32位之间' }, { status: 400 });
  }
  // 密码长度校验
  if (!password || password.length < 6 || password.length > 64) {
    return NextResponse.json({ error: '密码长度需在6~64位之间' }, { status: 400 });
  }
  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = rows[0];
  if (!user) {
    // 清除 token
    if (typeof window !== 'undefined') localStorage.removeItem('token');
    return NextResponse.json({ error: '用户不存在' }, { status: 400 });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: '密码错误' }, { status: 400 });
  }
  await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
  // 检查 JWT_SECRET
  if (!process.env.JWT_SECRET) {
    return NextResponse.json({ error: '服务器未配置 JWT_SECRET 环境变量' }, { status: 500 });
  }
  // 生成 token
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  const userSafe = { ...user };
  delete userSafe.password;
  return NextResponse.json({ token, user: userSafe });
} 