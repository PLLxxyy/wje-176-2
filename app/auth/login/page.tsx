"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Building2, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    router.push("/");
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await login(form.email, form.password);
    setLoading(false);
    if (!res.success) {
      setErr(res.message || "登录失败");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
      <div className="card p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Building2 className="w-12 h-12 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
          <p className="text-sm text-gray-500 mt-2">登录你的宿家账号</p>
        </div>

        {err && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{err}</div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱地址</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                className="input-field pl-10"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPwd ? "text" : "password"}
                required
                className="input-field pl-10 pr-10"
                placeholder="请输入密码"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          还没有账号？{" "}
          <Link href="/auth/register" className="text-rose-600 hover:underline font-medium">
            立即注册
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 space-y-2 text-xs text-gray-400 text-center">
          <p>快速体验账号：</p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-2 py-1 bg-gray-50 rounded">admin@staybnb.com / 123456</span>
            <span className="px-2 py-1 bg-gray-50 rounded">host1@staybnb.com / 123456</span>
            <span className="px-2 py-1 bg-gray-50 rounded">guest1@staybnb.com / 123456</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
