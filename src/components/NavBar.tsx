"use client";
import Link from "next/link";
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, IconButton, Drawer, List, ListItem, ListItemText, Divider } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import useMediaQuery from '@mui/material/useMediaQuery';
import ListItemButton from '@mui/material/ListItemButton';

function useClientMediaQuery(query: string) {
  const [mounted, setMounted] = React.useState(false);
  const match = useMediaQuery(query);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  return mounted ? match : false;
}

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

  const isMobile = useClientMediaQuery('(max-width:600px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  if (!hydrated || loadingUser) {
    return (
      <AppBar position="fixed" color="default" elevation={0} sx={{ mb: 2, bgcolor: '#1976d2', boxShadow: 'none', width: '100vw' }}>
        <Toolbar sx={{ width: '100%', px: 0, minHeight: 64 }}>
          {/* 左侧logo+标题，pl:2 */}
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: '0 0 auto', pl: 2 }}>
            <img src="/icon.png" alt="VolcFriends Logo" style={{ width: 39, height: 39, marginRight: 11, borderRadius: 9 }} />
            <Typography variant="h5" color="white" fontWeight={800} letterSpacing={1} sx={{ flexShrink: 0, fontSize: 28 }}>
              VolcFriends
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 0%' }} />
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }} />
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
    <AppBar position="fixed" color="default" elevation={0} sx={{ mb: 2, bgcolor: '#1976d2', boxShadow: 'none', width: '100vw' }}>
      <Toolbar sx={{ width: '100%', px: isMobile ? 1 : 0, minHeight: 64 }}>
        {/* 左侧logo+标题，pl:2 */}
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: '0 0 auto', pl: isMobile ? 0 : 2 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img src="/icon.png" alt="VolcFriends Logo" style={{ width: isMobile ? 32 : 39, height: isMobile ? 32 : 39, marginRight: isMobile ? 6 : 11, borderRadius: 9 }} />
            <Typography variant={isMobile ? "h6" : "h5"} color="white" fontWeight={800} letterSpacing={1} sx={{ flexShrink: 0, fontSize: isMobile ? 20 : 28 }}>
              VolcFriends
            </Typography>
          </Link>
        </Box>
        {/* 移动端汉堡菜单 */}
        {isMobile ? (
          <>
            <Box sx={{ flex: 1 }} />
            <IconButton edge="end" color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
              <MenuIcon sx={{ color: 'white' }} />
            </IconButton>
            <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle}>
              <Box sx={{ width: 220 }} role="presentation" onClick={handleDrawerToggle}>
                <List>
                  <ListItem disablePadding>
                    <ListItemButton component={Link} href="/">
                      <ListItemText primary="首页" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton component={Link} href="/square">
                      <ListItemText primary="友谊广场" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton component={Link} href="/about">
                      <ListItemText primary="关于" />
                    </ListItemButton>
                  </ListItem>
                </List>
                <Divider />
                <List>
                  {user ? (
                    <>
                      <ListItem disablePadding>
                        <ListItemButton onClick={() => { router.push("/profile"); }}>
                          <ListItemText primary="我的信息" />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton onClick={handleLogout}>
                          <ListItemText primary="退出登录" />
                        </ListItemButton>
                      </ListItem>
                    </>
                  ) : (
                    <>
                      <ListItem disablePadding>
                        <ListItemButton component={Link} href="/login">
                          <ListItemText primary="登录" />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton component={Link} href="/register">
                          <ListItemText primary="注册" />
                        </ListItemButton>
                      </ListItem>
                    </>
                  )}
                </List>
              </Box>
            </Drawer>
          </>
        ) : (
          <>
            {/* 菜单按钮区，flex:1自适应 */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: '1 1 0%', justifyContent: 'flex-start', ml: 3 }}>
              <Button sx={{ mx: 1.5, fontWeight: 500, color: 'white', fontSize: 16, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }} component={Link} href="/">
                首页
              </Button>
              <Button sx={{ mx: 1.5, fontWeight: 500, color: 'white', fontSize: 16, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }} component={Link} href="/square">
                友谊广场
              </Button>
              <Button sx={{ mx: 1.5, fontWeight: 500, color: 'white', fontSize: 16, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }} component={Link} href="/about">
                关于
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
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                      }}
                    >
                      <Avatar src={user.avatar} alt={user.nickname} sx={{ width: 36, height: 36 }} />
                      <Typography noWrap fontWeight={700} fontSize={16} maxWidth={90} sx={{ ml: 1, color: 'white' }}>{user.nickname}</Typography>
                      <KeyboardArrowDown sx={{ ml: 0.5, fontSize: 22, color: 'white' }} />
                    </Box>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                      <MenuItem onClick={() => { handleClose(); router.push("/profile"); }}>我的信息</MenuItem>
                      <MenuItem onClick={handleLogout}>退出登录</MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button variant="outlined" sx={{ mr: 1, color: 'white', borderColor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' } }} component={Link} href="/login">登录</Button>
                    <Button variant="contained" sx={{ bgcolor: 'white', color: '#1976d2', fontWeight: 600, '&:hover': { bgcolor: '#f5f5f5' } }} component={Link} href="/register">注册</Button>
                  </>
                )
              )}
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
} 