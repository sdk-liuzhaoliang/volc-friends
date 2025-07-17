"use client";
import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMsg, setDialogMsg] = useState("");
  const [agree, setAgree] = useState(false);
  const [protocolOpen, setProtocolOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!agree) {
      setError('请先阅读并同意《VolcFriends站点协议》');
      setLoading(false);
      return;
    }
    try {
      // 用户名长度校验
      if (form.username.length < 6 || form.username.length > 32) {
        setError('用户名长度需在6~32位之间');
        setLoading(false);
        return;
      }
      // 密码长度校验
      if (form.password.length < 6 || form.password.length > 64) {
        setError('密码长度需在6~64位之间');
        setLoading(false);
        return;
      }
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        setError("服务器响应异常，请稍后重试");
        setLoading(false);
        return;
      }
      if (data.token) {
        // 登录成功，保存 token 并强制刷新页面
        localStorage.setItem('token', data.token);
        window.location.href = "/profile";
      } else {
        setError(data.error || "登录失败");
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message || "登录失败");
      } else {
        setError("登录失败");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8} p={3} boxShadow={2} borderRadius={2} bgcolor="#fff">
      <Typography variant="h5" mb={2}>登录</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="用户名" name="username" value={form.username ?? ""} onChange={handleChange} fullWidth margin="normal" required inputProps={{ maxLength: 32 }} />
        <TextField label="密码" name="password" value={form.password ?? ""} onChange={handleChange} fullWidth margin="normal" required type={showPassword ? "text" : "password"} inputProps={{ maxLength: 64 }}
          InputProps={{
            endAdornment: (
              <IconButton onClick={() => setShowPassword(v => !v)} edge="end" tabIndex={-1}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            )
          }}
        />
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
              {`欢迎使用 VolcFriends（火山交友网）测试站点。\n本网站仅供功能演示和技术测试使用，**请勿注册、填写真实个人信息或用于任何实际交友目的**。\n所有在本网站注册、填写、上传的内容仅用于测试，站点不对数据的安全性、隐私性、可用性及由此产生的任何后果承担责任。\n如因使用本测试站点造成任何损失、纠纷或法律责任，均由用户自行承担，站点及开发者不承担任何责任。\n如不同意本协议，请勿注册或登录本网站。`}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProtocolOpen(false)}>关闭</Button>
          </DialogActions>
        </Dialog>
        {error && <Typography color="error" mt={1}>{error}</Typography>}
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ fontWeight: 600, height: 42, fontSize: 16 }} disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </Button>
        </Box>
        <Box mt={2}>
          <Button
            type="button"
            onClick={() => router.push("/register")}
            size="large"
            fullWidth
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 600, height: 42, fontSize: 16 }}
          >
            没有账号？去注册
          </Button>
        </Box>
      </form>
      <Box mt={2} textAlign="right">
        <Button onClick={() => { setDialogMsg('AI正在忙其他事情，密码找回功能还没有开发。'); setDialogOpen(true); }} size="small" sx={{ ml: 1 }}>忘记密码？</Button>
      </Box>
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