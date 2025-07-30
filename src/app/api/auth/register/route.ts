import pool from '@/database';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { username, password, nickname, gender, age, height, education, avatar, life_photos, description, is_public, email, captcha, captchaId } = await req.json();
    
    // 验证码校验
    if (!captcha || !captchaId) {
      return NextResponse.json({ error: '请输入验证码' }, { status: 400 });
    }
    
    // 验证验证码
    const captchaRes = await fetch(`${req.nextUrl.origin}/api/auth/captcha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ captchaId, captchaText: captcha })
    });
    
    const captchaData = await captchaRes.json();
    if (!captchaData.valid) {
      return NextResponse.json({ error: captchaData.error || '验证码错误' }, { status: 400 });
    }
    
    console.log(`Checking existence for username: ${username}`);
    const { rows: existRows } = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existRows.length > 0) {
      return NextResponse.json({ error: '用户名已存在' }, { status: 400 });
    }
    // 用户名长度校验
    if (!username || username.length < 6 || username.length > 32) {
      return NextResponse.json({ error: '用户名长度需在6~32位之间' }, { status: 400 });
    }
    // 密码长度校验
    if (!password || password.length < 6 || password.length > 64) {
      return NextResponse.json({ error: '密码长度需在6~64位之间' }, { status: 400 });
    }
    // 密码强度校验：大于6位且包含字母和数字
    const strongPwd = /^(?=.*[A-Za-z])(?=.*\d).{7,}$/;
    if (!strongPwd.test(password)) {
      return NextResponse.json({ error: '密码必须大于6位且包含字母和数字' }, { status: 400 });
    }
    // 邮箱格式校验（如有邮箱字段）
    if (email && !/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(email)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
    }
    // 邮箱长度校验
    if (email && email.length > 128) {
      return NextResponse.json({ error: '邮箱不能超过128位' }, { status: 400 });
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
    // 年龄范围校验
    if (age && (Number(age) < 10 || Number(age) > 150)) {
      return NextResponse.json({ error: '年龄需在10~150之间' }, { status: 400 });
    }
    
    console.log(`Hashing password for user: ${username}`);
    const hash = await bcrypt.hash(password, 10);
    // 处理可选字段
    const safeInt = (v: string | number | null | undefined) => v === "" ? null : Number(v);
    const safeStr = (v: string | null | undefined) => v === "" ? null : v;
    // is_public 类型安全转换
    const safePublic = (v: boolean | string | null | undefined) => v === true || v === "1" ? "1" : "0";
    
    console.log(`Inserting new user: ${username} into database`);
    await pool.query(
      'INSERT INTO users (username, password, nickname, gender, age, height, education, avatar, life_photos, description, is_public, email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
      [
        username,
        hash,
        nickname,
        gender,
        safeInt(age),
        safeInt(height),
        safeStr(education),
        avatar,
        JSON.stringify(life_photos),
        description,
        safePublic(is_public),
        safeStr(email)
      ]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Register POST API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 新增用户名唯一性接口
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    if (!username) return NextResponse.json({ exists: false });
    
    console.log(`Checking username uniqueness for: ${username}`);
    const { rows } = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    
    console.log('Query result rows:', rows);
    
    return NextResponse.json({ exists: rows.length > 0 });
  } catch (error) {
    console.error('--- 注册 GET API 发生错误 ---');
    console.error('原始错误对象:', error);

    // --- 开始新的诊断代码 ---
    // 这个错误不是一个标准的 Error 实例。我们换个方式来探查它。
    if (error && typeof error === 'object') {
      console.error('错误对象的键 (keys):', Object.keys(error));
      console.error('错误对象的属性 (包括不可枚举的):', Object.getOwnPropertyNames(error));
      
      // 让我们尝试直接访问一些常见的属性
      console.error('错误的 type 属性:', (error as any).type);
      console.error('错误的 message 属性:', (error as any).message);
      console.error('错误的 stack 属性:', (error as any).stack);
    }
    // --- 结束新的诊断代码 ---

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}