"use client";
import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, Avatar, Grid, IconButton, FormControl, InputLabel, Select, MenuItem, CircularProgress, RadioGroup, FormControlLabel, Radio, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useRouter } from "next/navigation";
import type { User } from "@/types/user";
import type { SelectChangeEvent } from "@mui/material/Select";

const educationOptions = ["高中及以下", "大专", "本科", "硕士", "博士"];

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<(Partial<User> & { is_public?: string }) | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [lifePhotos, setLifePhotos] = useState<File[]>([]);
  const [lifePhotoUrls, setLifePhotoUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [privacy, setPrivacy] = useState({ age: 'public', height: 'public', education: 'public' });
  const [successMsg, setSuccessMsg] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pwdDialogOpen, setPwdDialogOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    fetch('/api/user/profile', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(async res => {
      if (res.status === 401) {
        setForm(null);
        setLoading(true);
        router.push('/login');
        return;
      }
      const data = await res.json();
      setForm({
        ...data.user,
        is_public:
          data.user.is_public === "1" || data.user.is_public === 1 || data.user.is_public === true
            ? "1"
            : "0",
      } as Partial<User>);
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
  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as string;
    setForm({ ...form, [name]: e.target.value } as (Partial<User> & { is_public?: string }));
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
    // 追加新照片到已有照片
    const newFiles = [...lifePhotos, ...files].slice(0, 3);
    setLifePhotos(newFiles);
    setLifePhotoUrls(newFiles.map(f => URL.createObjectURL(f)));
  };
  // 删除生活照片
  const handleDeleteLifePhoto = (idx: number) => {
    const newFiles = lifePhotos.filter((_, i) => i !== idx);
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (data.url) return data.url;
    throw new Error('上传失败');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError("");
    // 前端必填校验
    if (!form.nickname || !form.gender || !form.email || !form.avatar || !form.description) {
      setError('请填写所有必填项');
      return;
    }
    // 邮箱格式校验
    const emailReg = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    if (!emailReg.test(form.email)) {
      setError('邮箱格式不正确');
      return;
    }
    // 邮箱长度校验
    if (form.email && form.email.length > 128) {
      setError('邮箱不能超过128位');
      return;
    }
    // 昵称长度校验
    if (form.nickname && form.nickname.length > 20) {
      setError('昵称不能超过20字');
      return;
    }
    // 个人描述长度校验
    if (form.description && form.description.length > 200) {
      setError('个人描述不能超过200字');
      return;
    }
    // 生活照数量校验
    if (lifePhotos.length > 3) {
      setError('生活照最多3张');
      return;
    }
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
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...form,
          age_privacy: privacy.age,
          height_privacy: privacy.height,
          education_privacy: privacy.education,
          avatar: avatarUrlToUse,
          life_photos: lifePhotoUrlsToUse,
          is_public: form.is_public === "1" ? "1" : "0"
        })
      });
      if (res.status === 401) {
        setError('登录态失效，请重新登录');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        setSaving(false);
        return;
      }
      if (!res.ok) {
        setError('服务器异常，请稍后重试');
        setSaving(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setError("");
        setSuccessMsg("保存成功");
        setTimeout(() => {
          setSuccessMsg("");
          window.location.reload();
        }, 2000);
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

  // XSS 转义函数
  const escapeHTML = (str: string) => str.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[c]||c));

  if (loading || !form) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      {/* 我的信息卡片 */}
      <Box p={3} boxShadow={2} borderRadius={2} bgcolor="#fff" mb={3}>
        {successMsg && <Box mb={2}><Typography color="success.main" fontWeight={600} textAlign="center">{successMsg}</Typography></Box>}
        <Typography variant="h5" fontWeight={700} align="left" mb={2}>我的信息</Typography>
        <form onSubmit={handleSave}>
          <TextField label="联系邮箱" name="email" value={escapeHTML(form.email ?? "")}
            onChange={handleInputChange} fullWidth margin="normal" required inputProps={{ maxLength: 128 }} />
          <TextField label="昵称" name="nickname" value={escapeHTML(form.nickname ?? "")} onChange={handleInputChange} fullWidth margin="normal" required />
          <FormControl fullWidth margin="normal">
            <InputLabel>性别</InputLabel>
            <Select name="gender" value={form.gender} label="性别" onChange={handleSelectChange} required>
              <MenuItem value="male">男</MenuItem>
              <MenuItem value="female">女</MenuItem>
              <MenuItem value="other">其他</MenuItem>
            </Select>
          </FormControl>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField label="年龄" name="age" value={form.age ?? ""} onChange={handleInputChange} fullWidth margin="normal" type="number" inputProps={{ min: 10, max: 150 }} />
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <RadioGroup row value={privacy.age} onChange={handleRadioChange('age')}>
                <FormControlLabel value="public" control={<Radio />} label="公开" />
                <FormControlLabel value="private" control={<Radio />} label="保密" />
              </RadioGroup>
            </FormControl>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField label="身高(cm)" name="height" value={form.height ?? ""} onChange={handleInputChange} fullWidth margin="normal" type="number" inputProps={{ min: 100, max: 250 }} />
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
          <TextField label="个人描述" name="description" value={escapeHTML(form.description ?? "")} onChange={handleInputChange} fullWidth margin="normal" required multiline rows={3} />
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
            <Typography>生活照片（最多3张，选填）</Typography>
            <label htmlFor="life-photo-upload">
              <input accept="image/*" id="life-photo-upload" type="file" hidden multiple onChange={handleLifePhotosChange} />
              <IconButton color="primary" component="span">
                <PhotoCamera />
              </IconButton>
            </label>
            <Grid container spacing={1} mt={1}>
              {lifePhotoUrls.map((url, idx) => (
                <Box key={idx} sx={{ width: 56, height: 56, display: 'inline-block', mr: 1, position: 'relative' }}>
                  <Avatar src={url} variant="rounded" sx={{ width: 56, height: 56 }} />
                  <IconButton size="small" sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white' }} onClick={() => handleDeleteLifePhoto(idx)}>
                    ×
                  </IconButton>
                </Box>
              ))}
            </Grid>
          </Box>
          {error && <Typography color="error" mt={1}>{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={saving}>{saving ? '保存中...' : '保存修改'}</Button>
        </form>
      </Box>
      {/* 账号管理卡片 */}
      <Box p={3} boxShadow={2} borderRadius={2} bgcolor="#fff" mt={3}>
        <Typography variant="h6" fontWeight={700} align="left" mb={2}>账号管理</Typography>
        <Button variant="outlined" color="primary" onClick={() => setPwdDialogOpen(true)} fullWidth sx={{ mb: 2 }}>修改密码</Button>
        <Button variant="outlined" color="error" onClick={() => setDialogOpen(true)} fullWidth>账号注销</Button>
      </Box>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>提示</DialogTitle>
        <DialogContent>AI正在忙其他事情，还没有开发注销功能，如果要删除账号请联系网站所有者。</DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={pwdDialogOpen} onClose={() => setPwdDialogOpen(false)}>
        <DialogTitle>提示</DialogTitle>
        <DialogContent>AI正在忙其他事情，密码修改功能还没有开发。</DialogContent>
        <DialogActions>
          <Button onClick={() => setPwdDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 