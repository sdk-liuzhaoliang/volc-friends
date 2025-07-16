import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs'; // 强制使用 Node.js 运行时

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return NextResponse.json({ error: '未选择文件' }, { status: 400 });
  }
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${randomUUID()}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const arrayBuffer = await file.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(arrayBuffer));
  const url = `/uploads/${filename}`;
  return NextResponse.json({ url });
} 