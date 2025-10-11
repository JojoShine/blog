import Link from "next/link";
import Header from "../components/Header";
import { headers } from 'next/headers';

/**
 * 获取最新发布的文章
 * @returns {Promise<Object>} 包含文章列表的对象
 */
async function getRecentPosts() {
  try {
    // 服务端组件需要使用完整URL
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

    // 生产环境需要加上basePath
    const basePath = process.env.NODE_ENV === 'production' ? '/blog' : '';
    const baseUrl = `${protocol}://${host}${basePath}`;

    const res = await fetch(`${baseUrl}/api/posts?published=true&limit=6`, {
      cache: 'no-store'
    });

    if (!res.ok) return { posts: [] };
    return await res.json();
  } catch (error) {
    console.error('获取文章失败:', error);
    return { posts: [] };
  }
}


/**
 * 首页组件
 * 展示网站介绍、最新文章和分类导航
 * 使用Server Components在服务端获取数据，提供更好的SEO支持
 */
export const dynamic = 'force-dynamic';

export default async function Home() {
  // 获取最新文章数据
  const { posts } = await getRecentPosts();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          欢迎来到甜宝塔的博客
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          分享技术见解、生活感悟和学习心得的个人空间
        </p>
        <Link 
          href="/blog"
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          开始阅读
        </Link>
      </section>

      {/* Recent Posts */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">最新文章</h2>
        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2">
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                    {post.title}
                  </Link>
                </h3>
                {post.excerpt && (
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  {post.category && (
                    <span className="bg-secondary px-2 py-1 rounded">
                      {post.category.name}
                    </span>
                  )}
                  <time>{post.published_at ? new Date(post.published_at).toLocaleDateString('zh-CN') : '未知日期'}</time>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            暂无文章，请先添加一些内容。
          </p>
        )}
        
        {posts.length > 0 && (
          <div className="text-center mt-8">
            <Link 
              href="/blog"
              className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              查看全部文章
            </Link>
          </div>
        )}
      </section>
      </main>


      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 甜宝塔的博客. All rights reserved.</p>
          <p className="mt-2">分享技术见解、生活感悟和学习心得的个人空间</p>
          <p className="mt-1 text-sm">苏ICP备2023047566号-2</p>
        </div>
      </footer>
    </div>
  );
}
