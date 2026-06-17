"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import StatCard from "@/components/StatCard";
import {
  Building2, PlusCircle, DollarSign, CalendarCheck, CalendarX, Star,
  BedDouble, ChevronLeft, ChevronRight, Check, X, Edit, Eye
} from "lucide-react";
import { PROPERTY_STATUS_LABELS, formatCurrency, ROOM_TYPES } from "@/lib/utils";

export default function HostPropertiesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !authLoading) router.push("/auth/login");
    if (user) loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    const res = await fetch(`/api/properties?status=`);
    const json = await res.json();
    const all = json.data?.properties || [];
    const mine = all.filter((p: any) => p.hostId === user?.id || user?.role === "ADMIN");
    setProperties(mine);
    setLoading(false);
  };

  if (authLoading || !user) return null;
  if (user.role !== "HOST" && user.role !== "ADMIN") {
    return <div className="max-w-3xl mx-auto p-8 text-center">仅房东可访问此页面</div>;
  }

  const approved = properties.filter((p) => p.status === "APPROVED");
  const pending = properties.filter((p) => p.status === "PENDING");
  const totalRevenue = approved.reduce((sum, p) => sum + (Number(p.pricePerNight) * 30 * 0.3), 0); // 粗略估算

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">我的房源</h1>
          <p className="text-gray-500 mt-1">共 {properties.length} 套房源</p>
        </div>
        <Link href="/properties/new" className="btn-primary inline-flex items-center">
          <PlusCircle className="w-5 h-5 mr-1.5" />
          发布新房源
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="全部房源"
          value={properties.length}
          icon={<Building2 className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="已上线"
          value={approved.length}
          icon={<Check className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="审核中"
          value={pending.length}
          icon={<CalendarX className="w-5 h-5" />}
          color="yellow"
        />
        <StatCard
          label="预估月营收"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          color="rose"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse p-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="aspect-square bg-gray-200 rounded" />
                <div className="col-span-2 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 card">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">您还没有房源</h3>
          <p className="text-sm text-gray-400 mb-6">发布您的第一套房源，开始被动收入吧！</p>
          <Link href="/properties/new" className="btn-primary inline-flex items-center">
            <PlusCircle className="w-5 h-5 mr-1.5" />
            立即发布房源
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((p) => {
            const st = PROPERTY_STATUS_LABELS[p.status] || { label: p.status, color: "bg-gray-100" };
            const roomType = ROOM_TYPES.find((r) => r.value === p.roomType)?.label || p.roomType;
            return (
              <div key={p.id} className="card p-4 hover:shadow-md transition">
                <div className="grid grid-cols-3 gap-4">
                  <Link href={`/properties/${p.id}`} className="col-span-1">
                    <img src={p.coverPhoto} alt="" className="w-full aspect-square rounded-xl object-cover" />
                  </Link>
                  <div className="col-span-2 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link href={`/properties/${p.id}`} className="font-semibold line-clamp-1 hover:text-rose-600">
                        {p.title}
                      </Link>
                      <span className={`badge whitespace-nowrap ${st.color}`}>{st.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-1">{p.city} · {p.address}</p>
                    <div className="flex items-center text-xs text-gray-500 space-x-3 mb-2 flex-wrap gap-y-1">
                      <span>{roomType}</span>
                      <span><BedDouble className="w-3.5 h-3.5 inline mr-0.5" />{p.maxGuests}人</span>
                      <span className="flex items-center">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-0.5" />
                        {p.rating > 0 ? p.rating.toFixed(1) : "暂无"} · {p.reviewCount}评
                      </span>
                    </div>
                    <div className="mt-auto pt-2 flex items-baseline justify-between">
                      <div>
                        <span className="text-lg font-bold text-rose-600">{formatCurrency(p.pricePerNight)}</span>
                        <span className="text-xs text-gray-400">/晚</span>
                      </div>
                      <div className="flex space-x-1.5">
                        <Link
                          href={`/calendar/${p.id}`}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          title="日历管理"
                        >
                          <CalendarCheck className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/properties/${p.id}`}
                          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                          title="查看房源"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
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
