export interface User {
  id: number;
  username: string;
  nickname: string;
  gender: string;
  email?: string;
  email_privacy?: string;
  age?: number;
  age_privacy?: string;
  height?: number;
  height_privacy?: string;
  education?: string;
  education_privacy?: string;
  avatar: string;
  life_photos: string[];
  description: string;
  is_public: boolean;
  created_at?: string;
  last_login?: string;
} 