'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Toaster } from "../../components/ui/sonner";

export default function AdminLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      // 如果是登录页面，直接显示
      if (pathname === '/admin/login') {
        setIsLoading(false);
        return;
      }

      // 检查认证状态
      const authenticated = localStorage.getItem("admin_authenticated");
      const loginTime = localStorage.getItem("admin_login_time");
      
      if (authenticated === "true" && loginTime) {
        // 检查登录是否过期（24小时）
        const currentTime = Date.now();
        const timeDiff = currentTime - parseInt(loginTime);
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          setIsAuthenticated(true);
        } else {
          // 登录过期，清除状态
          localStorage.removeItem("admin_authenticated");
          localStorage.removeItem("admin_login_time");
          router.push("/admin/login");
        }
      } else {
        router.push("/admin/login");
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_login_time");
    router.push("/admin/login");
  };

  // 如果是登录页面，直接渲染children
  if (pathname === '/admin/login') {
    return children;
  }

  // 如果正在加载认证状态，显示加载页面
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在验证身份...</p>
        </div>
      </div>
    );
  }

  // 如果未认证，不渲染任何内容（会重定向到登录页）
  if (!isAuthenticated) {
    return null;
  }
  return (
    <>
      <Toaster />
      <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Navigation */}
      <header className="border-b bg-card flex-shrink-0">
        <div className="px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-xl font-bold">
                博客管理
              </Link>
              <div className="h-6 w-px bg-border" />
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                返回首页
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/blog" target="_blank">
                <Button variant="outline" size="sm">
                  预览网站
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                退出登录
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card overflow-y-auto">
          <nav className="p-4 space-y-2">
            <div className="pb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                内容管理
              </h3>
            </div>
            
            <Link
              href="/admin"
              className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" />
              </svg>
              概览
            </Link>

            <Link
              href="/admin/posts"
              className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              文章管理
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              分类管理
            </Link>

            <Link
              href="/admin/comments"
              className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              评论管理
            </Link>

            <div className="pt-4 pb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                系统
              </h3>
            </div>

            <Link
              href="/admin/media"
              className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              媒体库
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
    </>
  );
}