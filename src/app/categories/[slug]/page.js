"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

async function getCategory(slug) {
  try {
    const res = await apiFetch('/api/categories');

    if (!res.ok) return null;

    const categories = await res.json();
    return categories.find(c => c.slug === slug) || null;
  } catch (error) {
    console.error('获取分类失败:', error);
    return null;
  }
}

async function getCategoryPosts(categoryId, page = 1) {
  try {
    const res = await apiFetch(`/api/posts?published=true&categoryId=${categoryId}&page=${page}&limit=10`);

    if (!res.ok) return { posts: [], pagination: {} };
    return await res.json();
  } catch (error) {
    console.error('获取文章失败:', error);
    return { posts: [], pagination: {} };
  }
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const slug = params.slug;
        const categoryData = await getCategory(slug);
        setCategory(categoryData);

        if (categoryData) {
          const postsData = await getCategoryPosts(categoryData.id, currentPage);
          setPosts(postsData.posts || []);
          setPagination(postsData.pagination || {});
        }
      } catch (error) {
        console.error('获取分类数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-6">
            <nav className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                甜宝塔的博客
              </Link>
              <div className="flex items-center space-x-6">
                <Link href="/blog" className="hover:text-primary">
                  文章
                </Link>
                <Link href="/categories" className="hover:text-primary">
                  分类
                </Link>
                <Link href="/admin" className="hover:text-primary">
                  管理
                </Link>
              </div>
            </nav>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-6">
            <nav className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                甜宝塔的博客
              </Link>
              <div className="flex items-center space-x-6">
                <Link href="/blog" className="hover:text-primary">
                  文章
                </Link>
                <Link href="/categories" className="hover:text-primary">
                  分类
                </Link>
                <Link href="/admin" className="hover:text-primary">
                  管理
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">分类不存在</h1>
          <p className="text-muted-foreground mb-8">抱歉，您访问的分类不存在。</p>
          <Link
            href="/categories"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            查看所有分类
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              甜宝塔的博客
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/blog" className="hover:text-primary">
                文章
              </Link>
              <Link href="/categories" className="hover:text-primary">
                分类
              </Link>
              <Link href="/admin" className="hover:text-primary">
                管理
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:pt-8 pt-16">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary">首页</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-primary">分类</Link>
            <span>/</span>
            <span className="text-foreground">{category.name}</span>
          </nav>

          {/* Category Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold md:block hidden">{category.name}</h1>
              <span className="bg-secondary px-3 py-1 rounded-full text-sm">
                {pagination.total || 0} 篇文章
              </span>
            </div>
            
            {category.description && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {category.description}
              </p>
            )}
          </header>

          {posts.length > 0 ? (
            <>
              {/* Posts List */}
              <div className="space-y-8 mb-8">
                {posts.map((post) => (
                  <article key={post.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <time className="text-sm text-muted-foreground">
                        {new Date(post.published_at).toLocaleDateString('zh-CN')}
                      </time>
                    </div>
                    
                    <h2 className="text-2xl font-semibold mb-3">
                      <Link 
                        href={`/blog/${post.slug}`} 
                        className="hover:text-primary transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    
                    {post.excerpt && (
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      阅读全文 →
                    </Link>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  {currentPage > 1 && (
                    <Link
                      href={`/categories/${params.slug}?page=${currentPage - 1}`}
                      className="px-4 py-2 border rounded-lg hover:bg-secondary transition-colors"
                    >
                      上一页
                    </Link>
                  )}

                  <span className="px-4 py-2">
                    第 {currentPage} 页，共 {pagination.totalPages} 页
                  </span>

                  {currentPage < pagination.totalPages && (
                    <Link
                      href={`/categories/${params.slug}?page=${currentPage + 1}`}
                      className="px-4 py-2 border rounded-lg hover:bg-secondary transition-colors"
                    >
                      下一页
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold mb-4">该分类下暂无文章</h2>
              <p className="text-muted-foreground mb-8">
                {category.name} 分类下还没有发布的文章。
              </p>
              <div className="space-x-4">
                <Link 
                  href="/blog"
                  className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  查看所有文章
                </Link>
                <Link 
                  href="/admin" 
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  创建文章
                </Link>
              </div>
            </div>
          )}

          {/* Back to Categories */}
          <div className="mt-12 text-center">
            <Link 
              href="/categories"
              className="inline-flex items-center text-primary hover:underline"
            >
              ← 返回所有分类
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}