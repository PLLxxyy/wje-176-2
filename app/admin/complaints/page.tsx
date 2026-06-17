"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronLeft, AlertCircle, Check, User, Calendar, MessageSquare,
  ChevronRight, Building2
} from "lucide-react";
import { COMPLAINT_STATUS_LABELS, BOOKING_STATUS_LABELS } from "@/lib/utils";

export default function AdminComplaints() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!user && !authLoading) router.push("/auth/login");
    if (user && user.role !== "ADMIN") {
      alert("无权限访问");
      router.push("/");
    }
    if (user) loadData();
  }, [user, authLoading, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    const res = await fetch("/api/complaints");
    const json = await res.json();
    let list = json.data?.complaints || [];
    if (statusFilter) list = list.filter((c: any) => c.status === statusFilter);
    setComplaints(list);
    setLoading(false);
  };

  const updateStatus = async (id: number, status: string) => {
    setActionLoading(id);
    const res = await fetch(`/api/complaints/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    setActionLoading(null);
    if (json.success) loadData();
    else alert(json.message || "操作失败");
  };

  if (authLoading || !user) return null;

  const statusFilters = ["", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 mb-2 hover:text-gray-900">
          <ChevronLeft className="w-4 h-4" /> 返回管理后台
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">投诉管理</h1>
        <p className="text-gray-500 mt-1">处理用户投诉，维护平台秩序</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((s) => {
          const conf = s ? (COMPLAINT_STATUS_LABELS[s] || { label: s }) : { label: "全部" };
          return (
            <button
              key={s || "all"}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm transition ${
                statusFilter === s ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {conf.label}
              {s && (
                <span className="ml-2 bg-white/20 px-1.5 rounded-full">
                  {complaints.filter((c) => c.status === s).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20 card">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">暂无投诉</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => {
            const st = COMPLAINT_STATUS_LABELS[c.status] || { label: c.status, color: "bg-gray-100" };
            return (
              <div key={c.id} className="card p-5 md:p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <img src={c.user?.avatar} className="w-10 h-10 rounded-full flex-shrink-0" alt="" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-lg">{c.subject}</h3>
                        <span className={`badge ${st.color}`}>{st.label}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span className="inline-flex items-center"><User className="w-3.5 h-3.5 mr-1" />{c.user?.name}（{c.user?.email}）</span>
                        <span className="inline-flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" />{new Date(c.createdAt).toLocaleString()}</span>
                        {c.propertyId && (
                          <Link href={`/properties/${c.propertyId}`} className="inline-flex items-center text-rose-600 hover:underline">
                            <Building2 className="w-3.5 h-3.5 mr-1" />
                            {c.property?.title || `房源 #${c.propertyId}`}
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </Link>
                        )}
                        {c.bookingId && (
                          <span className="inline-flex items-center text-gray-500">
                            订单 #{String(c.bookingId).padStart(8, "0")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{c.content}</p>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  {c.status === "OPEN" && (
                    <button
                      onClick={() => updateStatus(c.id, "IN_PROGRESS")}
                      disabled={actionLoading === c.id}
                      className="bg-yellow-500 text-white hover:bg-yellow-600 rounded-lg py-1.5 px-4 text-sm transition disabled:opacity-50"
                    >
                      开始处理
                    </button>
                  )}
                  {(c.status === "OPEN" || c.status === "IN_PROGRESS") && (
                    <button
                      onClick={() => updateStatus(c.id, "RESOLVED")}
                      disabled={actionLoading === c.id}
                      className="bg-green-500 text-white hover:bg-green-600 rounded-lg py-1.5 px-4 text-sm transition inline-flex items-center disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 mr-1" />标记已解决
                    </button>
                  )}
                  {c.status !== "CLOSED" && (
                    <button
                      onClick={() => updateStatus(c.id, "CLOSED")}
                      disabled={actionLoading === c.id}
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg py-1.5 px-4 text-sm transition disabled:opacity-50"
                    >
                      关闭
                    </button>
                  )}
                  {c.status === "CLOSED" && (
                    <button
                      onClick={() => updateStatus(c.id, "OPEN")}
                      disabled={actionLoading === c.id}
                      className="bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-lg py-1.5 px-4 text-sm transition disabled:opacity-50"
                    >
                      重新打开
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
