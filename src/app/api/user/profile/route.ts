import getPool from '@/database';
import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

function getUserIdFromRequest(req: NextRequest): number | null {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    // 类型安全地获取 userId
    if (typeof payload === 'object' && payload !== null && 'userId' in payload && typeof (payload as JwtPayload).userId === 'number') {
      return (payload as JwtPayload).userId;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const pool = getPool();
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const { rows } = await pool.query('SELECT id, username, nickname, gender, email, age, age_privacy, height, height_privacy, education, education_privacy, avatar, life_photos, description, is_public, created_at, last_login FROM users WHERE id = $1', [userId]);
  if (rows.length === 0) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }
  const user = rows[0];
  if (user.life_photos) {
    try { user.life_photos = JSON.parse(user.life_photos); } catch {}
  }
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  try {
    const pool = getPool();
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });
    const body = await req.json();
    const {
      nickname, gender, email, age, age_privacy, height, height_privacy, education, education_privacy, avatar, life_photos, description, is_public
    } = body;
    // 邮箱格式校验
    if (email && !/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(email)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
    }
    // 邮箱长度校验
    if (email && email.length > 128) {
      return NextResponse.json({ error: '邮箱不能超过128位' }, { status: 400 });
    }
    // 年龄范围校验
    if (age && (Number(age) < 10 || Number(age) > 150)) {
      return NextResponse.json({ error: '年龄需在10~150之间' }, { status: 400 });
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
    // 类型安全转换
    const safeInt = (v: string | number | null | undefined) => v === "" ? null : Number(v);
    const safePublic = (v: boolean | string | null | undefined) => v === true || v === "1" ? "1" : "0";
    await pool.query(
      'UPDATE users SET nickname=$1, gender=$2, email=$3, age=$4, age_privacy=$5, height=$6, height_privacy=$7, education=$8, education_privacy=$9, avatar=$10, life_photos=$11, description=$12, is_public=$13 WHERE id=$14',
      [nickname, gender, email, safeInt(age), age_privacy, safeInt(height), height_privacy, education, education_privacy, avatar, JSON.stringify(life_photos), description, safePublic(is_public), userId]
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: '服务器异常', detail: String(e) }, { status: 500 });
  }
}