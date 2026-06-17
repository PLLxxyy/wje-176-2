import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, ApiSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return ApiError("请先登录", 401);

    const body = await req.json();
    const { bookingId, propertyId, userId, rating, comment, reviewType, cleanliness, experience, guestQuality } = body;

    if (!bookingId || !propertyId || !userId || !rating || !comment || !reviewType) {
      return ApiError("请填写完整评价信息", 400);
    }
    if (rating < 1 || rating > 5) return ApiError("评分需在1-5之间", 400);

    const existing = await prisma.review.findFirst({
      where: { bookingId, authorId: user.id, reviewType },
    });
    if (existing) return ApiError("您已评价过该订单", 400);

    const review = await prisma.$transaction(async (tx) => {
      const rv = await tx.review.create({
        data: {
          authorId: user.id,
          userId: Number(userId),
          propertyId: Number(propertyId),
          bookingId: Number(bookingId),
          rating: Number(rating),
          comment,
          reviewType,
          cleanliness: cleanliness ? Number(cleanliness) : null,
          experience: experience ? Number(experience) : null,
          guestQuality: guestQuality ? Number(guestQuality) : null,
        },
      });

      const stats = await tx.review.aggregate({
        where: { propertyId: Number(propertyId), reviewType: "GUEST_TO_HOST" },
        _avg: { rating: true },
        _count: true,
      });
      if (stats._avg.rating) {
        await tx.property.update({
          where: { id: Number(propertyId) },
          data: {
            rating: Math.round(stats._avg.rating * 100) / 100,
            reviewCount: stats._count,
          },
        });
      }
      return rv;
    });

    return ApiSuccess({ review }, 201);
  } catch (e) {
    console.error(e);
    return ApiError("评价失败", 500);
  }
}
