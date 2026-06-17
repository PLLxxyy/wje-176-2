import Link from "next/link";
import { Building2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="w-6 h-6 text-rose-500" />
              <span className="text-lg font-bold text-gray-900">宿家民宿</span>
            </div>
            <p className="text-sm text-gray-600">
              让每一次出行都像回家，让每一处闲置都产生价值。
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">关于我们</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-rose-500">公司介绍</a></li>
              <li><a href="#" className="hover:text-rose-500">加入我们</a></li>
              <li><a href="#" className="hover:text-rose-500">新闻资讯</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">房客服务</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-rose-500">搜索房源</Link></li>
              <li><a href="#" className="hover:text-rose-500">入住保障</a></li>
              <li><a href="#" className="hover:text-rose-500">取消政策</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">房东服务</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/properties/new" className="hover:text-rose-500">发布房源</Link></li>
              <li><a href="#" className="hover:text-rose-500">房东手册</a></li>
              <li><a href="#" className="hover:text-rose-500">安全保障</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">© 2026 宿家民宿 版权所有</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href="#" className="text-xs text-gray-500 hover:text-rose-500">隐私政策</a>
            <a href="#" className="text-xs text-gray-500 hover:text-rose-500">服务条款</a>
            <a href="#" className="text-xs text-gray-500 hover:text-rose-500">联系客服</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
