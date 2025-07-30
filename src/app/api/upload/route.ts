import { NextRequest, NextResponse } from 'next/server';
import { TosClient } from '@volcengine/tos-sdk';

// 从环境变量获取 TOS 配置
const client = new TosClient({
  accessKeyId: process.env.TOS_ACCESS_KEY_ID|| '',
  accessKeySecret: process.env.TOS_SECRET_KEY || '',
  endpoint: process.env.TOS_ENDPOINT || '',
  region:"cn-beijing"
});

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

  // 生成随机文件名避免冲突
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const objectKey = `${randomSuffix}-${file.name}`;

  try {
    const buffer = await file.arrayBuffer();
    const bucket = process.env.TOS_BUCKET || '';
    const result = await client.putObject({
      bucket,
      key: objectKey,
      body: Buffer.from(buffer),
    });

    const url = `https://${bucket}.${process.env.TOS_ENDPOINT}/${objectKey}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error('上传到 TOS 失败:', error);
    return NextResponse.json({ error: '文件上传失败' }, { status: 500 });
  }
}