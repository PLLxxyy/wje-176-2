"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Building2, Check, X, Eye, MapPin, Users, BedDouble, Star,
  ChevronLeft, Filter, Search
} from "lucide-react";
import { PROPERTY_STATUS_LABELS, formatCurrency, ROOM_TYPES } from "@/lib/utils";

export default function AdminProperties() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!user && !authLoading) router.push("/auth/login");
    if (user && user.role !== "ADMIN") {
      alert("无权限访问");
      router.push("/");
    }
    if (user) loadData();
  }, [user, authLoading, status, keyword]);

  const loadData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (keyword) params.set("keyword", keyword);
    const res = await fetch(`/api/properties?${params}`);
    const json = await res.json();
    setProperties(json.data?.properties || []);
    setLoading(false);
  };

  const updateStatus = async (id: number, newStatus: "APPROVED" | "REJECTED") => {
    const confirmMsg = newStatus === "APPROVED" ? "确定通过该房源审核？" : "确定拒绝该房源？";
    if (!confirm(confirmMsg)) return;
    setActionLoading(id);
    const res = await fetch(`/api/properties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const json = await res.json();
    setActionLoading(null);
    if (json.success) {
      loadData();
    } else {
      alert(json.message || "操作失败");
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 mb-2 hover:text-gray-900">
            <ChevronLeft className="w-4 h-4" /> 返回管理后台
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">房源管理</h1>
          <p className="text-gray-500 mt-1">审核房东发布的房源，确保平台内容质量</p>
        </div>
      </div>

      <div className="card p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="input-field pl-10 !py-2"
            placeholder="搜索房源标题或地址"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <select
          className="input-field !w-48 !py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">全部状态</option>
          <option value="PENDING">待审核</option>
          <option value="APPROVED">已上线</option>
          <option value="REJECTED">已拒绝</option>
        </select>
        <button
          onClick={() => { setStatus(""); setKeyword(""); }}
          className="btn-secondary !py-2"
        >
          重置
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse p-4">
              <div className="grid grid-cols-5 gap-4">
                <div className="aspect-[4/3] bg-gray-200 rounded-lg" />
                <div className="col-span-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 card">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">暂无符合条件的房源</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((p) => {
            const st = PROPERTY_STATUS_LABELS[p.status] || { label: p.status, color: "bg-gray-100" };
            const roomType = ROOM_TYPES.find((r) => r.value === p.roomType)?.label || p.roomType;
            return (
              <div key={p.id} className="card p-4 md:p-5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
                  <div className="md:col-span-3">
                    <Link href={`/properties/${p.id}`}>
                      <img src={p.coverPhoto} alt="" className="w-full aspect-[4/3] rounded-xl object-cover" />
                    </Link>
                  </div>
                  <div className="md:col-span-7 space-y-2">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <Link href={`/properties/${p.id}`} className="font-semibold text-lg hover:text-rose-600">
                        {p.title}
                      </Link>
                      <span className={`badge ${st.color}`}>{st.label}</span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {p.city} · {p.address}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="inline-flex items-center"><Users className="w-3.5 h-3.5 mr-1" />{p.maxGuests}人</span>
                      <span className="inline-flex items-center"><BedDouble className="w-3.5 h-3.5 mr-1" />{p.bedrooms}卧{p.bathrooms}卫</span>
                      <span>{roomType}</span>
                      <span className="inline-flex items-center">
                        <Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-500" />
                        {p.rating > 0 ? `${p.rating.toFixed(1)} (${p.reviewCount})` : "暂无评分"}
                      </span>
                    </div>
                    {p.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 pt-1 border-t border-gray-50 mt-2 pt-2">
                        {p.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 pt-2">
                      {p.host && (
                        <>
                          <img src={p.host.avatar} className="w-7 h-7 rounded-full" alt="" />
                          <span className="text-xs text-gray-500">房东：{p.host.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2 flex md:flex-col md:items-stretch items-center justify-between md:border-l md:border-gray-100 md:pl-6 gap-3">
                    <div className="text-center md:text-right">
                      <p className="text-xs text-gray-400">每晚价格</p>
                      <p className="text-xl font-bold text-rose-600">{formatCurrency(p.pricePerNight)}</p>
                    </div>
                    <div className="flex md:flex-col gap-2">
                      <Link
                        href={`/properties/${p.id}`}
                        className="btn-secondary !py-1.5 !px-3 text-xs inline-flex items-center"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />详情
                      </Link>
                      {p.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => updateStatus(p.id, "APPROVED")}
                            disabled={actionLoading === p.id}
                            className="bg-green-500 text-white hover:bg-green-600 rounded-lg py-1.5 px-3 text-xs transition inline-flex items-center disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />通过
                          </button>
                          <button
                            onClick={() => updateStatus(p.id, "REJECTED")}
                            disabled={actionLoading === p.id}
                            className="bg-red-500 text-white hover:bg-red-600 rounded-lg py-1.5 px-3 text-xs transition inline-flex items-center disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />拒绝
                          </button>
                        </>
                      )}
                      {p.status === "APPROVED" && (
                        <button
                          onClick={() => updateStatus(p.id, "REJECTED")}
                          disabled={actionLoading === p.id}
                          className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg py-1.5 px-3 text-xs transition disabled:opacity-50"
                        >
                          下架
                        </button>
                      )}
                      {p.status === "REJECTED" && (
                        <button
                          onClick={() => updateStatus(p.id, "APPROVED")}
                          disabled={actionLoading === p.id}
                          className="bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 rounded-lg py-1.5 px-3 text-xs transition disabled:opacity-50"
                        >
                          恢复上线
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
