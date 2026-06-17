import type { ReactNode } from "react";
import { Building2, Star, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { formatCurrency, ROOM_TYPES } from "@/lib/utils";

export type PropertyCardData = {
  id: number;
  title: string;
  coverPhoto: string;
  city: string;
  address: string;
  roomType: string;
  maxGuests: number;
  bedrooms?: number;
  bathrooms?: number;
  pricePerNight: number | string;
  rating: number;
  reviewCount: number;
  status?: string;
};

export default function PropertyCard({ property }: { property: PropertyCardData }) {
  const roomTypeLabel =
    ROOM_TYPES.find((r) => r.value === property.roomType)?.label || property.roomType;

  return (
    <Link href={`/properties/${property.id}`} className="group block">
      <div className="card group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={property.coverPhoto}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {property.status && property.status !== "APPROVED" && (
            <div className="absolute top-3 left-3">
              <span className="badge bg-yellow-100 text-yellow-800 backdrop-blur-sm bg-opacity-90">
                {property.status === "PENDING" ? "待审核" : "已拒绝"}
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center space-x-1 shadow-sm">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium">{property.rating > 0 ? property.rating.toFixed(1) : "暂无"}</span>
            {property.reviewCount > 0 && (
              <span className="text-xs text-gray-500">({property.reviewCount})</span>
            )}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-rose-600 transition">
              {property.title}
            </h3>
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-2 space-x-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{property.city} · {property.address}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {roomTypeLabel}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              住{property.maxGuests}人
            </span>
            {property.bedrooms !== undefined && property.bedrooms > 0 && (
              <span>{property.bedrooms}卧{property.bathrooms || 0}卫</span>
            )}
          </div>
          <div className="flex items-baseline justify-between pt-3 border-t border-gray-100">
            <div>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(property.pricePerNight)}</span>
              <span className="text-sm text-gray-500"> / 晚</span>
            </div>
            <span className="text-sm text-rose-600 font-medium group-hover:translate-x-1 transition">
              查看详情 →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
