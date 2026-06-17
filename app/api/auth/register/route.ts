import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";
import { ApiError, ApiSuccess } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role, phone } = await req.json();

    if (!email || !password || !name) {
      return ApiError("请填写邮箱、密码和姓名", 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return ApiError("该邮箱已被注册", 400);
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        phone,
        role: role || "GUEST",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      },
    });

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role as any,
    });
    await setAuthCookie(token);

    return ApiSuccess({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
    }, 201);
  } catch (e) {
    console.error(e);
    return ApiError("注册失败", 500);
  }
}
