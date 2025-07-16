"use client";
import { Box, Button, Typography, Stack, Container } from "@mui/material";
import { VolcanoIcon } from "@/components/NavBar";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box display="flex" alignItems="center" mb={3}>
        <VolcanoIcon size={32} style={{ marginRight: 8 }} />
        <Typography variant="h3" fontWeight={700} color="primary.main">VolcFriends</Typography>
      </Box>
      <Typography variant="h6" color="text.secondary" mb={4} align="center">
        让心动如火山般悄然涌现，<br />
        在这里与温暖和热烈相逢。
      </Typography>
      <Stack spacing={2} width="100%">
        <Button variant="contained" size="large" onClick={() => router.push('/square')}>进入交友广场</Button>
        <Button variant="outlined" size="large" onClick={() => router.push('/login')}>登录</Button>
        <Button variant="text" size="large" onClick={() => router.push('/register')}>注册新账号</Button>
      </Stack>
      <Box mt={8} color="text.disabled" fontSize={14} display="flex" alignItems="center">
        &copy; {new Date().getFullYear()} VolcFriends
        <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>本网站由AI开发</span>
      </Box>
    </Container>
  );
}
