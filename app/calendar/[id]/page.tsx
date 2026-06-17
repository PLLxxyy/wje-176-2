"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronLeft, ChevronRight, Check, X, CalendarDays, BedDouble, AlertCircle,
  Calendar, DollarSign
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function CalendarPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const propertyId = Number(params.id);
  const [property, setProperty] = useState<any>(null);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [curMonth, setCurMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectMode, setSelectMode] = useState<null | "available" | "unavailable">(null);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  const [batchPrice, setBatchPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user && !authLoading) router.push("/auth/login");
    if (user) loadData();
  }, [user, authLoading, propertyId, curMonth]);

  const loadData = async () => {
    setLoading(true);
    const month = `${curMonth.getFullYear()}-${String(curMonth.getMonth() + 1).padStart(2, "0")}`;
    const [pRes, cRes] = await Promise.all([
      fetch(`/api/properties/${propertyId}`),
      fetch(`/api/calendar/${propertyId}?month=${month}`),
    ]);
    const pJson = await pRes.json();
    const cJson = await cRes.json();
    const prop = pJson.data?.property;
    setProperty(prop);
    setCalendars(cJson.data?.calendars || []);
    if (prop && user && prop.hostId !== user.id && user.role !== "ADMIN") {
      alert("无权限管理该房源");
      router.push("/host/properties");
    }
    setLoading(false);
  };

  const calMap = useMemo(() => {
    const m = new Map<string, any>();
    calendars.forEach((c) => {
      const d = new Date(c.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      m.set(key, c);
    });
    return m;
  }, [calendars]);

  const monthGrid = useMemo(() => {
    const first = new Date(curMonth.getFullYear(), curMonth.getMonth(), 1);
    const last = new Date(curMonth.getFullYear(), curMonth.getMonth() + 1, 0);
    const startPadding = first.getDay();
    const days: { date: string; day: number; inMonth: boolean }[] = [];
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = new Date(curMonth.getFullYear(), curMonth.getMonth(), -i);
      days.push({ date: dateKey(d), day: d.getDate(), inMonth: false });
    }
    for (let d = 1; d <= last.getDate(); d++) {
      const dt = new Date(curMonth.getFullYear(), curMonth.getMonth(), d);
      days.push({ date: dateKey(dt), day: d, inMonth: true });
    }
    while (days.length % 7 !== 0 || days.length < 42) {
      const lastDay = new Date(days[days.length - 1].date);
      lastDay.setDate(lastDay.getDate() + 1);
      days.push({ date: dateKey(lastDay), day: lastDay.getDate(), inMonth: lastDay.getMonth() === curMonth.getMonth() });
      if (days.length >= 42) break;
    }
    return days;
  }, [curMonth]);

  const dateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const isInRange = (date: string) => {
    if (!rangeStart) return false;
    const end = rangeEnd || rangeStart;
    return date >= rangeStart && date <= end;
  };

  const handleDateClick = (dateKey: string) => {
    if (!selectMode) return;
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(dateKey);
      setRangeEnd(null);
    } else {
      if (dateKey < rangeStart) {
        setRangeStart(dateKey);
      } else {
        setRangeEnd(dateKey);
      }
    }
  };

  const applyBatch = async (mode: "available" | "unavailable") => {
    if (!rangeStart) { alert("请先选择日期范围"); return; }
    const end = rangeEnd || rangeStart;
    if (!confirm(`确定将 ${rangeStart} 至 ${end} 标记为${mode === "available" ? "可订" : "不可订"}吗？`)) return;
    setActionLoading(true);
    const res = await fetch(`/api/calendar/${propertyId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: rangeStart,
        endDate: end,
        isAvailable: mode === "available",
        price: batchPrice ? Number(batchPrice) : undefined,
      }),
    });
    const json = await res.json();
    setActionLoading(false);
    if (json.success) {
      setRangeStart(null); setRangeEnd(null); setSelectMode(null); setBatchPrice("");
      loadData();
    } else alert(json.message || "操作失败");
  };

  const toggleSingle = async (date: string) => {
    const cur = calMap.get(date);
    const newVal = cur ? !cur.isAvailable : false;
    setActionLoading(true);
    const res = await fetch(`/api/calendar/${propertyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, isAvailable: newVal }),
    });
    const json = await res.json();
    setActionLoading(false);
    if (json.success) loadData();
    else alert(json.message || "操作失败");
  };

  const monthLabel = `${curMonth.getFullYear()}年 ${curMonth.getMonth() + 1}月`;

  if (authLoading || !user) return null;
  if (user.role !== "HOST" && user.role !== "ADMIN") {
    return <div className="max-w-3xl mx-auto p-8 text-center">仅房东可访问</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.back()} className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4">
        <ChevronLeft className="w-4 h-4" /> 返回
      </button>

      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : property ? (
        <>
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-start space-x-4">
              <img src={property.coverPhoto} className="w-20 h-20 rounded-xl object-cover" alt="" />
              <div>
                <h1 className="text-2xl font-bold">{property.title}</h1>
                <p className="text-gray-500 mt-1 text-sm">{property.city} · {property.address}</p>
                <p className="text-gray-600 mt-2 text-sm flex items-center gap-4">
                  <span className="flex items-center"><BedDouble className="w-4 h-4 mr-1" />{property.maxGuests}人入住</span>
                  <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1" />{formatCurrency(property.pricePerNight)}/晚（基础价）</span>
                </p>
              </div>
            </div>
            <Link href={`/properties/${property.id}`} className="btn-secondary text-sm !py-2">
              查看房源
            </Link>
          </div>

          <div className="card p-5 mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-600 mr-2">批量操作：</span>
              <button
                onClick={() => { setSelectMode("available"); setRangeStart(null); setRangeEnd(null); }}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm border transition ${
                  selectMode === "available"
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-green-700 border-green-300 hover:bg-green-50"
                }`}
              >
                <Check className="w-4 h-4 mr-1.5" />
                标记可订
              </button>
              <button
                onClick={() => { setSelectMode("unavailable"); setRangeStart(null); setRangeEnd(null); }}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm border transition ${
                  selectMode === "unavailable"
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-red-700 border-red-300 hover:bg-red-50"
                }`}
              >
                <X className="w-4 h-4 mr-1.5" />
                标记不可订
              </button>
              {selectMode && (
                <>
                  <input
                    type="number"
                    className="input-field !py-2 !w-36"
                    placeholder="设置价格(可选)"
                    value={batchPrice}
                    onChange={(e) => setBatchPrice(e.target.value)}
                  />
                  <button
                    onClick={() => applyBatch(selectMode)}
                    disabled={actionLoading || !rangeStart}
                    className="btn-primary !py-2"
                  >
                    {actionLoading ? "处理中..." : "应用"}
                  </button>
                  <button
                    onClick={() => { setSelectMode(null); setRangeStart(null); setRangeEnd(null); }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    取消
                  </button>
                </>
              )}
            </div>
            {selectMode && (
              <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <b>操作提示：</b>点击日期选择开始和结束日期（可只选单日），然后点击"应用"确认
                  {rangeStart && (
                    <span className="ml-2 font-medium">
                      已选：{rangeStart}{rangeEnd ? " 至 " + rangeEnd : "（单日）"}
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
              <span className="flex items-center space-x-1.5"><span className="w-3 h-3 bg-green-100 rounded border border-green-400"></span><span>可订</span></span>
              <span className="flex items-center space-x-1.5"><span className="w-3 h-3 bg-red-100 rounded border border-red-400"></span><span>不可订/已出租</span></span>
              <span className="flex items-center space-x-1.5"><span className="w-3 h-3 bg-rose-500 rounded"></span><span>选择中</span></span>
            </div>
          </div>

          <div className="card p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurMonth(new Date(curMonth.getFullYear(), curMonth.getMonth() - 1, 1))}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold flex items-center">
                <CalendarDays className="w-5 h-5 mr-2 text-rose-500" />
                {monthLabel}
              </h2>
              <button
                onClick={() => setCurMonth(new Date(curMonth.getFullYear(), curMonth.getMonth() + 1, 1))}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-sm font-medium text-gray-500 py-2">{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthGrid.map(({ date, day, inMonth }) => {
                const cal = calMap.get(date);
                const available = cal ? cal.isAvailable : true;
                const inRange = isInRange(date);
                const clickable = inMonth;
                return (
                  <button
                    key={date}
                    disabled={!clickable || actionLoading}
                    onClick={() => (selectMode ? handleDateClick(date) : clickable && toggleSingle(date))}
                    className={`relative aspect-square md:aspect-[1/0.9] rounded-lg flex flex-col items-center justify-center text-sm transition border ${
                      !inMonth ? "opacity-30 cursor-default border-transparent" :
                      inRange ? "bg-rose-500 text-white border-rose-500 font-bold" :
                      available
                        ? "bg-green-50 text-green-800 border-green-200 hover:bg-green-100 cursor-pointer"
                        : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 cursor-pointer"
                    }`}
                    title={inMonth ? (available ? "可订（点击切换为不可订）" : "不可订（点击切换为可订）") : ""}
                  >
                    <span className="font-medium">{day}</span>
                    {cal && inMonth && (
                      <span className={`text-[10px] mt-0.5 ${inRange ? "text-white/80" : available ? "text-green-600" : "text-red-500"}`}>
                        ¥{Number(cal.price).toFixed(0)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">房源不存在</div>
      )}
    </div>
  );
}
