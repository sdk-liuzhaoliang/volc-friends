import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: '未选择文件' }, { status: 400 });
  }
  // 上传到 Vercel Blob，自动加随机后缀避免冲突
  const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });
  return NextResponse.json({ url: blob.url });
} 