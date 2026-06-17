"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Upload, X, Plus, MapPin, BedDouble, Bath, Users, DollarSign, Sparkles, AlertCircle, Eye, Home, StickyNote } from "lucide-react";
import { AMENITIES_LIST, ROOM_TYPES, CITIES } from "@/lib/utils";

const SAMPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80",
];

export default function NewPropertyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    address: "",
    city: CITIES[0],
    roomType: "APARTMENT",
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    pricePerNight: "",
    amenities: [] as string[],
    photos: [] as string[],
    coverPhoto: "",
  });

  const [photoInput, setPhotoInput] = useState("");

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">请先登录</h2>
        <p className="text-gray-500 mb-6">发布房源需要房东账号</p>
        <button onClick={() => router.push("/auth/login")} className="btn-primary">去登录</button>
      </div>
    );
  }

  if (user.role !== "HOST" && user.role !== "ADMIN") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">需要房东身份</h2>
        <p className="text-gray-500 mb-6">当前账号是房客身份，发布房源请升级为房东账号</p>
        <div className="text-sm text-gray-400 max-w-md">
          您可以重新注册一个房东账号。房东可以发布房源，管理订单，查看营收。</div>
      </div>
    );
  }

  const addPhoto = () => {
    const url = photoInput.trim();
    if (!url) return;
    if (form.photos.includes(url)) {
      setPhotoInput("");
      return;
    }
    const newPhotos = [...form.photos, url];
    setForm({
      ...form,
      photos: newPhotos,
      coverPhoto: form.coverPhoto || url,
    });
    setPhotoInput("");
  };

  const addSamplePhoto = (url: string) => {
    if (form.photos.includes(url)) return;
    const newPhotos = [...form.photos, url];
    setForm({
      ...form,
      photos: newPhotos,
      coverPhoto: form.coverPhoto || url,
    });
  };

  const removePhoto = (url: string) => {
    const newPhotos = form.photos.filter((p) => p !== url);
    setForm({
      ...form,
      photos: newPhotos,
      coverPhoto: form.coverPhoto === url ? newPhotos[0] || "" : form.coverPhoto,
    });
  };

  const toggleAmenity = (key: string) => {
    const set = new Set(form.amenities);
    if (set.has(key)) set.delete(key);
    else set.add(key);
    setForm({ ...form, amenities: Array.from(set) });
  };

  const canNext1 = form.title.trim() && form.description.trim() && form.address.trim();
  const canNext2 = form.maxGuests > 0 && form.bedrooms >= 0 && form.bathrooms >= 0 && form.pricePerNight && Number(form.pricePerNight) > 0;
  const canNext3 = form.photos.length >= 1;

  const submit = async () => {
    if (!canNext1 || !canNext2 || !canNext3) return;
    setErr("");
    setLoading(true);
    fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        pricePerNight: Number(form.pricePerNight),
        maxGuests: Number(form.maxGuests),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
      }),
    })
      .then((r) => r.json())
      .then((json) => {
        setLoading(false);
        if (json.success) {
          alert("房源发布成功！管理员审核通过后即可上线。");
          router.push("/host/properties");
        } else {
          setErr(json.message || "发布失败");
        }
      })
      .catch(() => {
        setLoading(false);
        setErr("网络错误");
      });
  };

  const steps = [
    { n: 1, t: "基本信息", icon: StickyNote },
    { n: 2, t: "房型与价格", icon: Home },
    { n: 3, t: "设施与照片", icon: Sparkles },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">发布新房源</h1>
        <p className="text-gray-500">填写房源信息，帮助房客更放心</p>
      </div>

      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s.n
                    ? "bg-rose-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`ml-3 font-medium ${step >= s.n ? "text-gray-900" : "text-gray-400"}`}>
                {s.t}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${step > s.n ? "bg-rose-500" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="card p-6 md:p-8">
        {err && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{err}</div>}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold mb-4">基本信息</h2>
            <div>
              <label className="block text-sm font-medium mb-1.5">房源标题 <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input-field"
                placeholder="例：外滩江景豪华两居室公寓"
                maxLength={60}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">{form.title.length}/60 个字符</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">房源描述 <span className="text-red-500">*</span></label>
              <textarea
                rows={5}
                className="input-field"
                placeholder="详细介绍房源特色、周边交通、入住须知等，让房客更了解你的房源"
                maxLength={2000}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">所在城市 <span className="text-red-500">*</span></label>
                <select
                  className="input-field"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">详细地址 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    className="input-field pl-10"
                    placeholder="街道门牌等"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                disabled={!canNext1}
                className="btn-primary"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold mb-4">房型与价格</h2>
            <div>
              <label className="block text-sm font-medium mb-1.5">房型 <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ROOM_TYPES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, roomType: r.value })}
                    className={`py-3 rounded-lg border-2 text-sm font-medium transition ${
                      form.roomType === r.value
                        ? "border-rose-500 bg-rose-50 text-rose-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <Users className="w-4 h-4 inline mr-1" />
                  可住人数
                </label>
                <input
                  type="number"
                  min={1}
                  className="input-field"
                  value={form.maxGuests}
                  onChange={(e) => setForm({ ...form, maxGuests: Number(e.target.value) as any })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <BedDouble className="w-4 h-4 inline mr-1" />
                  卧室数
                </label>
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) as any })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <Bath className="w-4 h-4 inline mr-1" />
                  卫生间
                </label>
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  value={form.bathrooms}
                  onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) as any })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  每晚价格（元）
                </label>
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  placeholder="例：288"
                  value={form.pricePerNight}
                  onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="btn-secondary">上一步</button>
              <button onClick={() => setStep(3)} disabled={!canNext2} className="btn-primary">
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">设施与照片</h2>
            <div>
              <label className="block text-sm font-medium mb-3">配套设施</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {AMENITIES_LIST.map((a) => {
                  const active = form.amenities.includes(a.key);
                  return (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => toggleAmenity(a.key)}
                      className={`flex items-center space-x-2 py-2 px-3 rounded-lg border-2 text-sm transition ${
                        active
                          ? "border-rose-500 bg-rose-50 text-rose-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span>{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3">
                房间照片 <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-2">（至少1张，点击设为封面）
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="粘贴图片URL后点击添加"
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPhoto()}
                />
                <button onClick={addPhoto} className="btn-secondary inline-flex items-center">
                  <Upload className="w-4 h-4 mr-1" />
                  添加
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-3">或点击使用示例图片：</p>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {SAMPLE_PHOTOS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => addSamplePhoto(p)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition hover:opacity-80 ${form.photos.includes(p) ? "border-rose-500" : "border-transparent opacity-60"}
                  >
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              {form.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {form.photos.map((p) => (
                    <div key={p} className={`relative aspect-[4/3 rounded-lg overflow-hidden border-2 group ${
                      form.coverPhoto === p ? "border-rose-500" : "border-gray-200"
                    }">
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      {form.coverPhoto === p && (
                        <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
                          <Eye className="w-3 h-3 inline mr-1" />
                          封面
                        </div>
                      )}
                      <button
                        onClick={() => setForm({ ...form, coverPhoto: p })}
                        className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-xs py-1 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        设为封面
                      </button>
                      <button
                        onClick={() => removePhoto(p)}
                        className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setForm({ ...form, photos: [...form.photos, ""] })}
                    className="aspect-[4/3 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:text-gray-600 flex flex-col items-center justify-center hover:border-rose-400 transition"
                  >
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="text-sm">继续添加</span>
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(2)} className="btn-secondary">上一步</button>
              <button onClick={submit} disabled={!canNext3 || loading} className="btn-primary">
                {loading ? "发布中..." : "提交发布"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
