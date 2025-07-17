import pool from '@/database';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { username, password, nickname, gender, age, height, education, avatar, life_photos, description, is_public } = await req.json();
  const { rows: existRows } = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
  if (existRows.length > 0) {
    return NextResponse.json({ error: '用户名已存在' }, { status: 400 });
  }
  // 用户名长度校验
  if (!username || username.length < 6 || username.length > 32) {
    return NextResponse.json({ error: '用户名长度需在6~32位之间' }, { status: 400 });
  }
  // 密码长度校验
  if (!password || password.length < 6 || password.length > 64) {
    return NextResponse.json({ error: '密码长度需在6~64位之间' }, { status: 400 });
  }
  // 密码强度校验：大于6位且包含字母和数字
  const strongPwd = /^(?=.*[A-Za-z])(?=.*\d).{7,}$/;
  if (!strongPwd.test(password)) {
    return NextResponse.json({ error: '密码必须大于6位且包含字母和数字' }, { status: 400 });
  }
  // 邮箱格式校验（如有邮箱字段）
  if (email && !/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(email)) {
    return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
  }
  // 邮箱长度校验
  if (email && email.length > 128) {
    return NextResponse.json({ error: '邮箱不能超过128位' }, { status: 400 });
  }
  // 生活照数量校验
  if (life_photos && Array.isArray(life_photos) && life_photos.length > 3) {
    return NextResponse.json({ error: '生活照最多3张' }, { status: 400 });
  }
  // 昵称长度校验
  if (nickname && nickname.length > 20) {
    return NextResponse.json({ error: '昵称不能超过20字' }, { status: 400 });
  }
  // 个人描述长度校验
  if (description && description.length > 200) {
    return NextResponse.json({ error: '个人描述不能超过200字' }, { status: 400 });
  }
  // 年龄范围校验
  if (age && (Number(age) < 10 || Number(age) > 150)) {
    return NextResponse.json({ error: '年龄需在10~150之间' }, { status: 400 });
  }
  const hash = await bcrypt.hash(password, 10);
  // 处理可选字段
  const safeInt = (v: string | number | null | undefined) => v === "" ? null : Number(v);
  const safeStr = (v: string | null | undefined) => v === "" ? null : v;
  // is_public 类型安全转换
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

// 新增用户名唯一性接口
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  if (!username) return NextResponse.json({ exists: false });
  const { rows } = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
  return NextResponse.json({ exists: rows.length > 0 });
} 