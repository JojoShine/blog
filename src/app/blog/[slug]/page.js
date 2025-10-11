"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';
import CommentList from '@/components/CommentList';
import Header from '@/components/Header';
import ShareButton from '@/components/ShareButton';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

async function getPost(slug) {
  try {
    console.log('页面收到的slug参数:', slug);
    console.log('slug类型:', typeof slug);
    console.log('slug长度:', slug.length);

    // Next.js已经自动解码了URL参数，需要先解码一次（如果是编码的）
    // 检查是否是URL编码的格式
    const decodedSlug = slug.includes('%') ? decodeURIComponent(slug) : slug;
    console.log('解码后的slug:', decodedSlug);

    // 使用 apiFetch 替代硬编码的 fetch
    const res = await apiFetch(`/api/posts?slug=${encodeURIComponent(decodedSlug)}`);

    console.log('API响应状态:', res.status);

    if (!res.ok) {
      console.log('API响应失败:', res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    console.log('API返回的文章数量:', data.posts?.length);

    // API已经过滤了发布状态，直接返回第一篇文章
    const post = data.posts?.[0] || null;

    if (post) {
      console.log('找到文章:', post.title, 'slug:', post.slug);
    } else {
      console.log('未找到匹配的文章');
    }

    return post;
  } catch (error) {
    console.error('获取文章失败:', error);
    return null;
  }
}

async function getRelatedPosts(categoryId, currentPostId) {
  try {
    if (!categoryId) return [];

    const res = await apiFetch(`/api/posts?published=true&categoryId=${categoryId}&limit=3`);

    if (!res.ok) return [];

    const data = await res.json();
    return data.posts.filter(p => p.id !== currentPostId);
  } catch (error) {
    console.error('获取相关文章失败:', error);
    return [];
  }
}

export default function PostPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const slug = params.slug;
        const postData = await getPost(slug);
        setPost(postData);

        if (postData && postData.category?.id) {
          const related = await getRelatedPosts(postData.category.id, postData.id);
          setRelatedPosts(related);
        }
      } catch (error) {
        console.error('获取文章数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 container mx-auto px-4 py-16 text-center">
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <div className="pt-24 container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">文章不存在</h1>
          <p className="text-muted-foreground mb-8">抱歉，您访问的文章不存在或已被删除。</p>
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            返回文章列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Fixed at top */}
      <Header />

      {/* Add padding to account for fixed header */}
      <div className="pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-12 max-w-[1400px] mx-auto">
            {/* Table of Contents Sidebar - Left side */}
            <aside className="hidden lg:block w-56 flex-shrink-0 -ml-16">
              <div className="sticky top-28">
                <div className="border rounded-lg p-4 bg-secondary/20">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    目录
                  </h3>
                  <TableOfContents content={post.content} />
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 max-w-full lg:max-w-4xl lg:mr-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
            <Link href="/blog" className="hover:text-primary">首页</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary">文章</Link>
            {post.category && (
              <>
                <span>/</span>
                <Link
                  href={`/blog?categoryId=${post.category.id}`}
                  className="hover:text-primary"
                >
                  {post.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground">{post.title}</span>
          </nav>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-40 md:h-52 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {post.category && (
                <Link
                  href={`/blog?categoryId=${post.category.id}`}
                  className="bg-secondary px-3 py-1 rounded-full text-sm hover:bg-secondary/80 transition-colors"
                >
                  {post.category.name}
                </Link>
              )}
              <time className="text-sm text-muted-foreground">
                {new Date(post.published_at).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>

            <div className="flex justify-between items-start gap-4 mb-4">
              <h1 className="text-4xl font-bold flex-1">{post.title}</h1>
              <ShareButton post={post} />
            </div>

            {post.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed mb-4">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Article Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              components={{
                // 自定义组件样式，添加ID用于目录跳转
                h1: ({ children, ...props }) => {
                  const headingIndex = getHeadingIndex(post.content, children);
                  return <h1 id={`heading-${headingIndex}`} className="text-3xl font-bold mt-8 mb-4" {...props}>{children}</h1>;
                },
                h2: ({ children, ...props }) => {
                  const headingIndex = getHeadingIndex(post.content, children);
                  return <h2 id={`heading-${headingIndex}`} className="text-2xl font-semibold mt-6 mb-3" {...props}>{children}</h2>;
                },
                h3: ({ children, ...props }) => {
                  const headingIndex = getHeadingIndex(post.content, children);
                  return <h3 id={`heading-${headingIndex}`} className="text-xl font-medium mt-4 mb-2" {...props}>{children}</h3>;
                },
                p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="mb-4 pl-6 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="mb-4 pl-6 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="list-disc">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                code: ({ inline, children }) =>
                  inline ? (
                    <code className="bg-secondary px-1 py-0.5 rounded text-sm">{children}</code>
                  ) : (
                    <code className="block">{children}</code>
                  ),
                pre: ({ children }) => (
                  <pre className="bg-secondary p-4 rounded-lg overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt || '文章图片'}
                    className="max-w-full h-auto rounded-lg my-4 mx-auto"
                  />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </article>

          {/* Navigation */}
          <div className="flex justify-between items-center py-8 border-t border-b">
            <Link 
              href="/blog"
              className="flex items-center text-primary hover:underline"
            >
              ← 返回文章列表
            </Link>
            
            {post.category && (
              <Link 
                href={`/blog?categoryId=${post.category.id}`}
                className="flex items-center text-primary hover:underline"
              >
                查看更多 {post.category.name} 文章 →
              </Link>
            )}
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6">相关文章</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <article key={relatedPost.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <h3 className="font-semibold mb-2">
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {relatedPost.title}
                      </Link>
                    </h3>
                    {relatedPost.excerpt && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    )}
                    <time className="text-xs text-muted-foreground">
                      {new Date(relatedPost.published_at).toLocaleDateString('zh-CN')}
                    </time>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Comments Section */}
          <section className="mt-12">
            <CommentList postId={post.id} />
          </section>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 获取标题在内容中的索引
function getHeadingIndex(content, children) {
  const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
  const childrenText = Array.isArray(children) ? children.join('') : children;
  
  for (let i = 0; i < headings.length; i++) {
    const headingText = headings[i].replace(/^#+\s+/, '');
    if (headingText === childrenText) {
      return i;
    }
  }
  return 0;
}

// 目录组件
function TableOfContents({ content }) {
  // 解析Markdown内容中的标题
  const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
  
  const tocItems = headings.map((heading, index) => {
    const level = heading.match(/^#+/)[0].length;
    const text = heading.replace(/^#+\s+/, '');
    const id = `heading-${index}`;
    
    return {
      level,
      text,
      id
    };
  });

  if (tocItems.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        本文暂无目录
      </p>
    );
  }

  return (
    <nav className="space-y-3">
      {tocItems.map((item, index) => (
        <a
          key={index}
          href={`#${item.id}`}
          className={`block text-sm hover:text-primary transition-colors leading-relaxed ${
            item.level === 1 ? 'font-medium' :
            item.level === 2 ? 'pl-2' :
            item.level === 3 ? 'pl-4' :
            'pl-6'
          }`}
          style={{
            color: item.level === 1 ? 'inherit' : 'var(--muted-foreground)'
          }}
        >
          {item.text}
        </a>
      ))}
    </nav>
  );
}