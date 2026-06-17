"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Home, Search, User, PlusCircle, Calendar, BarChart3, Settings, LogOut, Menu, X, ShieldAlert, Building2 } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-8 h-8 text-rose-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
              宿家民宿
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              <Home className="w-4 h-4" />
              <span>首页</span>
            </Link>
            {user && (user.role === "HOST" || user.role === "ADMIN") && (
              <>
                <Link
                  href="/host/properties"
                  className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  <Building2 className="w-4 h-4" />
                  <span>我的房源</span>
                </Link>
                <Link
                  href="/host/dashboard"
                  className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>数据中心</span>
                </Link>
              </>
            )}
            {user && user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>管理员后台</span>
              </Link>
            )}
            {user && (
              <Link
                href="/bookings"
                className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                <Calendar className="w-4 h-4" />
                <span>我的订单</span>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <img
                    src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                  <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                  {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className="badge bg-rose-100 text-rose-700 mt-1">
                        {user.role === "ADMIN" ? "管理员" : user.role === "HOST" ? "房东" : "房客"}
                      </span>
                    </div>
                    <div className="py-1">
                      {(user.role === "HOST" || user.role === "ADMIN") && (
                        <Link
                          href="/properties/new"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>发布新房源</span>
                        </Link>
                      )}
                      <Link
                        href="/bookings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>我的订单</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>退出登录</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login" className="btn-secondary">
                  登录
                </Link>
                <Link href="/auth/register" className="btn-primary">
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
