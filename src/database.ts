import Database from 'better-sqlite3';
import path from 'path';

// 数据库文件路径
const dbPath = path.resolve(process.cwd(), 'volc-friends.db');
console.log('DB Path:', dbPath);
const db = new Database(dbPath);

// 初始化用户表
// 头像 avatar: string, 生活照 life_photos: JSON 字符串数组
// 公开状态 is_public: 0/1
// 其他字段见需求
const createUserTable = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nickname TEXT NOT NULL,
  gender TEXT NOT NULL,
  email TEXT,
  email_privacy TEXT DEFAULT 'public',
  age INTEGER,
  age_privacy TEXT DEFAULT 'public',
  height INTEGER,
  height_privacy TEXT DEFAULT 'public',
  education TEXT,
  education_privacy TEXT DEFAULT 'public',
  avatar TEXT NOT NULL,
  life_photos TEXT,
  description TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);
`;
db.exec(createUserTable);

export default db; 