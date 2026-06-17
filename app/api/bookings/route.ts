import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, ApiSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { calculateNights, getDatesBetween } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return ApiError("请先登录", 401);

    const body = await req.json();
    const { propertyId, checkIn, checkOut, guests } = body;

    if (!propertyId || !checkIn || !checkOut || !guests) {
      return ApiError("请填写完整预订信息", 400);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = calculateNights(checkInDate, checkOutDate);

    if (nights <= 0) return ApiError("退房日期必须晚于入住日期", 400);

    const property = await prisma.property.findUnique({
      where: { id: Number(propertyId) },
      include: {
        calendars: {
          where: {
            date: {
              gte: checkInDate,
              lt: checkOutDate,
            },
          },
        },
      },
    });

    if (!property) return ApiError("房源不存在", 404);
    if (property.status !== "APPROVED") return ApiError("该房源暂不可预订", 400);
    if (guests > property.maxGuests) return ApiError(`该房源最多可住${property.maxGuests}人`, 400);

    const unavailableDates = property.calendars.filter((c) => !c.isAvailable);
    if (unavailableDates.length > 0) {
      return ApiError("所选日期内有不可预订的日期", 400);
    }

    let totalPrice = 0;
    property.calendars.forEach((c) => (totalPrice += Number(c.price)));
    if (property.calendars.length !== nights) {
      totalPrice = nights * Number(property.pricePerNight);
    }

    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          guestId: user.id,
          hostId: property.hostId,
          propertyId: property.id,
          status: "PENDING",
          checkIn: checkInDate,
          checkOut: checkOutDate,
          nights,
          guests: Number(guests),
          totalPrice: totalPrice as any,
        },
      });

      const dates = getDatesBetween(checkInDate, checkOutDate);
      for (const date of dates) {
        await tx.calendar.upsert({
          where: {
            propertyId_date: {
              propertyId: property.id,
              date,
            },
          },
          update: {
            isAvailable: false,
            bookingId: newBooking.id,
          },
          create: {
            propertyId: property.id,
            date,
            isAvailable: false,
            price: Number(property.pricePerNight) as any,
            bookingId: newBooking.id,
          },
        });
      }
      return newBooking;
    });

    return ApiSuccess({ booking }, 201);
  } catch (e) {
    console.error(e);
    return ApiError("预订失败", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return ApiError("请先登录", 401);

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // guest | host | admin
    const status = searchParams.get("status");

    let where: any = {};
    if (type === "host") where.hostId = user.id;
    else if (type === "admin" && user.role === "ADMIN") where = {};
    else where.guestId = user.id;
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        guest: { select: { id: true, name: true, avatar: true, phone: true } },
        host: { select: { id: true, name: true, avatar: true, phone: true } },
        property: {
          select: {
            id: true, title: true, coverPhoto: true, city: true, address: true,
            pricePerNight: true, maxGuests: true,
          },
        },
        reviews: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return ApiSuccess({ bookings });
  } catch (e) {
    console.error(e);
    return ApiError("获取订单失败", 500);
  }
}
