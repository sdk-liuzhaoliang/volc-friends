"use client";
import Link from "next/link";
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, IconButton } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import type { User } from "@/types/user";

export function VolcanoIcon({ size = 32, ...props }: { size?: number, [key: string]: any }) {
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
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/user/profile").then(async res => {
      if (res.status === 200) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    });
  }, [pathname]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAnchorEl(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ mb: 2 }}>
      <Toolbar sx={{ maxWidth: 1200, mx: "auto", width: "100%", px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <VolcanoIcon size={32} style={{ marginRight: 8 }} />
            <Typography variant="h6" color="primary" fontWeight={700} letterSpacing={1} sx={{ flexShrink: 0 }}>
              VolcFriends
            </Typography>
          </Link>
          <Button color="primary" component={Link} href="/square" sx={{ ml: 3, fontWeight: 500 }}>
            交友广场
          </Button>
          <Button color="primary" component={Link} href="/about" sx={{ ml: 2, fontWeight: 500 }}>
            关于我们
          </Button>
        </Box>
        <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
          {user ? (
            <>
              <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                <Avatar src={user.avatar} alt={user.nickname} sx={{ width: 36, height: 36 }} />
              </IconButton>
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
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
} 