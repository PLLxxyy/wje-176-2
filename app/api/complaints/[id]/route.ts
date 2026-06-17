import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, ApiSuccess } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return ApiError("无权限", 403);

    const id = Number(params.id);
    const { status } = await req.json();

    const complaint = await prisma.complaint.update({
      where: { id },
      data: { status },
    });
    return ApiSuccess({ complaint });
  } catch (e) {
    console.error(e);
    return ApiError("更新投诉失败", 500);
  }
}
