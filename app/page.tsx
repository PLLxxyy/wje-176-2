"use client";

import { useEffect, useState } from "react";
import PropertyCard, { PropertyCardData } from "@/components/PropertyCard";
import { Search, MapPin, Filter, X, Users, BedDouble } from "lucide-react";
import { ROOM_TYPES, CITIES } from "@/lib/utils";

export default function HomePage() {
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [roomType, setRoomType] = useState("");
  const [guests, setGuests] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchProperties = async (reset = false) => {
    setLoading(true);
    if (reset) {
      setKeyword(""); setCity(""); setMinPrice(""); setMaxPrice("");
      setRoomType(""); setGuests(""); setSearched(false);
    }
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (city) params.set("city", city);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (roomType) params.set("roomType", roomType);
    if (guests) params.set("guests", guests);
    params.set("status", "APPROVED");
    const res = await fetch(`/api/properties?${params}`);
    const json = await res.json();
    setProperties(json.data?.properties || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    fetchProperties();
  };

  const onFilter = () => {
    setSearched(true);
    fetchProperties();
    setShowFilter(false);
  };

  const hasFilter = city || minPrice || maxPrice || roomType || guests || keyword;

  return (
    <div>
      <section className="relative bg-gradient-to-br from-rose-500 via-rose-600 to-orange-500 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-10 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              旅行中的另一个家
            </h1>
            <p className="text-lg md:text-xl text-rose-50 opacity-90 max-w-2xl mx-auto">
              发现全国精选房源，体验独特风土人情，每一次入住都有惊喜
            </p>
          </div>

          <form onSubmit={onSearch} className="bg-white rounded-2xl shadow-2xl p-3 md:p-4 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
              <div className="md:col-span-5 flex items-center bg-gray-50 rounded-xl px-4 py-2">
                <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
                  placeholder="搜索房源名称、地址或关键词..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="md:col-span-3 flex items-center bg-gray-50 rounded-xl px-4 py-2">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <select
                  className="flex-1 bg-transparent outline-none text-gray-800"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">全部城市</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex items-center bg-gray-50 rounded-xl px-4 py-2">
                <Users className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <select
                  className="flex-1 bg-transparent outline-none text-gray-800"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                >
                  <option value="">入住人数</option>
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>{n}人及以上</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" className="btn-primary flex-1 py-3">
                  搜索
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilter(!showFilter)}
                  className={`flex items-center justify-center px-4 rounded-xl border-2 transition ${
                    showFilter
                      ? "border-rose-500 bg-rose-50 text-rose-600"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {showFilter && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">每晚价格（元）</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      className="input-field !py-2 text-sm"
                      placeholder="最低"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      className="input-field !py-2 text-sm"
                      placeholder="最高"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">房型</label>
                  <select
                    className="input-field !py-2 text-sm"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                  >
                    <option value="">全部房型</option>
                    {ROOM_TYPES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end space-x-2">
                  <button
                    type="button"
                    onClick={onFilter}
                    className="btn-primary !py-2 flex-1"
                  >
                    应用筛选
                  </button>
                  <button
                    type="button"
                    onClick={() => fetchProperties(true)}
                    className="btn-secondary !py-2"
                  >
                    重置
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {searched ? "搜索结果" : "精选房源"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              共找到 <span className="font-medium text-rose-600">{properties.length}</span> 套房源
              {hasFilter && (
                <button
                  onClick={() => fetchProperties(true)}
                  className="ml-3 inline-flex items-center text-gray-500 hover:text-rose-600"
                >
                  <X className="w-3.5 h-3.5 mr-0.5" />
                  清除筛选
                </button>
              )}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BedDouble className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">暂无符合条件的房源</h3>
            <p className="text-sm text-gray-400 mb-6">试试调整筛选条件或搜索其他关键词</p>
            <button onClick={() => fetchProperties(true)} className="btn-primary">
              查看全部房源
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
