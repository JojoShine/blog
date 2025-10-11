import { NextResponse } from 'next/server';
import { Post, Category } from '../../../models/index.js';
import { Op } from 'sequelize';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        posts: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
        query: '',
      });
    }

    const offset = (page - 1) * limit;
    const searchTerm = query.trim();

    // 搜索文章标题和内容
    const { count, rows: posts } = await Post.findAndCountAll({
      where: {
        published: true,
        [Op.or]: [
          {
            title: {
              [Op.iLike]: `%${searchTerm}%`
            }
          },
          {
            content: {
              [Op.iLike]: `%${searchTerm}%`
            }
          },
          {
            excerpt: {
              [Op.iLike]: `%${searchTerm}%`
            }
          }
        ]
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      order: [['published_at', 'DESC']],
      limit,
      offset,
    });

    // 高亮搜索关键词
    const highlightedPosts = posts.map(post => ({
      ...post.toJSON(),
      title: highlightSearchTerm(post.title, searchTerm),
      excerpt: post.excerpt ? highlightSearchTerm(post.excerpt, searchTerm) : null,
    }));

    return NextResponse.json({
      posts: highlightedPosts,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
      query: searchTerm,
    });

  } catch (error) {
    console.error('搜索失败:', error);
    return NextResponse.json(
      { error: '搜索失败' },
      { status: 500 }
    );
  }
}

// 高亮搜索关键词
function highlightSearchTerm(text, searchTerm) {
  if (!text || !searchTerm) return text;
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// 转义正则表达式特殊字符
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}