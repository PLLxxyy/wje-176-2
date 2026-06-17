import { clearAuthCookie, getCurrentUser } from "@/lib/auth";
import { ApiError, ApiSuccess } from "@/lib/api";

export async function POST() {
  try {
    await clearAuthCookie();
    return ApiSuccess({ message: "已退出登录" });
  } catch (e) {
    return ApiError("退出失败", 500);
  }
}

export async function GET() {
  const user = await getCurrentUser();
  return ApiSuccess({ user });
}
