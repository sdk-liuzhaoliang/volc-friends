import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  // 允许未登录用户上传图片（注册流程专用）
  // const userId = getUserIdFromRequest(req);
  // if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const formData = await req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: '未选择文件' }, { status: 400 });
  }
  // 校验文件类型和大小
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/heic',
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: '只允许上传 JPG/PNG/WEBP/GIF/BMP/SVG/HEIC 图片' }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: '图片大小不能超过 5MB' }, { status: 400 });
  }
  // 上传到 Vercel Blob，自动加随机后缀避免冲突
  const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true });
  return NextResponse.json({ url: blob.url });
} 