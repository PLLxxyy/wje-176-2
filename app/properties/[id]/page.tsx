"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Star, MapPin, Users, BedDouble, Bath, ChevronLeft, ChevronRight,
  Calendar, ShieldCheck, MessageSquare, Sparkles, AlertCircle, X, Check,
  Wifi, UtensilsCrossed, Car, Waves, Dumbbell, Wind, Flame, WashingMachine,
  Tv, Monitor, Dog, AlertTriangle, Lock, Droplets, Refrigerator, ArrowUpDown
} from "lucide-react";
import { AMENITIES_LIST, BOOKING_STATUS_LABELS, calculateNights, formatCurrency, formatDate, ROOM_TYPES } from "@/lib/utils";

const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi, kitchen: UtensilsCrossed, parking: Car, pool: Waves,
  gym: Dumbbell, ac: Wind, heating: Flame, washer: WashingMachine,
  tv: Tv, workspace: Monitor, pets: Dog, smoke_detector: AlertTriangle,
  lock: Lock, hot_water: Droplets, fridge: Refrigerator, elevator: ArrowUpDown,
};

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, cleanliness: 5, experience: 5, comment: "" });
  const [complaintForm, setComplaintForm] = useState({ subject: "", content: "" });
  const [guestReviews, setGuestReviews] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/properties/${params.id}`)
      .then((r) => r.json())
      .then((json) => {
        setProperty(json.data?.property);
        if (json.data?.property?.reviews) {
          setGuestReviews(json.data.property.reviews.filter((r: any) => r.reviewType === "GUEST_TO_HOST"));
        }
        setLoading(false);
      });
  }, [params.id]);

  const nights = (checkIn && checkOut) ? calculateNights(new Date(checkIn), new Date(checkOut)) : 0;
  const pricePerNight = property ? Number(property.pricePerNight) : 0;
  const subtotal = nights * pricePerNight;
  const total = subtotal;

  const today = new Date().toISOString().split("T")[0];

  const unavailableSet = new Set(
    property?.calendars?.filter((c: any) => !c.isAvailable).map((c: any) => formatDate(c.date)) || []
  );

  const isDateUnavailable = (dateStr: string) => unavailableSet.has(dateStr);

  const rangeUnavailable = () => {
    if (!checkIn || !checkOut) return false;
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const cur = new Date(ci);
    while (cur < co) {
      if (isDateUnavailable(formatDate(cur))) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  };

  const submitBooking = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!checkIn || !checkOut) { setErr("请选择入住和退房日期"); return; }
    if (nights < 1) { setErr("退房日期必须晚于入住日期"); return; }
    if (guests > property.maxGuests) { setErr(`最多可住${property.maxGuests}人`); return; }
    if (rangeUnavailable()) { setErr("所选日期内有不可预订的日期"); return; }
    setErr("");
    setBookingLoading(true);
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId: property.id, checkIn, checkOut, guests,
      }),
    })
      .then((r) => r.json())
      .then((json) => {
        setBookingLoading(false);
        if (json.success) {
          setSuccessMsg("预订成功！请在我的订单中查看。");
          setTimeout(() => router.push("/bookings"), 1500);
        } else {
          setErr(json.message || "预订失败");
        }
      });
  };

  const submitReview = () => {
    if (!reviewForm.comment.trim()) { alert("请填写评价内容"); return; }
    fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...reviewForm,
        propertyId: property.id,
        userId: property.hostId,
        bookingId: 0,
        reviewType: "GUEST_TO_HOST",
      }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          alert("评价提交成功");
          setShowReviewModal(false);
          window.location.reload();
        } else alert(json.message || "提交失败");
      });
  };

  const submitComplaint = () => {
    if (!complaintForm.subject.trim() || !complaintForm.content.trim()) {
      alert("请填写完整");
      return;
    }
    fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...complaintForm, propertyId: property.id }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          alert("投诉已提交，管理员会尽快处理");
          setShowComplaintModal(false);
          setComplaintForm({ subject: "", content: "" });
        } else alert(json.message || "提交失败");
      });
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-500">加载中...</div>;
  }
  if (!property) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-500">房源不存在或已下线</div>;
  }

  const roomTypeLabel = ROOM_TYPES.find((r) => r.value === property.roomType)?.label || property.roomType;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <button onClick={() => router.back()} className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4">
        <ChevronLeft className="w-4 h-4" /> 返回
      </button>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
            <span className="flex items-center">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
              <span className="font-medium">{property.rating > 0 ? property.rating.toFixed(1) : "暂无评分"}</span>
              {property.reviewCount > 0 && <span className="ml-1 text-gray-500">· {property.reviewCount}条评价</span>}
            </span>
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {property.city} · {property.address}
            </span>
            {property.host && (
              <span className="flex items-center">
                <img src={property.host.avatar} className="w-5 h-5 rounded-full mr-1" alt="" />
                房东：{property.host.name}
              </span>
            )}
          </div>
        </div>
        {property.status !== "APPROVED" && (
          <span className={`badge self-start ${property.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
            {property.status === "PENDING" ? "审核中" : "已拒绝"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden mb-8">
        <div className="relative aspect-[4/3] md:aspect-auto md:col-span-1 md:row-span-2 bg-gray-100 overflow-hidden">
          <img src={property.photos[activeIdx]} alt="" className="w-full h-full object-cover" />
          {property.photos.length > 1 && (
            <>
              <button
                onClick={() => setActiveIdx((activeIdx - 1 + property.photos.length) % property.photos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveIdx((activeIdx + 1) % property.photos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {property.photos.slice(1, 5).map((p: string, i: number) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i + 1)}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg ${activeIdx === i + 1 ? "ring-2 ring-rose-500" : ""}`}
            >
              <img src={p} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-rose-500" />
              房源介绍
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
              <div className="flex items-center space-x-2 text-gray-700">
                <Users className="w-5 h-5 text-gray-400" />
                <span>可住 <b>{property.maxGuests}</b> 人</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <BedDouble className="w-5 h-5 text-gray-400" />
                <span><b>{property.bedrooms}</b> 间卧室</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Bath className="w-5 h-5 text-gray-400" />
                <span><b>{property.bathrooms}</b> 间卫生间</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                <span>{roomTypeLabel}</span>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-semibold mb-4">配套设施</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {AMENITIES_LIST.map((a) => {
                const has = property.amenities.includes(a.key);
                const Icon = AMENITY_ICONS[a.key] || Check;
                return (
                  <div
                    key={a.key}
                    className={`flex items-center space-x-2 p-3 rounded-lg ${
                      has ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400 line-through"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${has ? "text-green-600" : ""}`} />
                    <span className="text-sm">{a.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-semibold mb-4">位置介绍</h2>
            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-gray-700 mb-3 flex items-start">
                <MapPin className="w-5 h-5 text-rose-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>
                  <b>{property.city}市</b>，{property.address}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                · 具体位置会在预订确认后通过短信和站内信发送给您
                <br />
                · 周边通常有便利店、餐厅、公共交通等便利设施
                <br />
                · 如有疑问可在预订前咨询房东或客服
              </p>
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-rose-500" />
                房客评价
                <span className="ml-2 text-gray-400 font-normal">({guestReviews.length})</span>
              </h2>
              {user && user.role !== "ADMIN" && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="btn-secondary text-sm !py-1.5 !px-4"
                >
                  写评价
                </button>
              )}
            </div>
            {guestReviews.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无评价</p>
              </div>
            ) : (
              <div className="space-y-5">
                {guestReviews.map((r: any) => (
                  <div key={r.id} className="border-b border-gray-100 pb-5 last:border-0">
                    <div className="flex items-start space-x-3">
                      <img
                        src={r.author?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=x"}
                        className="w-10 h-10 rounded-full"
                        alt=""
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="font-medium">{r.author?.name}</p>
                            <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center space-x-0.5">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{r.comment}</p>
                        {(r.cleanliness || r.experience) && (
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            {r.cleanliness && <span>卫生: {r.cleanliness}分</span>}
                            {r.experience && <span>体验: {r.experience}分</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 card p-6 space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-bold text-gray-900">{formatCurrency(property.pricePerNight)}</span>
                <span className="text-gray-500"> / 晚</span>
              </div>
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-0.5" />
                <span className="font-medium">{property.rating > 0 ? property.rating.toFixed(1) : "-"}</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-gray-200">
                <div className="p-3">
                  <label className="text-xs font-semibold text-gray-600">入住</label>
                  <input
                    type="date"
                    min={today}
                    className="w-full text-sm outline-none mt-1 bg-transparent"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                <div className="p-3">
                  <label className="text-xs font-semibold text-gray-600">退房</label>
                  <input
                    type="date"
                    min={checkIn || today}
                    className="w-full text-sm outline-none mt-1 bg-transparent"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 p-3">
                <label className="text-xs font-semibold text-gray-600">入住人数</label>
                <select
                  className="w-full text-sm outline-none mt-1 bg-transparent"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                >
                  {Array.from({ length: Math.max(property.maxGuests, 1) }).map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1}位房客</option>
                  ))}
                </select>
              </div>
            </div>

            {err && (
              <div className="flex items-start space-x-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{err}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-start space-x-2 bg-green-50 text-green-700 p-3 rounded-lg text-sm">
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {nights > 0 && (
              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>{formatCurrency(property.pricePerNight)} × {nights}晚</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>服务费</span>
                  <span>包含</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-100">
                  <span>总计</span>
                  <span className="text-rose-600">{formatCurrency(total)}</span>
                </div>
              </div>
            )}

            <button
              onClick={submitBooking}
              disabled={bookingLoading || property.status !== "APPROVED"}
              className="btn-primary w-full"
            >
              {bookingLoading ? "预订中..." : property.status !== "APPROVED" ? "暂不可预订" : "立即预订"}
            </button>

            {user && user.id !== property.hostId && (
              <button
                onClick={() => setShowComplaintModal(true)}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                举报此房源
              </button>
            )}
          </div>
        </div>
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReviewModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">发表评价</h3>
              <button onClick={() => setShowReviewModal(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">总体评分</label>
                <div className="flex space-x-2">
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} onClick={() => setReviewForm({ ...reviewForm, rating: n })}>
                      <Star className={`w-8 h-8 ${n <= reviewForm.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>
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
              <div>
                <label className="block text-sm font-medium mb-2">评价内容</label>
                <textarea
                  rows={4}
                  className="input-field"
                  placeholder="分享您的真实入住体验..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </div>
              <button onClick={submitReview} className="btn-primary w-full">提交评价</button>
            </div>
          </div>
        </div>
      )}

      {showComplaintModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowComplaintModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">提交投诉</h3>
              <button onClick={() => setShowComplaintModal(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">标题</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="简要描述问题"
                  value={complaintForm.subject}
                  onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">详细描述</label>
                <textarea
                  rows={4}
                  className="input-field"
                  placeholder="请详细描述您遇到的问题，我们会尽快核实处理"
                  value={complaintForm.content}
                  onChange={(e) => setComplaintForm({ ...complaintForm, content: e.target.value })}
                />
              </div>
              <button onClick={submitComplaint} className="btn-primary w-full">提交投诉</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
