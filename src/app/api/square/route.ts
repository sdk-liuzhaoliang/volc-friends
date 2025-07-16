import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gender = searchParams.get('gender');
  const minAge = searchParams.get('minAge');
  const maxAge = searchParams.get('maxAge');
  const minHeight = searchParams.get('minHeight');
  const maxHeight = searchParams.get('maxHeight');
  const education = searchParams.get('education');

  let sql = 'SELECT id, nickname, gender, age, age_privacy, height, height_privacy, education, education_privacy, email, email_privacy, avatar, life_photos, description FROM users WHERE is_public = 1';
  const params: unknown[] = [];
  if (gender) {
    sql += ' AND gender = ?';
    params.push(gender);
  }
  if (minAge) {
    sql += ' AND age >= ?';
    params.push(Number(minAge));
  }
  if (maxAge) {
    sql += ' AND age <= ?';
    params.push(Number(maxAge));
  }
  if (minHeight) {
    sql += ' AND height >= ?';
    params.push(Number(minHeight));
  }
  if (maxHeight) {
    sql += ' AND height <= ?';
    params.push(Number(maxHeight));
  }
  if (education) {
    sql += ' AND education = ?';
    params.push(education);
  }
  sql += ' ORDER BY id DESC';
  const users = db.prepare(sql).all(...params).map((u: Record<string, unknown>) => ({
    ...u,
    life_photos: u.life_photos ? JSON.parse(u.life_photos) : []
  }));
  return NextResponse.json({ users });
} 