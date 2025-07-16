"use client";
import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, Avatar, Grid, IconButton, FormControl, InputLabel, Select, MenuItem, CircularProgress, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useRouter } from "next/navigation";
import type { User } from "@/types/user";

const educationOptions = ["高中及以下", "大专", "本科", "硕士", "博士"];

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<Partial<User> | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [lifePhotos, setLifePhotos] = useState<File[]>([]);
  const [lifePhotoUrls, setLifePhotoUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [privacy, setPrivacy] = useState({ age: 'public', height: 'public', education: 'public' });

  useEffect(() => {
    fetch('/api/user/profile').then(async res => {
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setForm({ ...data.user, is_public: data.user.is_public ? "1" : "0" });
      setAvatarUrl(data.user.avatar);
      setLifePhotoUrls(data.user.life_photos || []);
      setPrivacy({
        age: data.user.age_privacy || 'public',
        height: data.user.height_privacy || 'public',
        education: data.user.education_privacy || 'public',
      });
      setLoading(false);
    });
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value } as Partial<User>);
  };
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    setForm({ ...form, [name]: e.target.value } as Partial<User>);
  };
  const handleRadioChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setPrivacy({ ...privacy, [field]: value });
    if (value === 'private') {
      setForm({ ...form, [field]: '' } as Partial<User>);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleLifePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...lifePhotos, ...files].slice(0, 3);
    setLifePhotos(newFiles);
    setLifePhotoUrls(newFiles.map(f => URL.createObjectURL(f)));
  };

  const handlePrivacyChange = (field: string, value: string) => {
    setPrivacy({ ...privacy, [field]: value });
    if (value === 'private') {
      setForm({ ...form, [field]: '' });
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.url) return data.url;
    throw new Error('上传失败');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError("");
    setSaving(true);
    try {
      let avatarUrlToUse = avatarUrl;
      if (avatar) {
        avatarUrlToUse = await uploadFile(avatar);
      }
      let lifePhotoUrlsToUse = lifePhotoUrls;
      if (lifePhotos.length > 0) {
        lifePhotoUrlsToUse = [];
        for (const file of lifePhotos) {
          lifePhotoUrlsToUse.push(await uploadFile(file));
        }
      }
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          age_privacy: privacy.age,
          height_privacy: privacy.height,
          education_privacy: privacy.education,
          avatar: avatarUrlToUse,
          life_photos: lifePhotoUrlsToUse,
          is_public: ["1", 1, true].includes(form.is_public as any)
        })
      });
      const data = await res.json();
      if (data.success) {
        setError("");
        window.location.reload();
      } else {
        setError(data.error || '保存失败');
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message || '保存失败');
      } else {
        setError('保存失败');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;

  return (
    <Box maxWidth={600} mx="auto" mt={4} p={3} boxShadow={2} borderRadius={2} bgcolor="#fff">
      <Typography variant="h5" mb={2}>我的信息</Typography>
      <form onSubmit={handleSave}>
        <TextField label="联系邮箱" name="email" value={form.email} onChange={handleInputChange} fullWidth margin="normal" required />
        <TextField label="昵称" name="nickname" value={form.nickname} onChange={handleInputChange} fullWidth margin="normal" required />
        <FormControl fullWidth margin="normal">
          <InputLabel>性别</InputLabel>
          <Select name="gender" value={form.gender} label="性别" onChange={handleSelectChange} required>
            <MenuItem value="male">男</MenuItem>
            <MenuItem value="female">女</MenuItem>
            <MenuItem value="other">其他</MenuItem>
          </Select>
        </FormControl>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField label="年龄" name="age" value={form.age} onChange={handleInputChange} fullWidth margin="normal" type="number" inputProps={{ min: 18, max: 100 }} />
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <RadioGroup row value={privacy.age} onChange={handleRadioChange('age')}>
              <FormControlLabel value="public" control={<Radio />} label="公开" />
              <FormControlLabel value="private" control={<Radio />} label="保密" />
            </RadioGroup>
          </FormControl>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField label="身高(cm)" name="height" value={form.height} onChange={handleInputChange} fullWidth margin="normal" type="number" inputProps={{ min: 100, max: 250 }} />
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <RadioGroup row value={privacy.height} onChange={handleRadioChange('height')}>
              <FormControlLabel value="public" control={<Radio />} label="公开" />
              <FormControlLabel value="private" control={<Radio />} label="保密" />
            </RadioGroup>
          </FormControl>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl fullWidth margin="normal">
            <InputLabel>学历</InputLabel>
            <Select name="education" value={form.education} label="学历" onChange={handleSelectChange}>
              {educationOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <RadioGroup row value={privacy.education} onChange={handleRadioChange('education')}>
              <FormControlLabel value="public" control={<Radio />} label="公开" />
              <FormControlLabel value="private" control={<Radio />} label="保密" />
            </RadioGroup>
          </FormControl>
        </Box>
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
              <Grid item key={idx}><Avatar src={url} variant="rounded" sx={{ width: 56, height: 56 }} /></Grid>
            ))}
          </Grid>
        </Box>
        {error && <Typography color="error" mt={1}>{error}</Typography>}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={saving}>{saving ? '保存中...' : '保存修改'}</Button>
      </form>
    </Box>
  );
} 