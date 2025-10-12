"use client";
import { apiFetch } from '@/lib/api';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q, 1);
    }
  }, [searchParams]);

  const performSearch = async (searchTerm, page = 1) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setPagination({});
      setSearchQuery('');
      return;
    }

    setLoading(true);
    setCurrentPage(page);

    try {
      const response = await apiFetch(`/api/search?q=${encodeURIComponent(searchTerm)}&page=${page}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.posts);
        setPagination(data.pagination);
        setSearchQuery(data.query);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // 更新URL
      const url = new URL(window.location);
      url.searchParams.set('q', query);
      window.history.pushState({}, '', url);
      
      performSearch(query, 1);
    }
  };

  const handlePageChange = (page) => {
    performSearch(searchQuery, page);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 md:pt-32 pt-40">
        <div className="max-w-4xl mx-auto">
          {/* Search Form */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6 md:block hidden">搜索文章</h1>
            <form onSubmit={handleSearch} className="flex gap-4 items-center">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="请输入搜索关键词..."
                className="flex-1 h-10"
              />
              <Button type="submit" disabled={loading} className="h-10 px-6">
                {loading ? '搜索中...' : '搜索'}
              </Button>
            </form>
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="mb-6">
              <p className="text-muted-foreground">
                搜索 &quot;<span className="font-medium text-foreground">{searchQuery}</span>&quot; 
                {pagination.total !== undefined && (
                  <span> 共找到 {pagination.total} 个结果</span>
                )}
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p>搜索中...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              {/* Results List */}
              <div className="space-y-6 mb-8">
                {results.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        {post.category && (
                          <span className="bg-secondary px-2 py-1 rounded text-sm">
                            {post.category.name}
                          </span>
                        )}
                        <time className="text-sm text-muted-foreground">
                          {new Date(post.published_at).toLocaleDateString('zh-CN')}
                        </time>
                      </div>
                      
                      <h2 className="text-xl font-semibold mb-3">
                        <Link 
                          href={`/blog/${post.slug}`} 
                          className="hover:text-primary transition-colors"
                          dangerouslySetInnerHTML={{ __html: post.title }}
                        />
                      </h2>
                      
                      {post.excerpt && (
                        <p 
                          className="text-muted-foreground mb-4 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: post.excerpt }}
                        />
                      )}
                      
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center text-primary hover:underline"
                      >
                        阅读全文 →
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  {currentPage > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      上一页
                    </Button>
                  )}
                  
                  <span className="px-4 py-2">
                    第 {currentPage} 页，共 {pagination.totalPages} 页
                  </span>
                  
                  {currentPage < pagination.totalPages && (
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      下一页
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : searchQuery ? (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold mb-4">未找到相关内容</h2>
              <p className="text-muted-foreground mb-8">
                没有找到包含 &quot;{searchQuery}&quot; 的文章，请尝试其他关键词。
              </p>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">搜索建议:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 检查关键词拼写是否正确</li>
                  <li>• 尝试使用更简短的关键词</li>
                  <li>• 尝试使用同义词或相关词汇</li>
                </ul>
              </div>
              <div className="mt-8">
                <Link 
                  href="/blog"
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  浏览所有文章
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold mb-4">开始搜索</h2>
              <p className="text-muted-foreground">
                输入关键词搜索文章标题和内容
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-32">
          <div className="max-w-4xl mx-auto text-center py-16">
            <p>加载中...</p>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}