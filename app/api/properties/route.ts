import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, ApiSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { startOfMonth, addDays } from "date-fns";
import { normalizeProperty, stringifyJSONArray } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "HOST" && user.role !== "ADMIN")) {
      return ApiError("无权限发布房源，请先升级为房东", 403);
    }

    const body = await req.json();
    const {
      title, description, address, city, roomType, maxGuests,
      bedrooms, bathrooms, pricePerNight, amenities, photos, coverPhoto,
    } = body;

    if (!title || !address || !city || !roomType || !maxGuests || !pricePerNight || !photos?.length) {
      return ApiError("请填写完整的房源信息", 400);
    }

    const property = await prisma.property.create({
      data: {
        title,
        description: description || "",
        address,
        city,
        roomType,
        maxGuests: Number(maxGuests),
        bedrooms: Number(bedrooms) || 0,
        bathrooms: Number(bathrooms) || 0,
        pricePerNight: Number(pricePerNight) as any,
        amenities: stringifyJSONArray(amenities || []),
        photos: stringifyJSONArray(photos || []),
        coverPhoto: coverPhoto || photos[0],
        hostId: user.id,
      },
    });

    const startDate = startOfMonth(new Date());
    const calendarData = [];
    for (let i = 0; i < 180; i++) {
      calendarData.push({
        propertyId: property.id,
        date: addDays(startDate, i),
        isAvailable: true,
        price: Number(pricePerNight) as any,
      });
    }
    await prisma.calendar.createMany({ data: calendarData });

    return ApiSuccess({ property }, 201);
  } catch (e) {
    console.error(e);
    return ApiError("发布房源失败", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const keyword = searchParams.get("keyword");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const roomType = searchParams.get("roomType");
    const guests = searchParams.get("guests");
    const status = searchParams.get("status") || "APPROVED";

    const where: any = { status };
    if (city) where.city = { contains: city };
    if (keyword) where.OR = [
      { title: { contains: keyword } },
      { description: { contains: keyword } },
      { address: { contains: keyword } },
    ];
    if (minPrice) where.pricePerNight = { gte: Number(minPrice) as any };
    if (maxPrice) where.pricePerNight = { ...where.pricePerNight, lte: Number(maxPrice) as any };
    if (roomType) where.roomType = roomType;
    if (guests) where.maxGuests = { gte: Number(guests) };

    const properties = await prisma.property.findMany({
      where,
      include: { host: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return ApiSuccess({ properties: properties.map(normalizeProperty) });
  } catch (e) {
    console.error(e);
    return ApiError("获取房源列表失败", 500);
  }
}
