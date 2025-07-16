"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Avatar, Card, CardContent, CardMedia, TextField, MenuItem, Button, FormControl, InputLabel, Select, Dialog, DialogTitle, DialogContent, DialogActions, Drawer } from "@mui/material";

const educationOptions = ["高中及以下", "大专", "本科", "硕士", "博士"];
const genderOptions = [
  { value: '', label: '全部' },
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' },
];

export default function SquarePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    gender: '',
    minAge: '',
    maxAge: '',
    minHeight: '',
    maxHeight: '',
    education: '',
  });
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async (params = {}) => {
    setLoading(true);
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/square${query ? '?' + query : ''}`);
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers(filters);
    // eslint-disable-next-line
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchUsers(filters);
  };

  const displayValue = (val: any, privacy: string | undefined) => {
    if (privacy === 'private') return '***';
    if (val === undefined || val === null || val === '') return '***';
    return val;
  };

  return (
    <Box maxWidth={1000} mx="auto" mt={4}>
      <Typography variant="h5" mb={2}>交友广场</Typography>
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>性别</InputLabel>
          <Select name="gender" value={filters.gender} label="性别" onChange={handleFilterChange}>
            {genderOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="最小年龄" name="minAge" value={filters.minAge} onChange={handleFilterChange} type="number" sx={{ width: 100 }} />
        <TextField label="最大年龄" name="maxAge" value={filters.maxAge} onChange={handleFilterChange} type="number" sx={{ width: 100 }} />
        <TextField label="最小身高" name="minHeight" value={filters.minHeight} onChange={handleFilterChange} type="number" sx={{ width: 100 }} />
        <TextField label="最大身高" name="maxHeight" value={filters.maxHeight} onChange={handleFilterChange} type="number" sx={{ width: 100 }} />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>学历</InputLabel>
          <Select name="education" value={filters.education} label="学历" onChange={handleFilterChange}>
            <MenuItem value="">全部</MenuItem>
            {educationOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSearch}>筛选</Button>
      </Box>
      <Grid container spacing={3}>
        {loading ? <Typography>加载中...</Typography> : users.length === 0 ? <Typography>暂无符合条件的用户</Typography> : users.map(user => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Card sx={{ mb: 2, cursor: 'pointer' }} onClick={() => setSelectedUser(user)}>
              <Box display="flex" alignItems="center" p={2}>
                <Avatar src={user.avatar} sx={{ width: 56, height: 56, mr: 2 }} />
                <Box>
                  <Typography variant="h6">{user.nickname}</Typography>
                  <Box mt={1}>
                    <Typography variant="body2" color="text.secondary">性别：{user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '其他'}</Typography>
                    <Typography variant="body2" color="text.secondary">年龄：{displayValue(user.age, user.age_privacy)}</Typography>
                    <Typography variant="body2" color="text.secondary">身高：{displayValue(user.height, user.height_privacy)}cm</Typography>
                    <Typography variant="body2" color="text.secondary">学历：{displayValue(user.education, user.education_privacy)}</Typography>
                    <Typography variant="body2" color="text.secondary">联系邮箱：{displayValue(user.email, user.email_privacy)}</Typography>
                  </Box>
                </Box>
              </Box>
              <CardContent>
                <Typography variant="body2" mb={1}>{user.description}</Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {user.life_photos && user.life_photos.map((url: string, idx: number) => (
                    <CardMedia key={idx} component="img" image={url} alt="生活照" sx={{ width: 80, height: 80, borderRadius: 2 }} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Drawer anchor="right" open={!!selectedUser} onClose={() => setSelectedUser(null)} sx={{ zIndex: 1301 }} PaperProps={{ sx: { width: 360, maxWidth: '90vw' } }}>
        {selectedUser && (
          <Box p={3}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar src={selectedUser.avatar} sx={{ width: 72, height: 72, mr: 2 }} />
              <Box>
                <Typography variant="h6">{selectedUser.nickname}</Typography>
                <Box mt={1}>
                  <Typography variant="body2" color="text.secondary">性别：{selectedUser.gender === 'male' ? '男' : selectedUser.gender === 'female' ? '女' : '其他'}</Typography>
                  <Typography variant="body2" color="text.secondary">年龄：{displayValue(selectedUser.age, selectedUser.age_privacy)}</Typography>
                  <Typography variant="body2" color="text.secondary">身高：{displayValue(selectedUser.height, selectedUser.height_privacy)}cm</Typography>
                  <Typography variant="body2" color="text.secondary">学历：{displayValue(selectedUser.education, selectedUser.education_privacy)}</Typography>
                  <Typography variant="body2" color="text.secondary">联系邮箱：{displayValue(selectedUser.email, selectedUser.email_privacy)}</Typography>
                </Box>
              </Box>
            </Box>
            <Typography variant="body2" mb={2}>{selectedUser.description}</Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              {selectedUser.life_photos && selectedUser.life_photos.map((url: string, idx: number) => (
                <CardMedia key={idx} component="img" image={url} alt="生活照" sx={{ width: 100, height: 100, borderRadius: 2 }} />
              ))}
            </Box>
            <Button variant="outlined" fullWidth onClick={() => setSelectedUser(null)}>返回列表</Button>
          </Box>
        )}
      </Drawer>
    </Box>
  );
} 