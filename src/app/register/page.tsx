"use client";
import React, { useState } from "react";
import { Box, Button, TextField, Typography, InputLabel, MenuItem, Select, FormControl, Avatar, Grid, IconButton, CircularProgress } from "@mui/material";
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useRouter } from "next/navigation";

const educationOptions = ["高中及以下", "大专", "本科", "硕士", "博士"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
    nickname: "",
    gender: "male",
    age: "",
    height: "",
    education: "本科",
    description: "",
    is_public: "1",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [lifePhotos, setLifePhotos] = useState<File[]>([]);
  const [lifePhotoUrls, setLifePhotoUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    setForm({ ...form, [name]: e.target.value });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleLifePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...lifePhotos, ...files].slice(0, 3);
    setLifePhotos(newFiles);
    setLifePhotoUrls(newFiles.map(f => URL.createObjectURL(f)));
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.url) return data.url;
    throw new Error('上传失败');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!avatar) {
      setError("请上传头像");
      return;
    }
    // 密码强度校验：大于6位且包含字母和数字
    if (form.password.length < 7 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      setError("密码必须大于6位且包含字母和数字");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 上传头像
      const avatarUrl = await uploadFile(avatar);
      // 上传生活照
      const lifePhotoUrls: string[] = [];
      for (const file of lifePhotos) {
        lifePhotoUrls.push(await uploadFile(file));
      }
      // 注册
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, avatar: avatarUrl, life_photos: lifePhotoUrls, is_public: form.is_public === "1" })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || '注册失败');
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message || '注册失败');
      } else {
        setError('注册失败');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box maxWidth={400} mx="auto" mt={8} p={3} boxShadow={2} borderRadius={2} bgcolor="#fff" textAlign="center">
        <CircularProgress color="success" sx={{ mb: 2 }} />
        <Typography variant="h6" mb={2}>注册成功</Typography>
        <Typography color="text.secondary">即将自动登录...</Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth={500} mx="auto" mt={4} p={3} boxShadow={2} borderRadius={2} bgcolor="#fff">
      <Typography variant="h5" mb={2}>注册账号</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="用户名" name="username" value={form.username} onChange={handleInputChange} fullWidth margin="normal" required />
        <TextField label="密码" name="password" value={form.password} onChange={handleInputChange} fullWidth margin="normal" required type="password" />
        <TextField label="昵称" name="nickname" value={form.nickname} onChange={handleInputChange} fullWidth margin="normal" required />
        <FormControl fullWidth margin="normal">
          <InputLabel>性别</InputLabel>
          <Select name="gender" value={form.gender} label="性别" onChange={handleSelectChange} required>
            <MenuItem value="male">男</MenuItem>
            <MenuItem value="female">女</MenuItem>
            <MenuItem value="other">其他</MenuItem>
          </Select>
        </FormControl>
        <TextField label="年龄（选填）" name="age" value={form.age} onChange={handleInputChange} fullWidth margin="normal" type="number" inputProps={{ min: 18, max: 100 }} />
        <TextField label="身高(cm, 选填)" name="height" value={form.height} onChange={handleInputChange} fullWidth margin="normal" type="number" inputProps={{ min: 100, max: 250 }} />
        <FormControl fullWidth margin="normal">
          <InputLabel>学历（选填）</InputLabel>
          <Select name="education" value={form.education} label="学历（选填）" onChange={handleSelectChange}>
            <MenuItem value="">未填写</MenuItem>
            {educationOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="个人描述" name="description" value={form.description} onChange={handleInputChange} fullWidth margin="normal" required multiline rows={3} />
        <FormControl fullWidth margin="normal">
          <InputLabel>是否公开</InputLabel>
          <Select name="is_public" value={form.is_public} label="是否公开" onChange={handleSelectChange} required>
            <MenuItem value="1">公开</MenuItem>
            <MenuItem value="0">隐藏</MenuItem>
          </Select>
        </FormControl>
        <Box mt={2} mb={1}>
          <Typography>头像（必填）</Typography>
          <label htmlFor="avatar-upload">
            <input accept="image/*" id="avatar-upload" type="file" hidden onChange={handleAvatarChange} />
            <IconButton color="primary" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
          {avatarUrl && <Avatar src={avatarUrl} sx={{ width: 56, height: 56, ml: 2 }} />}
        </Box>
        <Box mt={2} mb={1}>
          <Typography>生活照（最多3张，选填）</Typography>
          <label htmlFor="life-photo-upload">
            <input accept="image/*" id="life-photo-upload" type="file" hidden multiple onChange={handleLifePhotosChange} />
            <IconButton color="primary" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
          <Grid container spacing={1} mt={1}>
            {lifePhotoUrls.map((url, idx) => (
              <Grid key={idx} item><Avatar src={url} variant="rounded" sx={{ width: 56, height: 56 }} /></Grid>
            ))}
          </Grid>
        </Box>
        {error && <Typography color="error" mt={1}>{error}</Typography>}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>{loading ? '注册中...' : '注册'}</Button>
      </form>
    </Box>
  );
} 