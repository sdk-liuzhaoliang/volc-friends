"use client";
import { Box, Button, Typography, Stack, Container, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import { useUser } from "@/context/UserContext";

export default function HomePage() {
  const router = useRouter();
  const [protocolOpen, setProtocolOpen] = useState(false);
  const { user, setUser, loadingUser } = useUser();
  // 去除 hydrated

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    if (typeof window !== 'undefined') localStorage.removeItem('token');
    setUser(null);
  };
  // 不要 if (loadingUser) return null;
  if (typeof window === 'undefined' || loadingUser) {
    return (
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', pb: 8 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <img src={`/logo.png?v=${Date.now()}`} alt="VolcFriends Logo" style={{ width: 52, height: 52, marginRight: 14, borderRadius: 11, background: '#fff' }} />
          <Typography variant="h3" fontWeight={700} color="primary.main">VolcFriends</Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" mb={4} align="center">
          让心动如火山般悄然涌现，<br />
          在这里与温暖和热烈相逢。
        </Typography>
        <Stack spacing={2} width="100%">
          <Box height={120} />
        </Stack>
      </Container>
    );
  }
  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', pb: 8 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <img src={`/logo.png?v=${Date.now()}`} alt="VolcFriends Logo" style={{ width: 65, height: 65, marginRight: 18, borderRadius: 11, background: '#fff' }} />
        <Typography variant="h3" fontWeight={700} color="primary.main" sx={{ fontSize: 62.5 }}>
          VolcFriends
        </Typography>
      </Box>
      <Typography variant="h6" color="text.secondary" mb={4} align="center">
        让心动如火山般涌现，在这里与温暖和热烈相逢。
      </Typography>
      <Stack spacing={2} width="100%">
        <Button variant="contained" size="large" onClick={() => router.push('/square')}>进入友谊广场</Button>
        {loadingUser ? (
          <Box height={120} />
        ) : (
          user ? (
            <>
              <Typography color="success.main" fontWeight={600} fontSize={16} mb={1} textAlign="center">您已登录</Typography>
              <Box display="flex" alignItems="center" justifyContent="center" gap={2} mt={4}
                sx={{ bgcolor: '#f3f6fa', borderRadius: 2, px: 2, py: 1, boxShadow: '0 1px 4px 0 rgba(0,0,0,0.03)' }}>
                <Avatar src={user.avatar} sx={{ width: 36, height: 36 }} />
                <Typography fontWeight={600} fontSize={16} sx={{ minWidth: 80 }}>{user.nickname || user.username}</Typography>
                <Button variant="outlined" color="primary" size="small" sx={{ ml: 1 }} onClick={() => router.push('/profile')}>我的信息</Button>
                <Button variant="outlined" color="error" size="small" sx={{ ml: 1 }} onClick={handleLogout}>退出登录</Button>
              </Box>
            </>
          ) : (
            <>
              <Button variant="outlined" size="large" onClick={() => router.push('/login')}>登录</Button>
              <Button variant="text" size="large" onClick={() => router.push('/register')}>注册新账号</Button>
            </>
          )
        )}
      </Stack>
      <Box color="text.disabled" fontSize={14} display="flex" alignItems="center" sx={{ position: 'fixed', left: 0, bottom: 0, width: '100vw', justifyContent: 'center', py: 2, zIndex: 1200, background: 'transparent', boxShadow: 'none' }}>
        &copy; {new Date().getFullYear()} VolcFriends
        <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
          本网站由AI开发
          <span style={{ margin: '0 6px' }}>·</span>
          <Button variant="text" size="small" sx={{ p: 0, minWidth: 0, fontSize: 13, color: '#1976d2', textDecoration: 'underline', verticalAlign: 'baseline' }} onClick={() => setProtocolOpen(true)} disableTouchRipple disableFocusRipple>
            站点协议
          </Button>
        </span>
      </Box>
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
    </Container>
  );
}
