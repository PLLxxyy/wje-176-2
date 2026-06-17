"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import StatCard from "@/components/StatCard";
import {
  DollarSign, CalendarCheck, Building2, Star, TrendingUp, Home,
  Users, ShoppingCart, AlertCircle, Eye, PieChart as PieChartIcon
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { BOOKING_STATUS_LABELS, formatCurrency } from "@/lib/utils";

const PIE_COLORS = ["#10b981", "#3b82f6", "#a855f7", "#f59e0b", "#6b7280", "#ef4444"];

export default function DashboardPage({ type }: { type?: "host" | "admin" }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);

  const isAdmin = type === "admin";

  useEffect(() => {
    if (!user && !authLoading) router.push("/auth/login");
    if (user && isAdmin && user.role !== "ADMIN") {
      alert("无权限访问管理员后台");
      router.push("/");
    }
    if (user) loadData();
  }, [user, authLoading, type]);

  const loadData = async () => {
    setLoading(true);
    const params = new URLSearchParams({ type: isAdmin ? "admin" : "host" });
    const [sRes, pRes, cRes] = await Promise.all([
      fetch(`/api/stats?${params}`),
      isAdmin ? fetch("/api/properties?status=") : Promise.resolve({ json: () => ({ data: { properties: [] } }) } as any),
      isAdmin ? fetch("/api/complaints") : Promise.resolve({ json: () => ({ data: { complaints: [] } }) } as any),
    ]);
    const s = await sRes.json();
    setData(s.data);
    if (isAdmin) {
      const p = await pRes.json();
      setProperties(p.data?.properties || []);
      const c = await cRes.json();
      setComplaints(c.data?.complaints || []);
    }
    setLoading(false);
  };

  if (authLoading || !user) return null;

  const monthlyChart = data?.monthlyData || [];
  const statusChart = (data?.statusData || []).map((s: any) => ({
    name: BOOKING_STATUS_LABELS[s.status]?.label || s.status,
    count: s.count,
  }));
  const cityChart = data?.cityData || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isAdmin ? "管理员后台" : "数据中心"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? "平台运营数据总览" : "您的房源经营数据总览"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-2" />
            </div>
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="总收入"
              value={formatCurrency(data.overview.totalRevenue)}
              icon={<DollarSign className="w-5 h-5" />}
              color="rose"
              hint="已完成订单累计"
            />
            <StatCard
              label="总订单数"
              value={data.overview.totalBookings}
              icon={<CalendarCheck className="w-5 h-5" />}
              color="blue"
              hint={`已完成 ${data.overview.completedBookings} 单`}
            />
            <StatCard
              label="待处理订单"
              value={data.overview.pendingBookings}
              icon={<ShoppingCart className="w-5 h-5" />}
              color="yellow"
              hint={isAdmin ? "需审核订单" : "房客等待确认"}
            />
            <StatCard
              label="房源总数"
              value={data.overview.totalProperties}
              icon={<Building2 className="w-5 h-5" />}
              color="green"
              hint={isAdmin ? `待审核 ${data.overview.pendingProperties}` : `已上线 APPROVED 占比`}
            />
            {isAdmin && (
              <>
                <StatCard
                  label="待处理投诉"
                  value={data.overview.pendingComplaints}
                  icon={<AlertCircle className="w-5 h-5" />}
                  color="purple"
                />
                <StatCard
                  label="已完成订单"
                  value={data.overview.completedBookings}
                  icon={<CheckIcon />}
                  color="indigo"
                />
                <StatCard
                  label="已确认订单"
                  value={data.overview.confirmedBookings}
                  icon={<TrendingUp className="w-5 h-5" />}
                  color="green"
                />
                <StatCard
                  label="平均订单收入"
                  value={
                    data.overview.completedBookings > 0
                      ? formatCurrency(data.overview.totalRevenue / data.overview.completedBookings)
                      : formatCurrency(0)
                  }
                  icon={<TrendingUp className="w-5 h-5" />}
                  color="rose"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 lg:col-span-2">
              <h3 className="font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-rose-500" />
                月度营收趋势
              </h3>
              <div className="h-80">
                {monthlyChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip
                        formatter={(v: any) => [formatCurrency(Number(v)), "营收"]}
                        contentStyle={{ borderRadius: 8, border: "1px solid #f3f4f6" }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="营收"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#ef4444" }}
                        fill="#fee2e2"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                    <TrendingUp className="w-10 h-10 mb-2 opacity-50" />
                    暂无营收数据
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2 text-blue-500" />
                订单状态分布
              </h3>
              <div className="h-80">
                {statusChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChart}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
                        innerRadius={50}
                        paddingAngle={2}
                        dataKey="count"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusChart.map((_: any, idx: number) => (
                          <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                    暂无订单数据
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-green-500" />
                {isAdmin ? "城市房源分布" : "TOP 5 热销房源"}
              </h3>
              <div className="h-72">
                {isAdmin ? (
                  cityChart.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cityChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="city" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: 8 }} />
                        <Bar dataKey="count" name="房源数" fill="#10b981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <EmptyStat />
                ) : (
                  data.topProperties && data.topProperties.length > 0 ? (
                    <div className="space-y-3">
                      {data.topProperties.map((p: any, i: number) => (
                        <Link key={p.id} href={`/properties/${p.id}`} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            i === 0 ? "bg-yellow-100 text-yellow-700" :
                            i === 1 ? "bg-gray-100 text-gray-700" :
                            i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-500"
                          }`}>{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium line-clamp-1">{p.title}</p>
                            <p className="text-xs text-gray-400">{p.city} · {formatCurrency(p.pricePerNight)}/晚</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-rose-600">{p.bookings}单</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : <EmptyStat />
                )}
              </div>
            </div>

            {isAdmin ? (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-rose-500" />
                    待审核房源
                  </h3>
                  <Link href="/admin/properties" className="text-sm text-rose-600 hover:underline">
                    查看全部 →
                  </Link>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {properties.filter((p: any) => p.status === "PENDING").slice(0, 5).length === 0 ? (
                    <EmptyStat text="暂无待审核房源" />
                  ) : (
                    properties.filter((p: any) => p.status === "PENDING").slice(0, 5).map((p: any) => (
                      <div key={p.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <img src={p.coverPhoto} className="w-12 h-12 rounded object-cover" alt="" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{p.title}</p>
                          <p className="text-xs text-gray-500">{p.city}</p>
                        </div>
                        <Link
                          href={`/admin/properties`}
                          className="text-xs bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600"
                        >
                          审核
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="card p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                  月度订单量
                </h3>
                <div className="h-72">
                  {monthlyChart.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: 8 }} />
                        <Bar dataKey="bookings" name="订单数" fill="#a855f7" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <EmptyStat />}
                </div>
              </div>
            )}
          </div>

          {isAdmin && complaints.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-rose-500" />
                  最新投诉
                </h3>
                <Link href="/admin/complaints" className="text-sm text-rose-600 hover:underline">
                  全部投诉 →
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {complaints.slice(0, 5).map((c: any) => (
                  <div key={c.id} className="py-3 flex items-start space-x-4">
                    <img src={c.user?.avatar} className="w-9 h-9 rounded-full flex-shrink-0" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-medium text-sm">{c.subject}</p>
                        <span className={`badge whitespace-nowrap ${
                          c.status === "OPEN" ? "bg-red-100 text-red-700" :
                          c.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" :
                          c.status === "RESOLVED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {c.status === "OPEN" ? "待处理" : c.status === "IN_PROGRESS" ? "处理中" : c.status === "RESOLVED" ? "已解决" : "已关闭"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{c.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {c.user?.name} · {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function EmptyStat({ text = "暂无数据" }: { text?: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
      <Home className="w-10 h-10 mb-2 opacity-50" />
      {text}
    </div>
  );
}
