"use client";
import React, { useState } from "react";
import { Box, Button, TextField, Typography, InputLabel, MenuItem, Select, FormControl, Avatar, Grid, IconButton, CircularProgress, SelectChangeEvent } from "@mui/material";
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useRouter } from "next/navigation";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import RefreshIcon from '@mui/icons-material/Refresh';

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
    email: "",
    captcha: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [lifePhotos, setLifePhotos] = useState<File[]>([]);
  const [lifePhotoUrls, setLifePhotoUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMsg, setDialogMsg] = useState("");
  const [agree, setAgree] = useState(false);
  const [protocolOpen, setProtocolOpen] = useState(false);
  const [captchaUrl, setCaptchaUrl] = useState("");
  const [captchaId, setCaptchaId] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 对年龄和身高字段进行数字验证
    if ((name === 'age' || name === 'height') && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return; // 如果不是数字，不更新状态
      }
    }
    
    setForm({ ...form, [name]: value });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!avatar) {
      setError("请上传头像");
      return;
    }
    if (!agree) {
      setError('请先阅读并同意《VolcFriends站点协议》');
      return;
    }
    // 必填项校验
    if (!form.username || !form.password || !form.nickname || !form.gender || !form.description) {
      setError('请填写所有必填项');
      return;
    }
    // 邮箱格式校验（如有邮箱字段）
    if (form.email && !/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(form.email)) {
      setError('邮箱格式不正确');
      return;
    }
    // 生活照数量校验
    if (lifePhotos.length > 3) {
      setError('生活照最多3张');
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
    // 用户名长度校验
    if (form.username.length < 6 || form.username.length > 32) {
      setError('用户名长度需在6~32位之间');
      return;
    }
    // 密码长度校验
    if (form.password.length < 6 || form.password.length > 64) {
      setError('密码长度需在6~64位之间');
      return;
    }
    // 邮箱长度校验
    if (form.email && form.email.length > 128) {
      setError('邮箱不能超过128位');
      return;
    }
    // 用户名唯一性前端提示
    const checkRes = await fetch(`/api/auth/register?username=${encodeURIComponent(form.username)}`);
    const checkData = await checkRes.json();
    if (!checkRes.ok || checkData.exists) {
      setError('用户名已存在');
      return;
    }
    // 密码强度校验：大于6位且包含字母和数字
    if (form.password.length < 7 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      setError("密码必须大于6位且包含字母和数字");
      setLoading(false);
      return;
    }
    // 验证码校验
    if (!form.captcha) {
      setError('请输入验证码');
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
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          ...form, 
          avatar: avatarUrl, 
          life_photos: lifePhotoUrls, 
          is_public: form.is_public === "1" ? "1" : "0",
          captchaId: captchaId
        })
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

  const handleGenderChange = (e: SelectChangeEvent<string>) => {
    setForm({ ...form, gender: e.target.value });
  };
  const handleEducationChange = (e: SelectChangeEvent<string>) => {
    setForm({ ...form, education: e.target.value });
  };
  const handleIsPublicChange = (e: SelectChangeEvent<string>) => {
    setForm({ ...form, is_public: e.target.value });
  };

  // 生成验证码
  const generateCaptcha = async () => {
    try {
      const response = await fetch('/api/auth/captcha');
      const svgText = await response.text();
      const id = response.headers.get('X-Captcha-Id');
      setCaptchaUrl(`data:image/svg+xml;base64,${btoa(svgText)}`);
      setCaptchaId(id || '');
    } catch (error) {
      console.error('生成验证码失败:', error);
    }
  };

  // 组件加载时生成验证码
  React.useEffect(() => {
    generateCaptcha();
  }, []);

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
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Typography variant="h5">注册账号</Typography>
      </Box>
      <form onSubmit={handleSubmit}>
        <TextField label="用户名" name="username" value={form.username ?? ""} onChange={handleInputChange} fullWidth margin="normal" required />
        <TextField label="密码" name="password" value={form.password ?? ""} onChange={handleInputChange} fullWidth margin="normal" required type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <IconButton onClick={() => setShowPassword(v => !v)} edge="end" tabIndex={-1}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            )
          }}
        />
        <TextField label="联系邮箱" name="email" value={form.email ?? ""} onChange={handleInputChange} fullWidth margin="normal" type="email" />
        <TextField label="昵称" name="nickname" value={form.nickname ?? ""} onChange={handleInputChange} fullWidth margin="normal" required />
        <FormControl fullWidth margin="normal">
          <InputLabel>性别</InputLabel>
          <Select name="gender" value={form.gender} label="性别" onChange={handleGenderChange} required>
            <MenuItem value="male">男</MenuItem>
            <MenuItem value="female">女</MenuItem>
            <MenuItem value="other">其他</MenuItem>
          </Select>
        </FormControl>
        <TextField label="年龄（选填）" name="age" value={form.age ?? ""} onChange={handleInputChange} fullWidth margin="normal" />
        <TextField label="身高(cm, 选填)" name="height" value={form.height ?? ""} onChange={handleInputChange} fullWidth margin="normal" />
        <FormControl fullWidth margin="normal">
          <InputLabel>学历（选填）</InputLabel>
          <Select name="education" value={form.education} label="学历（选填）" onChange={handleEducationChange}>
            <MenuItem value="">未填写</MenuItem>
            {educationOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="个人描述" name="description" value={form.description ?? ""} onChange={handleInputChange} fullWidth margin="normal" required multiline rows={3} />
        <FormControl fullWidth margin="normal">
          <InputLabel>是否公开</InputLabel>
          <Select name="is_public" value={form.is_public} label="是否公开" onChange={handleIsPublicChange} required>
            <MenuItem value="1">公开</MenuItem>
            <MenuItem value="0">隐藏</MenuItem>
          </Select>
        </FormControl>
        
        {/* 验证码 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <TextField
            label="验证码"
            name="captcha"
            value={form.captcha}
            onChange={handleInputChange}
            sx={{ flex: 1 }}
            required
            placeholder="请输入验证码"
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {captchaUrl && (
              <>
                <Box
                  component="img"
                  src={captchaUrl}
                  alt="验证码"
                  sx={{ 
                    width: 120, 
                    height: 40,
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                  onClick={generateCaptcha}
                  title="点击刷新验证码"
                />
                <IconButton
                  size="small"
                  onClick={generateCaptcha}
                  sx={{
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
                    '&:hover': {
                      backgroundColor: '#e0e0e0',
                      transform: 'rotate(180deg)'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 18, color: '#666' }} />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
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
        <FormControlLabel
          control={<Checkbox checked={agree} onChange={e => setAgree(e.target.checked)} required />}
          label={
            <span>
              <span style={{ color: '#f44336', marginRight: 2 }}>*</span>
              我已阅读并同意
              <span style={{ display: 'inline', verticalAlign: 'baseline' }}>
                <Button variant="text" size="small" onClick={() => setProtocolOpen(true)} sx={{ p: 0, minWidth: 0, verticalAlign: 'baseline' }} disableTouchRipple disableFocusRipple>
                  《VolcFriends站点协议》
                </Button>
              </span>
            </span>
          }
          sx={{ mt: 1, '& .MuiFormControlLabel-asterisk': { display: 'none' } }}
        />
        <Dialog open={protocolOpen} onClose={() => setProtocolOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>VolcFriends站点协议</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" whiteSpace="pre-line">
              {`欢迎使用 VolcFriends 测试站点。\n本网站仅供功能演示和技术测试使用，**请勿注册、填写真实个人信息或用于任何实际交友目的**。\n所有在本网站注册、填写、上传的内容仅用于测试，站点不对数据的安全性、隐私性、可用性及由此产生的任何后果承担责任。\n如因使用本测试站点造成任何损失、纠纷或法律责任，均由用户自行承担，站点及开发者不承担任何责任。\n如不同意本协议，请勿注册或登录本网站。`}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProtocolOpen(false)}>关闭</Button>
          </DialogActions>
        </Dialog>
        {error && <Typography color="error" mt={1}>{error}</Typography>}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>{loading ? '注册中...' : '注册'}</Button>
      </form>
      {/* 这里不再显示忘记密码和修改密码入口 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>提示</DialogTitle>
        <DialogContent>{dialogMsg}</DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 