import { NextResponse } from 'next/server';
import pool from '@/database';

const schema = `
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(255) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  email VARCHAR(255),
  email_privacy VARCHAR(10) DEFAULT 'public',
  age INTEGER,
  age_privacy VARCHAR(10) DEFAULT 'public',
  height INTEGER,
  height_privacy VARCHAR(10) DEFAULT 'public',
  education VARCHAR(20),
  education_privacy VARCHAR(10) DEFAULT 'public',
  avatar VARCHAR(255) NOT NULL,
  life_photos TEXT,
  description TEXT NOT NULL,
  is_public VARCHAR(1) NOT NULL DEFAULT '1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
`;

export async function GET() {
  try {
    await pool.query(schema);
    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to initialize database' }, { status: 500 });
  }
}