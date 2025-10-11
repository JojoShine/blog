import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import logoImg from "../assets/images/logo.jpg";

export default function Header() {
  return (
    <header className="border-b fixed top-0 left-0 right-0 bg-background z-50">
      <div className="container mx-auto px-6 sm:px-4 py-6">
        {/* Desktop Layout */}
        <nav className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src={logoImg}
              alt="甜宝塔的博客 Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <Link href="/" className="text-2xl font-bold">
              甜宝塔的博客
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/blog" className="hover:text-primary">
              文章
            </Link>
            <Link href="/categories" className="hover:text-primary">
              分类
            </Link>
            <Link href="/search" className="hover:text-primary">
              搜索
            </Link>
            <Link href="/admin" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
              管理
            </Link>

            <ThemeToggle />

            <span className="text-muted-foreground">|</span>

            <Link
              href="https://tbtparent.me/ai-station/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary flex items-center gap-1"
            >
              AI小站
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>

            <Link
              href="https://tbtparent.me/product-display/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary flex items-center gap-1"
            >
              产品小站
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </nav>

        {/* Mobile Layout */}
        <nav className="md:hidden">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 mb-4">
            <Image
              src={logoImg}
              alt="甜宝塔的博客 Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <Link href="/" className="text-2xl font-bold">
              甜宝塔的博客
            </Link>
          </div>

          {/* Navigation Menu */}
          <div className="flex flex-wrap gap-3">
            <Link href="/blog" className="hover:text-primary px-3 py-2 border rounded-lg">
              文章
            </Link>
            <Link href="/categories" className="hover:text-primary px-3 py-2 border rounded-lg">
              分类
            </Link>
            <Link href="/search" className="hover:text-primary px-3 py-2 border rounded-lg">
              搜索
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}