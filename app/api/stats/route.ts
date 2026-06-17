import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, ApiSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return ApiError("请先登录", 401);

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "host"; // host | admin

    if (type === "admin" && user.role !== "ADMIN") {
      return ApiError("无权限查看管理员统计", 403);
    }

    const bookingWhere: any = {};
    const propertyWhere: any = {};

    if (type === "host") {
      bookingWhere.hostId = user.id;
      propertyWhere.hostId = user.id;
    }

    const [allBookings, properties, pendingProperties, complaints, allProperties] = await Promise.all([
      prisma.booking.findMany({ where: bookingWhere }),
      prisma.property.findMany({ where: propertyWhere, include: { _count: { select: { bookings: true } } } }),
      type === "admin"
        ? prisma.property.count({ where: { status: "PENDING" } })
        : Promise.resolve(0),
      type === "admin" ? prisma.complaint.count({ where: { status: "OPEN" } }) : Promise.resolve(0),
      type === "admin" ? prisma.property.count() : Promise.resolve(0),
    ]);

    const completedBookings = allBookings.filter((b) => b.status === "COMPLETED");
    const confirmedBookings = allBookings.filter((b) => b.status === "CONFIRMED");
    const pendingBookings = allBookings.filter((b) => b.status === "PENDING");
    const totalRevenue = completedBookings.reduce((sum, b) => sum + Number(b.totalPrice), 0);

    const monthMap = new Map<string, { revenue: number; bookings: number }>();
    completedBookings.forEach((b) => {
      const key = `${b.checkOut.getFullYear()}-${String(b.checkOut.getMonth() + 1).padStart(2, "0")}`;
      const cur = monthMap.get(key) || { revenue: 0, bookings: 0 };
      cur.revenue += Number(b.totalPrice);
      cur.bookings += 1;
      monthMap.set(key, cur);
    });

    const monthlyData = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({ month, ...data }));

    const statusMap = new Map<string, number>();
    allBookings.forEach((b) => {
      statusMap.set(b.status, (statusMap.get(b.status) || 0) + 1);
    });
    const statusData = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

    const cityMap = new Map<string, number>();
    (type === "admin"
      ? await prisma.property.findMany({ where: { status: "APPROVED" } })
      : properties
    ).forEach((p: any) => {
      cityMap.set(p.city, (cityMap.get(p.city) || 0) + 1);
    });
    const cityData = Array.from(cityMap.entries()).map(([city, count]) => ({ city, count }));

    return ApiSuccess({
      overview: {
        totalBookings: allBookings.length,
        completedBookings: completedBookings.length,
        confirmedBookings: confirmedBookings.length,
        pendingBookings: pendingBookings.length,
        totalRevenue,
        totalProperties: type === "admin" ? allProperties : properties.length,
        pendingProperties,
        pendingComplaints: complaints,
      },
      monthlyData,
      statusData,
      cityData,
      topProperties: properties
        .sort((a, b) => b._count.bookings - a._count.bookings)
        .slice(0, 5)
        .map((p: any) => ({
          id: p.id,
          title: p.title,
          city: p.city,
          bookings: p._count.bookings,
          pricePerNight: p.pricePerNight,
        })),
    });
  } catch (e) {
    console.error(e);
    return ApiError("获取统计失败", 500);
  }
}
