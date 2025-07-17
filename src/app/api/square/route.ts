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
    filters.push('age >= $' + (params.length + 1));
    params.push(Number(searchParams.get('minAge')));
  }
  if (searchParams.get('maxAge')) {
    filters.push('age <= $' + (params.length + 1));
    params.push(Number(searchParams.get('maxAge')));
  }
  if (searchParams.get('minHeight')) {
    filters.push('height >= $' + (params.length + 1));
    params.push(Number(searchParams.get('minHeight')));
  }
  if (searchParams.get('maxHeight')) {
    filters.push('height <= $' + (params.length + 1));
    params.push(Number(searchParams.get('maxHeight')));
  }
  if (searchParams.get('education')) {
    filters.push('education = $' + (params.length + 1));
    params.push(searchParams.get('education'));
  }
  let sql = 'SELECT id, username, nickname, gender, email, email_privacy, age, age_privacy, height, height_privacy, education, education_privacy, avatar, life_photos, description, is_public, created_at, last_login FROM users WHERE is_public = $' + (params.length + 1);
  params.push('1');
  if (filters.length > 0) {
    sql += ' AND ' + filters.join(' AND ');
  }
  const { rows } = await pool.query(sql, params);
  // 处理 life_photos 字段为数组
  rows.forEach(u => {
    if (u.life_photos) {
      try { u.life_photos = JSON.parse(u.life_photos); } catch {}
    }
  });
  return NextResponse.json({ users: rows });
} 