"use client";
import { Box, Typography, Divider } from "@mui/material";

export default function AboutPage() {
  return (
    <Box maxWidth={600} mx="auto" mt={8} p={4} boxShadow={2} borderRadius={2} bgcolor="#fff">
      <Typography variant="h5" mb={2}>关于我们</Typography>
      <Typography variant="body1" mb={2}>
        VolcFriends是一款由AI开发的生产级网站，具备真实的前后端，并部署在云上。
      </Typography>
      <Typography variant="subtitle1" fontWeight={600} mb={1}>网站介绍：</Typography>
      <Typography variant="body2" mb={2}>
        用户可以注册登录成为会员，并将自己的信息发布到交友广场上提供给其他用户查看，同时自己也可以在交友广场筛选到想要进一步发展的心动用户。
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" fontWeight={600} mb={1}>制作者：</Typography>
      <Typography variant="body2" mb={2}>chenshize</Typography>
      <Typography variant="subtitle1" fontWeight={600} mb={1}>IDE：</Typography>
      <Typography variant="body2" mb={2}>Cursor</Typography>
      <Typography variant="subtitle1" fontWeight={600} mb={1}>大模型：</Typography>
      <Typography variant="body2" mb={2}>Claude-4-Sonnet</Typography>
      <Typography variant="subtitle1" fontWeight={600} mb={1}>开发框架：</Typography>
      <Typography variant="body2" mb={2}>Next.js</Typography>
      <Typography variant="subtitle1" fontWeight={600} mb={1}>UI框架：</Typography>
      <Typography variant="body2">Material UI</Typography>
    </Box>
  );
} 