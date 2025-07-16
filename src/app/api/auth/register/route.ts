import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { username, password, nickname, gender, age, height, education, avatar, life_photos, description, is_public } = data;
    if (!username || !password || !nickname || !gender || !avatar || !description) {
      return NextResponse.json({ error: '信息不完整' }, { status: 400 });
    }
    // 密码强度校验：大于6位且包含字母和数字
    if (password.length < 7 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: '密码必须大于6位且包含字母和数字' }, { status: 400 });
    }
    // 检查用户名唯一
    const exist = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (exist) {
      return NextResponse.json({ error: '用户名已存在' }, { status: 400 });
    }
    // 密码加密
    const hash = await bcrypt.hash(password, 10);
    // 生活照处理
    const photos = Array.isArray(life_photos) ? JSON.stringify(life_photos.slice(0, 3)) : '[]';
    // 插入用户，选填字段允许为null
    db.prepare(`INSERT INTO users (username, password, nickname, gender, age, height, education, avatar, life_photos, description, is_public) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        username,
        hash,
        nickname,
        gender,
        age || null,
        height || null,
        education || null,
        avatar,
        photos,
        description,
        is_public ? 1 : 0
      );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: '注册失败', detail: String(e) }, { status: 500 });
  }
} 