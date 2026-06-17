import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, ApiSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return ApiError("请先登录", 401);

    const body = await req.json();
    const { subject, content, propertyId, bookingId } = body;

    if (!subject || !content) return ApiError("请填写投诉标题和内容", 400);

    const complaint = await prisma.complaint.create({
      data: {
        userId: user.id,
        subject,
        content,
        propertyId: propertyId ? Number(propertyId) : undefined,
        bookingId: bookingId ? Number(bookingId) : undefined,
      },
    });

    return ApiSuccess({ complaint }, 201);
  } catch (e) {
    console.error(e);
    return ApiError("投诉提交失败", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return ApiError("请先登录", 401);

    let where: any = {};
    if (user.role !== "ADMIN") where.userId = user.id;

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        property: { select: { id: true, title: true } },
        booking: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ApiSuccess({ complaints });
  } catch (e) {
    console.error(e);
    return ApiError("获取投诉失败", 500);
  }
}
