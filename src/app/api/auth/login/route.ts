import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'volc-friends-secret';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: '信息不完整' }, { status: 400 });
    }
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 400 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: '密码错误' }, { status: 400 });
    }
    // 生成JWT
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    // 更新最后登录时间
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    // 设置HttpOnly Cookie
    const res = NextResponse.json({ success: true });
    res.cookies.set('token', token, { httpOnly: true, maxAge: 86400, path: '/' });
    return res;
  } catch (e) {
    return NextResponse.json({ error: '登录失败', detail: String(e) }, { status: 500 });
  }
} 