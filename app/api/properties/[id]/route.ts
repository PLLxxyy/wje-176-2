import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, ApiSuccess } from "@/lib/api";
import { normalizeProperty, stringifyJSONArray } from "@/lib/utils";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const id = Number(params.id);
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        host: { select: { id: true, name: true, avatar: true, phone: true } },
        calendars: {
          orderBy: { date: "asc" },
          take: 180,
        },
        reviews: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!property) return ApiError("房源不存在", 404);
    return ApiSuccess({ property: normalizeProperty(property) });
  } catch (e) {
    console.error(e);
    return ApiError("获取房源详情失败", 500);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const { status, ...data } = body;

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.roomType !== undefined) updateData.roomType = data.roomType;
    if (data.maxGuests !== undefined) updateData.maxGuests = Number(data.maxGuests);
    if (data.bedrooms !== undefined) updateData.bedrooms = Number(data.bedrooms);
    if (data.bathrooms !== undefined) updateData.bathrooms = Number(data.bathrooms);
    if (data.pricePerNight !== undefined) updateData.pricePerNight = Number(data.pricePerNight) as any;
    if (data.amenities !== undefined) updateData.amenities = stringifyJSONArray(data.amenities);
    if (data.photos !== undefined) {
      updateData.photos = stringifyJSONArray(data.photos);
      if (!data.coverPhoto && Array.isArray(data.photos) && data.photos.length > 0) updateData.coverPhoto = data.photos[0];
    }
    if (data.coverPhoto !== undefined) updateData.coverPhoto = data.coverPhoto;
    if (status) updateData.status = status;

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
    });
    return ApiSuccess({ property: normalizeProperty(property) });
  } catch (e) {
    console.error(e);
    return ApiError("更新房源失败", 500);
  }
}
