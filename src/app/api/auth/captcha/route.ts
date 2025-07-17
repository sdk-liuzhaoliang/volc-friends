import { NextRequest, NextResponse } from 'next/server';

// 简单的内存存储验证码（实际项目中应该使用session或redis）
const captchaStore = new Map<string, { text: string, timestamp: number }>();

// 生成随机验证码
function generateCaptcha() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 生成SVG验证码
function generateSVGCaptcha(text: string) {
  const width = 120;
  const height = 40;
  
  // 生成干扰线
  const lines = [];
  for (let i = 0; i < 3; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    lines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ccc" stroke-width="1"/>`);
  }
  
  // 生成文字
  const fontSize = 20;
  const letterSpacing = 25;
  const startX = 10;
  const startY = 28;
  
  const letters = text.split('').map((char, index) => {
    const x = startX + index * letterSpacing;
    const y = startY + (Math.random() - 0.5) * 10;
    const rotation = (Math.random() - 0.5) * 30;
    return `<text x="${x}" y="${y}" font-family="Arial" font-size="${fontSize}" fill="#333" transform="rotate(${rotation} ${x} ${y})">${char}</text>`;
  });
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f5f5f5"/>
      ${lines.join('')}
      ${letters.join('')}
    </svg>
  `;
}

export async function GET(req: NextRequest) {
  const captchaText = generateCaptcha();
  const svg = generateSVGCaptcha(captchaText);
  
  // 生成唯一ID
  const captchaId = Math.random().toString(36).substring(2, 15);
  
  // 存储验证码（5分钟有效期）
  captchaStore.set(captchaId, {
    text: captchaText,
    timestamp: Date.now()
  });
  
  // 清理过期的验证码
  const now = Date.now();
  for (const [id, data] of captchaStore.entries()) {
    if (now - data.timestamp > 5 * 60 * 1000) {
      captchaStore.delete(id);
    }
  }
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Captcha-Id': captchaId
    }
  });
}

// 验证验证码
export async function POST(req: NextRequest) {
  const { captchaId, captchaText } = await req.json();
  
  if (!captchaId || !captchaText) {
    return NextResponse.json({ valid: false, error: '验证码参数不完整' });
  }
  
  const stored = captchaStore.get(captchaId);
  if (!stored) {
    return NextResponse.json({ valid: false, error: '验证码已过期' });
  }
  
  // 检查是否过期（5分钟）
  if (Date.now() - stored.timestamp > 5 * 60 * 1000) {
    captchaStore.delete(captchaId);
    return NextResponse.json({ valid: false, error: '验证码已过期' });
  }
  
  // 验证码不区分大小写
  const isValid = captchaText.toUpperCase() === stored.text;
  
  if (isValid) {
    // 验证成功后删除验证码
    captchaStore.delete(captchaId);
  }
  
  return NextResponse.json({ valid: isValid });
} 