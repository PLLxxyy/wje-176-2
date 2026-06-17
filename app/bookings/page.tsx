"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar, MapPin, Users, Star, AlertCircle, Check, X, MessageSquare,
  BedDouble, Phone, Mail, ChevronRight
} from "lucide-react";
import { BOOKING_STATUS_LABELS, formatCurrency, formatDate } from "@/lib/utils";

type Tab = "guest" | "host";

export default function BookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("guest");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [reviewModal, setReviewModal] = useState<{ booking: any; type: "GUEST_TO_HOST" | "HOST_TO_GUEST" } | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "", cleanliness: 5, experience: 5, guestQuality: 5 });
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!user && !authLoading) router.push("/auth/login");
    if (user) loadBookings();
  }, [user, authLoading, tab, filterStatus]);

  const loadBookings = async () => {
    setLoading(true);
    const params = new URLSearchParams({ type: tab });
    if (filterStatus) params.set("status", filterStatus);
    const res = await fetch(`/api/bookings?${params}`);
    const json = await res.json();
    setBookings(json.data?.bookings || []);
    setLoading(false);
  };

  const bookingAction = (id: number, action: string) => {
    if (!confirm(`确定要${actionLabel(action)}吗？`)) return;
    setActionLoading(id);
    fetch(`/api/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
      .then((r) => r.json())
      .then((json) => {
        setActionLoading(null);
        if (json.success) loadBookings();
        else alert(json.message || "操作失败");
      });
  };

  const actionLabel = (a: string) => ({ confirm: "确认订单", reject: "拒绝订单", checkin: "办理入住", complete: "办理退房", cancel: "取消订单" }[a] || a);

  const submitReview = () => {
    if (!reviewModal || !reviewForm.comment.trim()) { alert("请填写评价内容"); return; }
    const booking = reviewModal.booking;
    const targetUserId = reviewModal.type === "GUEST_TO_HOST" ? booking.hostId : booking.guestId;
    const payload: any = {
      bookingId: booking.id,
      propertyId: booking.propertyId,
      userId: targetUserId,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      reviewType: reviewModal.type,
    };
    if (reviewModal.type === "GUEST_TO_HOST") {
      payload.cleanliness = reviewForm.cleanliness;
      payload.experience = reviewForm.experience;
    } else {
      payload.guestQuality = reviewForm.guestQuality;
    }
    fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          alert("评价提交成功！");
          setReviewModal(null);
          loadBookings();
        } else alert(json.message || "提交失败");
      });
  };

  const canReviewGuestToHost = (b: any) =>
    b.status === "COMPLETED" && tab === "guest" && !b.reviews?.find((r: any) => r.reviewType === "GUEST_TO_HOST");
  const canReviewHostToGuest = (b: any) =>
    b.status === "COMPLETED" && tab === "host" && !b.reviews?.find((r: any) => r.reviewType === "HOST_TO_GUEST");

  const tabs = [
    { key: "guest", label: "我是房客", count: "" },
    { key: "host", label: "我是房东", count: "" },
  ];

  const statusFilters = ["", "PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"];

  if (authLoading || !user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">我的订单</h1>

      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 -mb-px ${
              tab === t.key ? "border-rose-500 text-rose-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm transition ${
              filterStatus === s ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s ? BOOKING_STATUS_LABELS[s]?.label || s : "全部"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-1 aspect-[4/3] bg-gray-200 rounded" />
                <div className="col-span-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">还没有订单</h3>
          <p className="text-sm text-gray-400 mb-6">
            {tab === "guest" ? "快去首页挑选心仪的房源吧" : "发布房源后房客会来预订哦"}
          </p>
          <Link href={tab === "guest" ? "/" : "/properties/new"} className="btn-primary inline-flex items-center">
            {tab === "guest" ? "去逛房源" : "发布房源"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const st = BOOKING_STATUS_LABELS[b.status] || { label: b.status, color: "bg-gray-100 text-gray-800" };
            const isHost = tab === "host";
            const targetUser = isHost ? b.guest : b.host;
            return (
              <div key={b.id} className="card overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-400">订单号 #{String(b.id).padStart(8, "0")}</span>
                      <span className={`badge ${st.color}`}>{st.label}</span>
                      <span className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/properties/${b.propertyId}`} className="text-sm text-rose-600 hover:underline">
                        查看房源
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
                    <div className="md:col-span-3">
                      <Link href={`/properties/${b.propertyId}`}>
                        <img src={b.property?.coverPhoto} alt="" className="w-full aspect-[4/3] rounded-xl object-cover" />
                      </Link>
                    </div>
                    <div className="md:col-span-6 space-y-3">
                      <Link href={`/properties/${b.propertyId}`} className="block">
                        <h3 className="font-semibold text-lg text-gray-900 hover:text-rose-600 transition">
                          {b.property?.title}
                        </h3>
                      </Link>
                      <p className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {b.property?.city} · {b.property?.address}
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>入住：{formatDate(b.checkIn)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>退房：{formatDate(b.checkOut)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <BedDouble className="w-4 h-4 mr-2 text-gray-400" />
                          <span>共 {b.nights} 晚</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{b.guests} 位房客</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 pt-2 border-t border-gray-100 mt-2">
                        <div className="flex items-center space-x-2">
                          <img src={targetUser?.avatar} className="w-8 h-8 rounded-full" alt="" />
                          <div>
                            <p className="text-sm font-medium">{isHost ? "房客" : "房东"}：{targetUser?.name}</p>
                            <div className="text-xs text-gray-400 space-x-3">
                              {targetUser?.phone && <span className="inline-flex items-center"><Phone className="w-3 h-3 inline mr-0.5" />{targetUser.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-3 flex flex-col md:items-end md:border-l md:border-gray-100 md:pl-6 justify-between">
                      <div className="text-left md:text-right">
                        <p className="text-sm text-gray-500 mb-1">订单总价</p>
                        <p className="text-2xl font-bold text-rose-600">{formatCurrency(b.totalPrice)}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatCurrency(b.property?.pricePerNight)} × {b.nights}晚
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4 md:justify-end">
                        {isHost && b.status === "PENDING" && (
                          <>
                            <button onClick={() => bookingAction(b.id, "confirm")} disabled={actionLoading === b.id} className="btn-primary !py-1.5 !px-4 text-sm">
                              确认订单
                            </button>
                            <button onClick={() => bookingAction(b.id, "reject")} disabled={actionLoading === b.id} className="btn-secondary !py-1.5 !px-4 text-sm">
                              拒绝
                            </button>
                          </>
                        )}
                        {isHost && b.status === "CONFIRMED" && (
                          <button onClick={() => bookingAction(b.id, "checkin")} disabled={actionLoading === b.id} className="btn-primary !py-1.5 !px-4 text-sm">
                            办理入住
                          </button>
                        )}
                        {isHost && b.status === "CHECKED_IN" && (
                          <button onClick={() => bookingAction(b.id, "complete")} disabled={actionLoading === b.id} className="btn-primary !py-1.5 !px-4 text-sm">
                            办理退房
                          </button>
                        )}
                        {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                          <button onClick={() => bookingAction(b.id, "cancel")} disabled={actionLoading === b.id} className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg py-1.5 px-4 text-sm transition">
                            取消订单
                          </button>
                        )}
                        {canReviewGuestToHost(b) && (
                          <button onClick={() => setReviewModal({ booking: b, type: "GUEST_TO_HOST" })} className="btn-secondary !py-1.5 !px-4 text-sm inline-flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1" />评价房源
                          </button>
                        )}
                        {canReviewHostToGuest(b) && (
                          <button onClick={() => setReviewModal({ booking: b, type: "HOST_TO_GUEST" })} className="btn-secondary !py-1.5 !px-4 text-sm inline-flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1" />评价房客
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReviewModal(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                {reviewModal.type === "GUEST_TO_HOST" ? "评价房源 / 房东" : "评价房客"}
              </h3>
              <button onClick={() => setReviewModal(null)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">总体评分</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setReviewForm({ ...reviewForm, rating: n })}>
                      <Star className={`w-8 h-8 ${n <= reviewForm.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>
              {reviewModal.type === "GUEST_TO_HOST" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">卫生状况</label>
                    <input type="range" min={1} max={5} value={reviewForm.cleanliness}
                      onChange={(e) => setReviewForm({ ...reviewForm, cleanliness: Number(e.target.value) })}
                      className="w-full" />
                    <div className="text-center text-sm text-gray-500">{reviewForm.cleanliness} 分</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">入住体验</label>
                    <input type="range" min={1} max={5} value={reviewForm.experience}
                      onChange={(e) => setReviewForm({ ...reviewForm, experience: Number(e.target.value) })}
                      className="w-full" />
                    <div className="text-center text-sm text-gray-500">{reviewForm.experience} 分</div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">房客素质</label>
                  <input type="range" min={1} max={5} value={reviewForm.guestQuality}
                    onChange={(e) => setReviewForm({ ...reviewForm, guestQuality: Number(e.target.value) })}
                    className="w-full" />
                  <div className="text-center text-sm text-gray-500">{reviewForm.guestQuality} 分</div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">评价内容</label>
                <textarea
                  rows={4}
                  className="input-field"
                  placeholder="分享您的真实体验..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </div>
              <button onClick={submitReview} className="btn-primary w-full">提交评价</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
