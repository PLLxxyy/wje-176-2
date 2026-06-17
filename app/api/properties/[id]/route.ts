import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, ApiSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { normalizeProperty, stringifyJSONArray } from "@/lib/utils";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const id = Number(params.id);
    const user = await getCurrentUser();

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

    let canViewGuide = false;
    if (user) {
      if (user.role === "ADMIN" || property.hostId === user.id) {
        canViewGuide = true;
      } else {
        const confirmedBooking = await prisma.booking.findFirst({
          where: {
            propertyId: id,
            guestId: user.id,
            status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] },
          },
        });
        canViewGuide = !!confirmedBooking;
      }
    }

    const normalized = normalizeProperty(property) as any;
    if (!canViewGuide) {
      delete normalized.wifiPassword;
      delete normalized.doorLockPassword;
      delete normalized.checkOutInstructions;
    }

    return ApiSuccess({ property: normalized });
  } catch (e) {
    console.error(e);
    return ApiError("获取房源详情失败", 500);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return ApiError("请先登录", 401);

    const id = Number(params.id);
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return ApiError("房源不存在", 404);

    const canEdit = user.role === "ADMIN" || property.hostId === user.id;
    if (!canEdit) return ApiError("无权限修改该房源", 403);

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
    if (data.wifiPassword !== undefined) updateData.wifiPassword = data.wifiPassword || null;
    if (data.doorLockPassword !== undefined) updateData.doorLockPassword = data.doorLockPassword || null;
    if (data.checkOutInstructions !== undefined) updateData.checkOutInstructions = data.checkOutInstructions || null;
    if (status) updateData.status = status;

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData,
    });
    return ApiSuccess({ property: normalizeProperty(updatedProperty) });
  } catch (e) {
    console.error(e);
    return ApiError("更新房源失败", 500);
  }
}
