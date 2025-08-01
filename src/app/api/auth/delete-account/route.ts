import getPool from '@/database';
import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

function getUserIdFromRequest(req: NextRequest): number | null {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof payload === 'object' && payload !== null && 'userId' in payload && typeof (payload as JwtPayload).userId === 'number') {
      return (payload as JwtPayload).userId;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const pool = getPool();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 验证用户存在
    const { rows } = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (rows.length === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 删除用户账号
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    // 清除token cookie
    const response = NextResponse.json({ success: true, message: '账号注销成功' });
    response.cookies.set('token', '', { httpOnly: true, maxAge: 0, path: '/' });

    return response;
  } catch (error) {
    console.error('账号注销失败:', error);
    return NextResponse.json({ error: '服务器异常，注销失败' }, { status: 500 });
  }
}