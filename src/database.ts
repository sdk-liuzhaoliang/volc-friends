import { Pool } from 'pg';

let pool: Pool | null = null;

const getPool = () => {
  if (pool) {
    return pool;
  }

  if (!process.env.DATABASE_URL) {
    console.error('FATAL: DATABASE_URL is not set.');
    throw new Error('DATABASE_URL environment variable is not set.');
  } else {
    console.log('DATABASE_URL 环境变量已加载。');
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  console.log('PostgreSQL (pg) 连接池已创建。');

  pool.on('error', (err, client) => {
    console.error('数据库连接池出现意外错误', err);
    process.exit(-1);
  });

  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('数据库连接测试失败:', err);
    } else {
      console.log('数据库连接成功，当前时间:', res.rows[0].now);
    }
  });

  return pool;
};

export default getPool;