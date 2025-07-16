import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'volc-friends-secret';

function getUserIdFromRequest(req: NextRequest): number | null {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    return typeof payload.id === 'number' ? payload.id : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const user = db.prepare('SELECT id, username, nickname, gender, email, age, age_privacy, height, height_privacy, education, education_privacy, avatar, life_photos, description, is_public, created_at, last_login FROM users WHERE id = ?').get(userId);
  if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  user.life_photos = user.life_photos ? JSON.parse(user.life_photos) : [];
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });
  try {
    const data = await req.json();
    const { nickname, gender, email, age, age_privacy, height, height_privacy, education, education_privacy, avatar, life_photos, description, is_public } = data;
    if (!nickname || !gender || !email || !age || !height || !education || !avatar || !description) {
      return NextResponse.json({ error: '信息不完整' }, { status: 400 });
    }
    const photos = Array.isArray(life_photos) ? JSON.stringify(life_photos.slice(0, 3)) : '[]';
    db.prepare('UPDATE users SET nickname=?, gender=?, email=?, age=?, age_privacy=?, height=?, height_privacy=?, education=?, education_privacy=?, avatar=?, life_photos=?, description=?, is_public=? WHERE id=?')
      .run(nickname, gender, email, age, age_privacy || 'public', height, height_privacy || 'public', education, education_privacy || 'public', avatar, photos, description, is_public ? 1 : 0, userId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: '更新失败', detail: String(e) }, { status: 500 });
  }
} 