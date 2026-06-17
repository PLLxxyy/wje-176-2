import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, ApiSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const propertyId = Number(params.id);
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    const where: any = { propertyId };
    if (month) {
      const start = new Date(month + "-01");
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      where.date = { gte: start, lte: end };
    }

    const calendars = await prisma.calendar.findMany({
      where,
      orderBy: { date: "asc" },
    });
    return ApiSuccess({ calendars });
  } catch (e) {
    console.error(e);
    return ApiError("获取日历失败", 500);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return ApiError("请先登录", 401);

    const propertyId = Number(params.id);
    const { date, isAvailable, price } = await req.json();

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return ApiError("房源不存在", 404);
    if (property.hostId !== user.id && user.role !== "ADMIN")
      return ApiError("无权限操作该房源", 403);

    const calendar = await prisma.calendar.upsert({
      where: {
        propertyId_date: {
          propertyId,
          date: new Date(date),
        },
      },
      update: {
        isAvailable: isAvailable !== undefined ? isAvailable : undefined,
        price: price !== undefined ? (Number(price) as any) : undefined,
      },
      create: {
        propertyId,
        date: new Date(date),
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        price: price !== undefined ? (Number(price) as any) : property.pricePerNight,
      },
    });

    return ApiSuccess({ calendar });
  } catch (e) {
    console.error(e);
    return ApiError("更新日历失败", 500);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return ApiError("请先登录", 401);

    const propertyId = Number(params.id);
    const { startDate, endDate, isAvailable, price } = await req.json();

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return ApiError("房源不存在", 404);
    if (property.hostId !== user.id && user.role !== "ADMIN")
      return ApiError("无权限操作该房源", 403);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates: Date[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    await prisma.$transaction(
      dates.map((d) =>
        prisma.calendar.upsert({
          where: {
            propertyId_date: { propertyId, date: d },
          },
          update: {
            isAvailable: isAvailable !== undefined ? isAvailable : undefined,
            price: price ? (Number(price) as any) : undefined,
          },
          create: {
            propertyId,
            date: d,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            price: price ? (Number(price) as any) : property.pricePerNight,
          },
        })
      )
    );

    return ApiSuccess({ message: "批量更新成功", count: dates.length });
  } catch (e) {
    console.error(e);
    return ApiError("批量更新日历失败", 500);
  }
}
