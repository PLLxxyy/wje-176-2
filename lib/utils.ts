import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";

export function calculateNights(checkIn: Date, checkOut: Date): number {
  const nights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
  return Math.max(nights, 1);
}

export function getDatesBetween(checkIn: Date, checkOut: Date): Date[] {
  return eachDayOfInterval({ start: new Date(checkIn), end: new Date(checkOut) }).slice(0, -1);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `¥${num.toFixed(2)}`;
}

export const AMENITIES_LIST = [
  { key: "wifi", label: "WiFi", icon: "Wifi" },
  { key: "kitchen", label: "厨房", icon: "UtensilsCrossed" },
  { key: "parking", label: "停车位", icon: "Car" },
  { key: "pool", label: "游泳池", icon: "Waves" },
  { key: "gym", label: "健身房", icon: "Dumbbell" },
  { key: "ac", label: "空调", icon: "Wind" },
  { key: "heating", label: "暖气", icon: "Flame" },
  { key: "washer", label: "洗衣机", icon: "WashingMachine" },
  { key: "tv", label: "电视", icon: "Tv" },
  { key: "workspace", label: "工作区", icon: "Monitor" },
  { key: "pets", label: "宠物友好", icon: "Dog" },
  { key: "smoke_detector", label: "烟雾报警器", icon: "AlertTriangle" },
  { key: "lock", label: "智能门锁", icon: "Lock" },
  { key: "hot_water", label: "热水", icon: "Droplets" },
  { key: "fridge", label: "冰箱", icon: "Refrigerator" },
  { key: "elevator", label: "电梯", icon: "ArrowUpDown" },
];

export const ROOM_TYPES = [
  { value: "ENTIRE_HOME", label: "整套房源" },
  { value: "PRIVATE_ROOM", label: "独立房间" },
  { value: "SHARED_ROOM", label: "合住房间" },
  { value: "STUDIO", label: "单间公寓" },
  { value: "APARTMENT", label: "公寓" },
  { value: "VILLA", label: "别墅" },
];

export const CITIES = [
  "北京", "上海", "广州", "深圳", "杭州", "成都", "重庆", "西安",
  "南京", "苏州", "武汉", "厦门", "三亚", "青岛", "大理", "丽江",
];

export const BOOKING_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待确认", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "已确认", color: "bg-blue-100 text-blue-800" },
  CHECKED_IN: { label: "已入住", color: "bg-purple-100 text-purple-800" },
  COMPLETED: { label: "已完成", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "已取消", color: "bg-gray-100 text-gray-800" },
};

export const PROPERTY_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待审核", color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "已上线", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "已拒绝", color: "bg-red-100 text-red-800" },
};

export const COMPLAINT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OPEN: { label: "待处理", color: "bg-red-100 text-red-800" },
  IN_PROGRESS: { label: "处理中", color: "bg-yellow-100 text-yellow-800" },
  RESOLVED: { label: "已解决", color: "bg-green-100 text-green-800" },
  CLOSED: { label: "已关闭", color: "bg-gray-100 text-gray-800" },
};

export function parseJSONArray<T = any>(v: any, fallback: T[] = []): T[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function stringifyJSONArray(arr: any[]): string {
  return JSON.stringify(Array.isArray(arr) ? arr : []);
}

export function normalizeProperty<T extends { amenities?: any; photos?: any }>(p: T): T {
  return {
    ...p,
    amenities: parseJSONArray((p as any).amenities),
    photos: parseJSONArray((p as any).photos),
  } as T;
}
