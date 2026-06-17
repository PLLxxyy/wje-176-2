import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";
import { ApiError, ApiSuccess } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return ApiError("请填写邮箱和密码", 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return ApiError("邮箱或密码错误", 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return ApiError("邮箱或密码错误", 401);
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role as any,
    });
    await setAuthCookie(token);

    return ApiSuccess({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, phone: user.phone },
    });
  } catch (e) {
    console.error(e);
    return ApiError("登录失败", 500);
  }
}
