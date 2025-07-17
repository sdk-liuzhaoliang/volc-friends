"use client";
import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, Avatar, Grid, IconButton, FormControl, InputLabel, Select, MenuItem, CircularProgress, RadioGroup, FormControlLabel, Radio, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useRouter } from "next/navigation";
import type { User } from "@/types/user";
import type { SelectChangeEvent } from "@mui/material/Select";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useUser } from "@/context/UserContext";

const educationOptions = ["幼儿园", "小学", "初中", "高中", "大专", "本科", "硕士", "博士"];

export default function ProfilePage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [form, setForm] = useState<(Partial<User> & { is_public?: string }) | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [lifePhotos, setLifePhotos] = useState<File[]>([]);
  const [lifePhotoUrls, setLifePhotoUrls] = useState<string[]>([]);
  const [originalLifePhotoUrls, setOriginalLifePhotoUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [privacy, setPrivacy] = useState({ age: 'public', height: 'public', education: 'public' });
  const [successMsg, setSuccessMsg] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formBackup, setFormBackup] = useState<typeof form | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      const photos = data.user.life_photos || [];
      setLifePhotoUrls(photos);
      setOriginalLifePhotoUrls(photos);
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
  const handleRadioChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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
    // 追加新照片到已有照片，但不超过3张
    const newFiles = [...lifePhotos, ...files].slice(0, 3);
    setLifePhotos(newFiles);
    
    // 生成预览URL：保留原有照片的URL + 新照片的预览URL
    const existingUrls = lifePhotoUrls.slice(0, lifePhotoUrls.length);
    const newPreviewUrls = newFiles.slice(lifePhotos.length).map(f => URL.createObjectURL(f));
    setLifePhotoUrls([...existingUrls, ...newPreviewUrls]);
  };
  // 删除生活照片
  const handleDeleteLifePhoto = (idx: number) => {
    // 删除对应索引的文件和URL
    const newFiles = lifePhotos.filter((_, i) => i !== idx);
    setLifePhotos(newFiles);
    
    const newUrls = lifePhotoUrls.filter((_, i) => i !== idx);
    setLifePhotoUrls(newUrls);
  };

  // 移除未使用的函数

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        // 清除本地存储
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        
        // 清除用户状态
        setUser(null);
        
        // 显示成功消息
        setSuccessMsg('账号注销成功');
        setDialogOpen(false);
        
        // 延迟跳转到首页
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || '注销失败，请稍后重试');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setDeleting(false);
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
      let lifePhotoUrlsToUse = [...lifePhotoUrls]; // 复制当前的照片URL
      if (lifePhotos.length > 0) {
        // 计算新添加的照片数量
        const newPhotoCount = lifePhotos.length - originalLifePhotoUrls.length;
        if (newPhotoCount > 0) {
          // 只上传新添加的照片
          const newPhotos = lifePhotos.slice(-newPhotoCount);
          const newUrls = [];
          for (const file of newPhotos) {
            newUrls.push(await uploadFile(file));
          }
          lifePhotoUrlsToUse = [...lifePhotoUrls, ...newUrls];
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
        setEditMode(false);
        // 更新原始照片URL，以便下次编辑时正确计算新照片
        setOriginalLifePhotoUrls(lifePhotoUrlsToUse);
        setLifePhotoUrls(lifePhotoUrlsToUse);
        setLifePhotos([]); // 清空新上传的照片
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



  if (typeof window === 'undefined' || loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;

  // 只读态渲染
  if (!editMode) {
    return (
      <Box maxWidth={720} mx="auto" mt={4}>
        <Box p={3} boxShadow={2} borderRadius={2} bgcolor="#fff" mb={3}>
          {successMsg && <Box mb={2}><Typography color="success.main" fontWeight={600} textAlign="center">{successMsg}</Typography></Box>}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h5" fontWeight={700} align="left">我的信息</Typography>
            <IconButton onClick={() => { 
              setEditMode(true); 
              setFormBackup(form); 
              setLifePhotos([]); // 重置新上传的照片
            }} color="primary"><EditIcon /></IconButton>
          </Box>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 64, display: 'inline-block' }}>用户名：</Typography>
            <Typography variant="body2" color="text.primary" sx={{ ml: 1, display: 'inline-block' }}>{form!.username}</Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 64, display: 'inline-block' }}>联系邮箱：</Typography>
            <Typography variant="body2" color="text.primary" sx={{ ml: 1, display: 'inline-block' }}>{form!.email}</Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 64, display: 'inline-block' }}>昵称：</Typography>
            <Typography variant="body2" color="text.primary" sx={{ ml: 1, display: 'inline-block' }}>{form!.nickname}</Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 64, display: 'inline-block' }}>性别：</Typography>
            <Typography variant="body2" color="text.primary" sx={{ ml: 1, display: 'inline-block' }}>{form!.gender === 'male' ? '男' : form!.gender === 'female' ? '女' : '其他'}</Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 64, display: 'inline-block' }}>年龄：</Typography>
            <Typography variant="body2" color="text.primary" sx={{ ml: 1, display: 'inline-block' }}>{form!.age ?? '未填写'}</Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 64, display: 'inline-block' }}>身高：</Typography>
            <Typography variant="body2" color="text.primary" sx={{ ml: 1, display: 'inline-block' }}>{form!.height ? `${form!.height}cm` : '未填写'}</Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 64, display: 'inline-block' }}>学历：</Typography>
            <Typography variant="body2" color="text.primary" sx={{ ml: 1, display: 'inline-block' }}>{form!.education || '未填写'}</Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 64, display: 'inline-block' }}>个人描述：</Typography>
            <Typography variant="body2" color="text.primary" sx={{ ml: 1, display: 'inline-block', whiteSpace: 'pre-line' }}>{form!.description}</Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 64, display: 'inline-block' }}>是否公开到友谊广场：</Typography>
            <Typography variant="body2" color="text.primary" sx={{ ml: 1, display: 'inline-block' }}>{form!.is_public === '1' ? '公开' : '隐藏'}</Typography>
          </Box>
          <Box mt={2} mb={1}>
            <Typography>头像</Typography>
            <Avatar src={avatarUrl} sx={{ width: 56, height: 56, ml: 2 }} />
          </Box>
          <Box mt={2} mb={1}>
            <Typography>生活照片（最多3张，选填）</Typography>
            <Grid container spacing={1} mt={1}>
              {lifePhotoUrls.length === 0 ? (
                <Typography variant="body2" color="text.disabled" sx={{ ml: 1 }}>暂未上传照片</Typography>
              ) : lifePhotoUrls.map((url, idx) => (
                <Box key={idx} sx={{ width: 200, height: 200, display: 'inline-block', mr: 1, position: 'relative' }}>
                  <Box component="img" src={url} sx={{ width: 200, height: 200, objectFit: 'cover' }} />
                </Box>
              ))}
            </Grid>
          </Box>
        </Box>
        {/* 账号管理卡片和其它内容保持不变 */}
        <Box p={3} boxShadow={2} borderRadius={2} bgcolor="#fff" mt={3}>
          <Typography variant="h6" fontWeight={700} align="left" mb={2}>账号管理</Typography>
          <Button variant="outlined" color="primary" onClick={() => setPwdDialogOpen(true)} fullWidth sx={{ mb: 2 }}>修改密码</Button>
          <Button variant="outlined" color="error" onClick={() => setDialogOpen(true)} fullWidth>账号注销</Button>
        </Box>
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>确认注销账号</DialogTitle>
          <DialogContent>
            <Typography variant="body1" color="error" sx={{ mb: 2 }}>
              警告：此操作不可逆！
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              注销账号后，您的所有数据将被永久删除，包括：
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 2 }}>
              <li>个人信息和头像</li>
              <li>生活照片</li>
              <li>账号登录记录</li>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              确定要注销账号吗？
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>取消</Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? '注销中...' : '确认注销'}
            </Button>
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

  // 编辑态渲染（原表单）
  return (
    <Box maxWidth={720} mx="auto" mt={4}>
      <Box p={3} boxShadow={2} borderRadius={2} bgcolor="#fff" mb={3}>
        {successMsg && <Box mb={2}><Typography color="success.main" fontWeight={600} textAlign="center">{successMsg}</Typography></Box>}
        <Typography variant="h5" fontWeight={700} align="left" mb={2}>我的信息</Typography>
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 64, display: 'inline-block' }}>用户名：</Typography>
          <Typography variant="body2" color="text.primary" sx={{ ml: 1, display: 'inline-block' }}>{form!.username}</Typography>
        </Box>
        <form onSubmit={handleSave}>
          <TextField label="联系邮箱" name="email" value={form!.email ?? ""}
            onChange={handleInputChange} fullWidth margin="normal" required />
          <TextField label="昵称" name="nickname" value={form!.nickname ?? ""} onChange={handleInputChange} fullWidth margin="normal" required />
          <FormControl fullWidth margin="normal">
            <InputLabel>性别</InputLabel>
            <Select name="gender" value={form!.gender || ""} label="性别" onChange={handleSelectChange} required>
              <MenuItem value="male">男</MenuItem>
              <MenuItem value="female">女</MenuItem>
              <MenuItem value="other">其他</MenuItem>
            </Select>
          </FormControl>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField label="年龄" name="age" value={form!.age ?? ""} onChange={handleInputChange} fullWidth margin="normal" />
            <FormControl sx={{ mt: 2 }}>
              <RadioGroup row value={privacy.age} onChange={handleRadioChange('age')}>
                <FormControlLabel value="public" control={<Radio />} label="公开" />
                <FormControlLabel value="private" control={<Radio />} label="保密" />
              </RadioGroup>
            </FormControl>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField label="身高(cm)" name="height" value={form!.height ?? ""} onChange={handleInputChange} fullWidth margin="normal" />
            <FormControl sx={{ mt: 2 }}>
              <RadioGroup row value={privacy.height} onChange={handleRadioChange('height')}>
                <FormControlLabel value="public" control={<Radio />} label="公开" />
                <FormControlLabel value="private" control={<Radio />} label="保密" />
              </RadioGroup>
            </FormControl>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl fullWidth margin="normal">
              <InputLabel>学历</InputLabel>
              <Select name="education" value={form!.education || ""} label="学历" onChange={handleSelectChange}>
                {educationOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ mt: 2 }}>
              <RadioGroup row value={privacy.education} onChange={handleRadioChange('education')}>
                <FormControlLabel value="public" control={<Radio />} label="公开" />
                <FormControlLabel value="private" control={<Radio />} label="保密" />
              </RadioGroup>
            </FormControl>
          </Box>
          <TextField label="个人描述" name="description" value={form!.description ?? ""} onChange={handleInputChange} fullWidth margin="normal" required multiline rows={3} />
          <FormControl fullWidth margin="normal">
            <InputLabel>是否公开到友谊广场</InputLabel>
            <Select name="is_public" value={form!.is_public || ""} label="是否公开到友谊广场" onChange={handleSelectChange} required>
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
                <Box key={idx} sx={{ width: 200, height: 200, display: 'inline-block', mr: 1, position: 'relative' }}>
                  <Box component="img" src={url} sx={{ width: 200, height: 200, objectFit: 'cover' }} />
                  <IconButton size="small" sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white' }} onClick={() => handleDeleteLifePhoto(idx)}>
                    ×
                  </IconButton>
                </Box>
              ))}
            </Grid>
          </Box>
          {error && <Typography color="error" mt={1}>{error}</Typography>}
          <Box display="flex" alignItems="center" justifyContent="flex-end" gap={2} mb={2}>
            <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 120 }} startIcon={<SaveIcon />} disabled={saving}>{saving ? '保存中...' : '保存修改'}</Button>
            <Button type="button" variant="outlined" color="primary" sx={{ minWidth: 120 }} startIcon={<CloseIcon />} onClick={() => { 
              setEditMode(false); 
              setForm(formBackup!); 
              setLifePhotos([]);
              setLifePhotoUrls(originalLifePhotoUrls);
              setError(""); 
            }} disabled={saving}>取消</Button>
          </Box>
        </form>
      </Box>
      {/* 账号管理卡片 */}
      <Box p={3} boxShadow={2} borderRadius={2} bgcolor="#fff" mt={3}>
        <Typography variant="h6" fontWeight={700} align="left" mb={2}>账号管理</Typography>
        <Button variant="outlined" color="primary" onClick={() => setPwdDialogOpen(true)} fullWidth sx={{ mb: 2 }}>修改密码</Button>
        <Button variant="outlined" color="error" onClick={() => setDialogOpen(true)} fullWidth>账号注销</Button>
      </Box>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>确认注销账号</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="error" sx={{ mb: 2 }}>
            警告：此操作不可逆！
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            注销账号后，您的所有数据将被永久删除，包括：
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 2 }}>
            <li>个人信息和头像</li>
            <li>生活照片</li>
            <li>账号登录记录</li>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            确定要注销账号吗？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDeleteAccount}
            disabled={deleting}
          >
            {deleting ? '注销中...' : '确认注销'}
          </Button>
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