"use client";
import Link from "next/link";
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';

export function VolcanoIcon({ size = 32, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* 宽胖火山主体 */}
      <polygon points="12,44 24,16 36,44" fill="#388E3C" />
      {/* 山顶火焰 */}
      <polygon points="20,24 24,16 28,24" fill="#FFB300" />
    </svg>
  );
}

export default function NavBar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, setUser, loadingUser, setLoadingUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (!hydrated) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    fetch("/api/user/profile", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(async res => {
      if (res.status === 200) {
        const data = await res.json();
        setUser(data.user);
      } else if (res.status === 401) {
        if (typeof window !== 'undefined') localStorage.removeItem('token');
        setUser(null);
      } else {
        setUser(null);
      }
      setLoadingUser(false);
    });
  }, [pathname, hydrated]);

  if (typeof window === 'undefined' || loadingUser) {
    return (
      <AppBar position="fixed" color="default" elevation={0} sx={{ mb: 2, bgcolor: '#fff', boxShadow: 'none', width: '100vw' }}>
        <Toolbar sx={{ width: '100%', px: 0, minHeight: 64 }}>
          <Box sx={{ flex: '1 1 0%' }} />
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#f3f6fa' }} />
        </Toolbar>
      </AppBar>
    );
  }

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAnchorEl(null);
    if (typeof window !== 'undefined') localStorage.removeItem('token');
    setUser(null);
    router.push("/login");
  };

  return (
    <AppBar position="fixed" color="default" elevation={0} sx={{ mb: 2, bgcolor: '#fff', boxShadow: 'none', width: '100vw', borderBottom: '1px solid #e5eaf2' }}>
      <Toolbar sx={{ width: '100%', px: 0, minHeight: 64 }}>
        {/* 左侧logo+标题，pl:2 */}
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: '0 0 auto', pl: 2 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img src="/logo.png" alt="VolcFriends Logo" style={{ width: 39, height: 39, marginRight: 11, borderRadius: 9, background: '#fff' }} />
            <Typography variant="h5" color="primary" fontWeight={800} letterSpacing={1} sx={{ flexShrink: 0, fontSize: 28 }}>
              VolcFriends
            </Typography>
          </Link>
        </Box>
        {/* 菜单按钮区，flex:1自适应 */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: '1 1 0%', justifyContent: 'flex-start', ml: 3 }}>
          <Button color="primary" component={Link} href="/" sx={{ mx: 1.5, fontWeight: 500 }}>
            首页
          </Button>
          <Button color="primary" component={Link} href="/square" sx={{ mx: 1.5, fontWeight: 500 }}>
            友谊广场
          </Button>
          <Button color="primary" component={Link} href="/about" sx={{ mx: 1.5, fontWeight: 500 }}>
            关于我们
          </Button>
        </Box>
        {/* 右侧头像/登录注册区，pr:2 */}
        <Box sx={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', ml: 2, pr: 2, justifyContent: 'flex-end' }}>
          {loadingUser ? (
            <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#f3f6fa' }} />
          ) : (
            user ? (
              <>
                <Box
                  onClick={handleMenu}
                  sx={{
                    display: 'flex', alignItems: 'center', cursor: 'pointer',
                    px: 1, py: 0.5, borderRadius: 2,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                  }}
                >
                  <Avatar src={user.avatar} alt={user.nickname} sx={{ width: 36, height: 36 }} />
                  <Typography noWrap fontWeight={700} fontSize={16} maxWidth={90} sx={{ ml: 1 }}>{user.nickname}</Typography>
                  <KeyboardArrowDown sx={{ ml: 0.5, fontSize: 22, color: 'text.secondary' }} />
                </Box>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                  <MenuItem onClick={() => { handleClose(); router.push("/profile"); }}>我的信息</MenuItem>
                  <MenuItem onClick={handleLogout}>退出登录</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button color="primary" component={Link} href="/login" sx={{ mr: 1 }}>登录</Button>
                <Button variant="contained" color="primary" component={Link} href="/register">注册</Button>
              </>
            )
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
} 