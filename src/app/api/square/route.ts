import pool from '@/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filters = [];
  const params = [];
  if (searchParams.get('gender')) {
    filters.push('gender = $' + (params.length + 1));
    params.push(searchParams.get('gender'));
  }
  if (searchParams.get('minAge')) {
    filters.push('age_privacy = ' + "'public'");
    filters.push('age >= $' + (params.length + 1));
    params.push(Number(searchParams.get('minAge')));
  }
  if (searchParams.get('maxAge')) {
    filters.push('age_privacy = ' + "'public'");
    filters.push('age <= $' + (params.length + 1));
    params.push(Number(searchParams.get('maxAge')));
  }
  if (searchParams.get('minHeight')) {
    filters.push('height_privacy = ' + "'public'");
    filters.push('height >= $' + (params.length + 1));
    params.push(Number(searchParams.get('minHeight')));
  }
  if (searchParams.get('maxHeight')) {
    filters.push('height_privacy = ' + "'public'");
    filters.push('height <= $' + (params.length + 1));
    params.push(Number(searchParams.get('maxHeight')));
  }
  if (searchParams.get('education')) {
    filters.push('education_privacy = ' + "'public'");
    filters.push('education = $' + (params.length + 1));
    params.push(searchParams.get('education'));
  }
  let sql = 'SELECT id, username, nickname, gender, email, email_privacy, age, age_privacy, height, height_privacy, education, education_privacy, avatar, life_photos, description, is_public, created_at, last_login FROM users WHERE is_public = $' + (params.length + 1);
  params.push('1');
  if (filters.length > 0) {
    sql += ' AND ' + filters.join(' AND ');
  }
  const page = parseInt(searchParams.get('page') || '1', 10);
  const size = parseInt(searchParams.get('size') || '12', 10);
  const offset = (page - 1) * size;
  sql += ' ORDER BY created_at ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
  params.push(size, offset);
  const { rows } = await pool.query(sql, params);
  // 处理 life_photos 字段为数组
  rows.forEach(u => {
    if (u.life_photos) {
      try { u.life_photos = JSON.parse(u.life_photos); } catch {}
    }
  });
  // 只返回允许公开的字段
  const safeUsers = rows.map(u => {
    return {
      id: u.id,
      username: u.username,
      nickname: u.nickname,
      gender: u.gender,
      age: u.age_privacy === 'public' ? u.age : undefined,
      height: u.height_privacy === 'public' ? u.height : undefined,
      education: u.education_privacy === 'public' ? u.education : undefined,
      avatar: u.avatar,
      life_photos: u.life_photos,
      description: u.description,
      is_public: u.is_public,
      created_at: u.created_at,
      last_login: u.last_login,
      email: u.email_privacy === 'public' ? u.email : undefined
    };
  });
  return NextResponse.json({ users: safeUsers });
} 