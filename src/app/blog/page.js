"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import Pagination from "../../components/Pagination";
import { apiFetch } from "@/lib/api";

function BlogContent() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page')) || 1;
  const categoryId = searchParams.get('categoryId');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // 获取文章列表
        const postsParams = new URLSearchParams();
        postsParams.set('published', 'true');
        postsParams.set('page', currentPage.toString());
        postsParams.set('limit', '5');

        if (categoryId) {
          postsParams.set('categoryId', categoryId);
        }

        const postsRes = await apiFetch(`/api/posts?${postsParams}`);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.posts || []);
          setPagination(postsData.pagination || {});
        }

        // 获取分类
        const categoriesRes = await apiFetch('/api/categories');
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-32">
          <div className="text-center py-16">
            <p>加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 pt-32">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <div className="sticky top-8">
              <h3 className="text-xl font-semibold mb-4">文章分类</h3>
              <div className="space-y-2">
                <Link
                  href="/blog"
                  className={`block px-3 py-2 rounded-lg transition-colors ${
                    !categoryId
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  }`}
                >
                  全部文章
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/blog?categoryId=${category.id}`}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      categoryId == category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <span className="text-xs opacity-70">
                        ({category.postCount || 0})
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold">
                    {categoryId
                      ? `${categories.find(c => c.id == categoryId)?.name || '分类'}文章`
                      : '博客文章'
                    }
                  </h1>
                  {posts.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      共 {pagination.total || posts.length} 篇文章
                    </p>
                  )}
                </div>

                {/* 紧凑型分页 - 右上角 */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  baseUrl="/blog"
                  queryParams={{
                    categoryId: categoryId
                  }}
                  compact={true}
                />
              </div>
              {categoryId && (
                <p className="text-muted-foreground">
                  正在浏览分类: {categories.find(c => c.id == categoryId)?.name}
                </p>
              )}
            </div>

            {posts.length > 0 ? (
              <>
                {/* Posts Grid */}
                <div className="space-y-8">
                  {posts.map((post) => (
                    <article key={post.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-2 mb-2">
                        {post.category && (
                          <span className="bg-secondary px-2 py-1 rounded text-sm">
                            {post.category.name}
                          </span>
                        )}
                        <time className="text-sm text-muted-foreground">
                          {post.published_at ? new Date(post.published_at).toLocaleDateString('zh-CN') : '未知日期'}
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
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  {categoryId ? '该分类下暂无文章' : '暂无文章'}
                </p>
                <Link 
                  href="/admin" 
                  className="inline-flex items-center mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  创建第一篇文章
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-32">
          <div className="text-center py-16">
            <p>加载中...</p>
          </div>
        </div>
      </div>
    }>
      <BlogContent />
    </Suspense>
  );
}