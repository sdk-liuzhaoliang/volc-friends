"use client";
import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
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
      if (data.success) {
        router.push("/profile");
      } else {
        setError(data.error || "登录失败");
      }
    } catch (e: any) {
      setError(e.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8} p={3} boxShadow={2} borderRadius={2} bgcolor="#fff">
      <Typography variant="h5" mb={2}>登录</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="用户名" name="username" value={form.username} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="密码" name="password" value={form.password} onChange={handleChange} fullWidth margin="normal" required type="password" />
        {error && <Typography color="error" mt={1}>{error}</Typography>}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>{loading ? '登录中...' : '登录'}</Button>
      </form>
      <Box mt={2} textAlign="right">
        <Button onClick={() => router.push("/register")} size="small">没有账号？去注册</Button>
      </Box>
    </Box>
  );
} 