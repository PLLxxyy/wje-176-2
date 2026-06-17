import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, ApiSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { eachDayOfInterval } from "date-fns";

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return ApiError("请先登录", 401);

    const id = Number(params.id);
    const { action } = await req.json();

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return ApiError("订单不存在", 404);

    const isHost = booking.hostId === user.id;
    const isGuest = booking.guestId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isHost && !isGuest && !isAdmin) return ApiError("无权限操作该订单", 403);

    let newStatus: string | null = null;

    switch (action) {
      case "confirm":
        if (booking.status !== "PENDING") return ApiError("订单状态不允许此操作", 400);
        if (!isHost && !isAdmin) return ApiError("只有房东可确认订单", 403);
        newStatus = "CONFIRMED";
        break;
      case "reject":
        if (booking.status !== "PENDING") return ApiError("订单状态不允许此操作", 400);
        if (!isHost && !isAdmin) return ApiError("只有房东可拒绝订单", 403);
        newStatus = "CANCELLED";
        break;
      case "checkin":
        if (booking.status !== "CONFIRMED") return ApiError("订单状态不允许此操作", 400);
        if (!isHost && !isAdmin) return ApiError("只有房东可办理入住", 403);
        newStatus = "CHECKED_IN";
        break;
      case "complete":
        if (booking.status !== "CHECKED_IN") return ApiError("订单状态不允许此操作", 400);
        if (!isHost && !isAdmin) return ApiError("只有房东可办理退房", 403);
        newStatus = "COMPLETED";
        break;
      case "cancel":
        if (booking.status !== "PENDING" && booking.status !== "CONFIRMED")
          return ApiError("订单状态不允许取消", 400);
        if (!isGuest && !isHost && !isAdmin) return ApiError("无权限取消", 403);
        newStatus = "CANCELLED";
        break;
      default:
        return ApiError("无效操作", 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const up = await tx.booking.update({
        where: { id },
        data: { status: newStatus as any },
      });
      if (newStatus === "CANCELLED") {
        await tx.calendar.updateMany({
          where: { bookingId: id },
          data: { isAvailable: true, bookingId: null },
        });
      }
      return up;
    });

    return ApiSuccess({ booking: updated });
  } catch (e) {
    console.error(e);
    return ApiError("操作失败", 500);
  }
}
