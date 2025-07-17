"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Avatar, Card, CardContent, CardMedia, TextField, MenuItem, Button, FormControl, InputLabel, Select, Drawer, SelectChangeEvent, CircularProgress, Tooltip } from "@mui/material";
import type { User } from "@/types/user";

const educationOptions = ["高中及以下", "大专", "本科", "硕士", "博士"];
const genderOptions = [
  { value: '', label: '全部' },
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' },
];

export default function SquarePage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState({
    gender: '',
    minAge: '',
    maxAge: '',
    minHeight: '',
    maxHeight: '',
    education: '',
  });
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(12);

  const fetchUsers = async (params: Record<string, string> = {}) => {
    setLoading(true);
    const query = new URLSearchParams({ ...params, page: String(page), size: String(pageSize) }).toString();
    const res = await fetch(`/api/square${query ? '?' + query : ''}`);
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers(filters);
    // eslint-disable-next-line
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  const handleGenderChange = (e: SelectChangeEvent<string>) => {
    setFilters({ ...filters, gender: e.target.value });
  };
  const handleEducationChange = (e: SelectChangeEvent<string>) => {
    setFilters({ ...filters, education: e.target.value });
  };

  const handleSearch = () => {
    fetchUsers(filters);
  };

  const displayValue = (val: unknown, privacy: string | undefined): string => {
    if (privacy === 'private') return '***';
    if (val === undefined || val === null || val === '') return '***';
    return String(val);
  };

  return (
    <Box maxWidth={900} mx="auto" mb={4} pt={2} sx={{ paddingTop: '72px' }}>
      <Typography variant="h5" mb={3} sx={{ fontWeight: 800, fontSize: 28, ml: 1 }}>友谊广场</Typography>
      <Box display="flex" gap={2} flexWrap="wrap" mb={3} alignItems="center" sx={{ minHeight: 56 }}>
        <FormControl sx={{ minWidth: 120, height: 40 }} size="small">
          <InputLabel>性别</InputLabel>
          <Select name="gender" value={filters.gender} label="性别" onChange={handleGenderChange} size="small">
            {genderOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="最小年龄" name="minAge" value={filters.minAge ?? ""} onChange={handleInputChange} type="number" sx={{ width: 100, height: 40 }} size="small" inputProps={{ min: 10, max: 150 }} />
        <TextField label="最大年龄" name="maxAge" value={filters.maxAge ?? ""} onChange={handleInputChange} type="number" sx={{ width: 100, height: 40 }} size="small" inputProps={{ min: 10, max: 150 }} />
        <TextField label="最小身高" name="minHeight" value={filters.minHeight ?? ""} onChange={handleInputChange} type="number" sx={{ width: 100, height: 40 }} size="small" inputProps={{ min: 100, max: 250 }} />
        <TextField label="最大身高" name="maxHeight" value={filters.maxHeight ?? ""} onChange={handleInputChange} type="number" sx={{ width: 100, height: 40 }} size="small" inputProps={{ min: 100, max: 250 }} />
        <FormControl sx={{ minWidth: 120, height: 40 }} size="small">
          <InputLabel>学历</InputLabel>
          <Select name="education" value={filters.education} label="学历" onChange={handleEducationChange} size="small">
            <MenuItem value="">全部</MenuItem>
            {educationOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
        </FormControl>
        <Box flex={1} />
        <Button variant="contained" onClick={handleSearch} sx={{ height: 42, minWidth: 120, fontWeight: 600, fontSize: 16, ml: 'auto' }}>筛选</Button>
      </Box>
      {/* 分页控件美化 */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" mt={3} mb={2} gap={2}>
        <Typography
          variant="body2"
          color={page === 1 ? 'text.disabled' : 'primary'}
          sx={{ cursor: page === 1 ? 'default' : 'pointer', fontWeight: 600, fontSize: 15, px: 1, userSelect: 'none' }}
          onClick={page === 1 ? undefined : () => setPage(p => Math.max(1, p - 1))}
        >上一页</Typography>
        <Typography mx={1} fontWeight={500} fontSize={15} color="text.secondary">第 {page} 页</Typography>
        <Typography
          variant="body2"
          color={users.length < pageSize ? 'text.disabled' : 'primary'}
          sx={{ cursor: users.length < pageSize ? 'default' : 'pointer', fontWeight: 600, fontSize: 15, px: 1, userSelect: 'none' }}
          onClick={users.length < pageSize ? undefined : () => setPage(p => p + 1)}
        >下一页</Typography>
      </Box>
      <Box display="flex" flexDirection="column" alignItems="center" gap={3} mb={4}>
        {loading ? (
          <Box width="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={200}>
            <CircularProgress color="primary" sx={{ mb: 2 }} />
            <Typography color="text.secondary">正在加载友谊广场，请稍候...</Typography>
          </Box>
        ) : users.length === 0 ? (
          <Typography>暂无符合条件的用户</Typography>
        ) : users.map(user => (
          <Box key={user.id} sx={{ width: '100%', mb: 0, display: 'flex', alignItems: 'flex-start' }}>
            <Card
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                p: 2,
                borderRadius: 3,
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)',
                bgcolor: '#fff',
                mb: 0,
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)' },
                position: 'relative',
                width: '100%',
                minHeight: 0,
              }}
              onClick={() => setSelectedUser(user)}
            >
              {/* 头像区 */}
              <Avatar src={user.avatar} sx={{ width: 64, height: 64, mr: { xs: 0, sm: 3 }, mb: { xs: 1.5, sm: 0 }, flexShrink: 0 }} />
              {/* 主信息区 */}
              <Box flex={1} minWidth={0} display="flex" flexDirection="column" justifyContent="center">
                <Box display="flex" alignItems="center" mb={1.2}>
                  <Typography variant="subtitle1" fontWeight={700} fontSize={18} noWrap>{user.nickname}</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ ml: 2.5, mr: 1.5 }}>
                    {user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '其他'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mr: 1.5 }}>
                    {displayValue(user.age, user.age_privacy)}岁
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {displayValue(user.education, user.education_privacy)}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 48 }}>身高：</Typography>
                  <Tooltip title={displayValue(user.height, user.height_privacy) + 'cm'} placement="top">
                    <Typography variant="body2" color="text.primary" sx={{ ml: 1 }}>{displayValue(user.height, user.height_privacy)}cm</Typography>
                  </Tooltip>
                </Box>
                <Box display="flex" alignItems="flex-start" mb={1}>
                  <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 48, mt: 0.2 }}>邮箱：</Typography>
                  <Tooltip title={displayValue(user.email, user.email_privacy)} placement="top">
                    <Typography variant="body2" color="text.primary" sx={{ ml: 1, wordBreak: 'break-all', whiteSpace: 'pre-line' }}>{displayValue(user.email, user.email_privacy)}</Typography>
                  </Tooltip>
                </Box>
                <Box display="flex" alignItems="flex-start" mb={1}>
                  <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 64, mt: 0.2 }}>个人描述：</Typography>
                  <Tooltip title={user.description} placement="top">
                    <Typography variant="body2" color="text.primary" sx={{ ml: 1, whiteSpace: 'pre-line', wordBreak: 'break-all' }}>{user.description}</Typography>
                  </Tooltip>
                </Box>
                {/* 生活照片区：无照片也展示提示 */}
                <Box mb={1}>
                  <Typography variant="body2" color="text.secondary" fontWeight={700} noWrap sx={{ minWidth: 64, display: 'inline' }}>生活照片：</Typography>
                  {user.life_photos && user.life_photos.length > 0 ? (
                    <Box display="flex" gap={1.5} mt={1}>
                      {user.life_photos.slice(0, 3).map((url: string, idx: number) => (
                        <CardMedia key={idx} component="img" image={url} alt="生活照片" sx={{ width: 56, height: 56, borderRadius: 2, objectFit: 'cover' }} />
                      ))}
                      {user.life_photos.length > 3 && (
                        <Box display="flex" alignItems="center" justifyContent="center" sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#f0f0f0', color: 'text.secondary', fontSize: 18 }}>
                          +{user.life_photos.length - 3}
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.disabled" sx={{ display: 'inline', ml: 1 }}>该用户暂未上传照片</Typography>
                  )}
                </Box>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>
      <Drawer anchor="right" open={!!selectedUser} onClose={() => setSelectedUser(null)} sx={{ zIndex: 1301 }} PaperProps={{ sx: { width: 720, maxWidth: '90vw' } }}>
        {selectedUser && (
          <Box p={3}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar src={selectedUser.avatar} sx={{ width: 72, height: 72, mr: 2 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>{selectedUser.nickname}</Typography>
                <Box mt={1}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 48 }}>性别：</Typography>
                    <Typography variant="body2" color="text.primary" sx={{ ml: 1 }}>{selectedUser.gender === 'male' ? '男' : selectedUser.gender === 'female' ? '女' : '其他'}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 48 }}>年龄：</Typography>
                    <Typography variant="body2" color="text.primary" sx={{ ml: 1 }}>{displayValue(selectedUser.age, selectedUser.age_privacy)}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 48 }}>身高：</Typography>
                    <Typography variant="body2" color="text.primary" sx={{ ml: 1 }}>{displayValue(selectedUser.height, selectedUser.height_privacy)}cm</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 48 }}>学历：</Typography>
                    <Typography variant="body2" color="text.primary" sx={{ ml: 1 }}>{displayValue(selectedUser.education, selectedUser.education_privacy)}</Typography>
                  </Box>
                  <Box display="flex" alignItems="flex-start" mb={1}>
                    <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 48, mt: 0.2 }}>邮箱：</Typography>
                    <Typography variant="body2" color="text.primary" sx={{ ml: 1, wordBreak: 'break-all', whiteSpace: 'pre-line' }}>{displayValue(selectedUser.email, selectedUser.email_privacy)}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box mb={2}>
              <Box display="flex" alignItems="flex-start" mb={1}>
                <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ minWidth: 64, mt: 0.2 }}>个人描述：</Typography>
                <Typography variant="body2" color="text.primary" sx={{ ml: 1, whiteSpace: 'pre-line', wordBreak: 'break-all' }}>{selectedUser.description}</Typography>
              </Box>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" fontWeight={700} color="text.secondary" mb={1}>生活照片：</Typography>
              {selectedUser.life_photos && selectedUser.life_photos.length > 0 ? (
                <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center" mt={1}>
                  {selectedUser.life_photos.map((url: string, idx: number) => (
                    <CardMedia key={idx} component="img" image={url} alt="生活照片" sx={{ width: 100, height: 100, borderRadius: 2 }} />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.disabled" sx={{ display: 'inline', ml: 1 }}>该用户暂未上传照片</Typography>
              )}
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
} 