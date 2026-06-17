"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Building2, Mail, Lock, User as UserIcon, Phone, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "GUEST" as "GUEST" | "HOST",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) router.push("/");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (form.password.length < 6) {
      setErr("密码至少6位");
      return;
    }
    setLoading(true);
    const res = await register(form);
    setLoading(false);
    if (!res.success) {
      setErr(res.message || "注册失败");
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
          <h1 className="text-2xl font-bold text-gray-900">创建宿家账号</h1>
          <p className="text-sm text-gray-500 mt-2">开启你的短租之旅</p>
        </div>

        {err && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{err}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">注册身份</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "GUEST" })}
                className={`py-3 rounded-lg border-2 text-sm font-medium transition ${
                  form.role === "GUEST"
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                我是房客
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "HOST" })}
                className={`py-3 rounded-lg border-2 text-sm font-medium transition ${
                  form.role === "HOST"
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                我是房东
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">姓名</label>
            <div className="relative">
              <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                className="input-field pl-10"
                placeholder="请输入姓名"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">手机号（选填）</label>
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                className="input-field pl-10"
                placeholder="13800000000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                placeholder="至少6位密码"
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
            {loading ? "注册中..." : "注册"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          已有账号？{" "}
          <Link href="/auth/login" className="text-rose-600 hover:underline font-medium">
            去登录
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
