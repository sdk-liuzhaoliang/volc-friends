import pool from '@/database';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { username, password, nickname, gender, age, height, education, avatar, life_photos, description, is_public } = await req.json();
  const { rows: existRows } = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
  if (existRows.length > 0) {
    return NextResponse.json({ error: '用户名已存在' }, { status: 400 });
  }
  const hash = await bcrypt.hash(password, 10);
  // 处理可选字段
  const safeInt = (v: string | number | null | undefined) => v === "" ? null : Number(v);
  const safeStr = (v: string | null | undefined) => v === "" ? null : v;
  const safePublic = (v: boolean | string | null | undefined) => v === true || v === "1" ? "1" : "0";
  await pool.query(
    'INSERT INTO users (username, password, nickname, gender, age, height, education, avatar, life_photos, description, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
    [
      username,
      hash,
      nickname,
      gender,
      safeInt(age),
      safeInt(height),
      safeStr(education),
      avatar,
      JSON.stringify(life_photos),
      description,
      safePublic(is_public)
    ]
  );
  return NextResponse.json({ success: true });
} 