"use client";
import { Box, Typography, Divider, Paper } from "@mui/material";

export default function AboutPage() {
  return (
    <Box>
      <Box maxWidth={600} mx="auto" mt={8} p={4} boxShadow={2} borderRadius={2} bgcolor="#fff">
        <Typography variant="h5" mb={2}>关于我们</Typography>
        <Typography variant="body1" mb={2}>
          VolcFriends是一款由AI开发的生产级网站，具备真实的前后端，并部署在云上。
        </Typography>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>网站介绍：</Typography>
        <Typography variant="body2" mb={2}>
          用户可以注册登录成为会员，并将自己的信息发布到友谊广场上提供给其他用户查看，同时自己也可以在友谊广场筛选到想要进一步发展的心动用户。
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
      <Box mt={4}>
        <Paper elevation={2} sx={{ p: 3, maxWidth: 800, mx: 'auto', bgcolor: '#fff' }}>
          <Typography variant="h6" fontWeight={700} mb={2}>《VolcFriends站点协议》</Typography>
          <Typography variant="body2" whiteSpace="pre-line">
            {`欢迎使用 VolcFriends（火山交友网）测试站点。\n本网站仅供功能演示和技术测试使用，**请勿注册、填写真实个人信息或用于任何实际交友目的**。\n所有在本网站注册、填写、上传的内容仅用于测试，站点不对数据的安全性、隐私性、可用性及由此产生的任何后果承担责任。\n如因使用本测试站点造成任何损失、纠纷或法律责任，均由用户自行承担，站点及开发者不承担任何责任。\n如不同意本协议，请勿注册或登录本网站。`}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
} 