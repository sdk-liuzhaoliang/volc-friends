import pool from '@/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // 假设 userId 从 session/token 获取
  const userId = 1;
  const { rows } = await pool.query('SELECT id, username, nickname, gender, email, age, age_privacy, height, height_privacy, education, education_privacy, avatar, life_photos, description, is_public, created_at, last_login FROM users WHERE id = $1', [userId]);
  if (rows.length === 0) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }
  // 处理 life_photos 字段为数组（如有需要）
  const user = rows[0];
  if (user.life_photos) {
    try { user.life_photos = JSON.parse(user.life_photos); } catch {}
  }
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  const userId = 1; // 示例
  const body = await req.json();
  const {
    nickname, gender, email, age, age_privacy, height, height_privacy, education, education_privacy, avatar, life_photos, description, is_public
  } = body;
  await pool.query(
    'UPDATE users SET nickname=$1, gender=$2, email=$3, age=$4, age_privacy=$5, height=$6, height_privacy=$7, education=$8, education_privacy=$9, avatar=$10, life_photos=$11, description=$12, is_public=$13 WHERE id=$14',
    [nickname, gender, email, age, age_privacy, height, height_privacy, education, education_privacy, avatar, JSON.stringify(life_photos), description, is_public, userId]
  );
  return NextResponse.json({ success: true });
} 