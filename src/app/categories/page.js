"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import { apiFetch } from "@/lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiFetch('/api/categories?includePosts=true');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('获取分类失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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

      <div className="container mx-auto px-4 py-8 md:pt-32 pt-40">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-4 md:block hidden">文章分类</h1>
            <p className="text-muted-foreground md:block hidden">
              浏览所有文章分类，发现您感兴趣的内容
            </p>
          </header>

          {categories.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div key={category.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <h2 className="text-xl font-semibold mb-2">
                    <Link 
                      href={`/blog?categoryId=${category.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {category.name}
                    </Link>
                  </h2>
                  
                  {category.description && (
                    <p className="text-muted-foreground mb-4">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {category.posts ? category.posts.length : 0} 篇文章
                    </span>
                    <Link 
                      href={`/blog?categoryId=${category.id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      查看文章 →
                    </Link>
                  </div>
                  
                  {/* Show recent posts in this category */}
                  {category.posts && category.posts.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">最新文章:</p>
                      <ul className="space-y-1">
                        {category.posts.slice(0, 3).map((post) => (
                          <li key={post.id}>
                            <Link 
                              href={`/blog/${post.slug}`}
                              className="text-sm text-muted-foreground hover:text-primary transition-colors line-clamp-1"
                            >
                              {post.title}
                            </Link>
                          </li>
                        ))}
                        {category.posts.length > 3 && (
                          <li>
                            <Link 
                              href={`/blog?categoryId=${category.id}`}
                              className="text-sm text-primary hover:underline"
                            >
                              查看更多...
                            </Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold mb-4">暂无分类</h2>
              <p className="text-muted-foreground mb-8">
                还没有创建任何分类，请先添加一些分类来组织您的文章。
              </p>
              <Link 
                href="/admin" 
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                创建分类
              </Link>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-12 text-center">
            <Link 
              href="/blog"
              className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors mr-4"
            >
              浏览所有文章
            </Link>
            <Link 
              href="/admin"
              className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              管理分类
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}