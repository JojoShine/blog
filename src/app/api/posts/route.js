import { NextResponse } from 'next/server';
import { Post, Category } from '../../../models/index.js';

/**
 * 文章列表API - 获取文章列表
 * 支持分页、分类筛选、发布状态筛选、slug查询
 *
 * 查询参数：
 * - page: 页码（默认1）
 * - limit: 每页数量（默认10）
 * - categoryId: 分类ID筛选
 * - published: 发布状态筛选（true/false）
 * - slug: 通过slug查询单篇文章
 *
 * 响应格式：
 * {
 *   posts: Array,
 *   pagination: {
 *     total: number,
 *     page: number,
 *     limit: number,
 *     totalPages: number
 *   }
 * }
 */
export async function GET(request) {
  try {
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug'); // 通过slug查询单篇文章

    // 如果提供了slug参数，直接查询单篇文章
    if (slug) {
      console.log('API收到slug查询:', slug);
      const post = await Post.findOne({
        where: {
          slug: slug,
          published: true // 只返回已发布的文章
        },
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }]
      });

      console.log('查询结果:', post ? `找到文章: ${post.title}` : '未找到文章');

      if (!post) {
        return NextResponse.json(
          { error: '文章不存在' },
          { status: 404 }
        );
      }

      // 返回单篇文章，保持格式一致
      return NextResponse.json({
        posts: [post],
        pagination: {
          total: 1,
          page: 1,
          limit: 1,
          totalPages: 1
        }
      });
    }

    const page = parseInt(searchParams.get('page')) || 1; // 当前页码
    const limit = parseInt(searchParams.get('limit')) || 10; // 每页文章数
    const categoryId = searchParams.get('categoryId'); // 分类筛选
    const published = searchParams.get('published'); // 发布状态筛选

    const offset = (page - 1) * limit; // 计算偏移量

    // 构建查询条件
    const whereClause = {};
    if (categoryId) {
      whereClause.category_id = categoryId; // 按分类筛选
    }
    if (published !== null) {
      whereClause.published = published === 'true'; // 按发布状态筛选
    }

    // 查询文章列表和总数
    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      include: [{ // 包含分类信息
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'] // 只返回必要的分类字段
      }],
      order: [['published_at', 'DESC']], // 按发布时间降序排列
      limit,
      offset,
    });

    // 转换为下划线命名格式，保持前后端一致
    // 注意: Sequelize的timestamps字段(createdAt/updatedAt)默认返回驼峰命名
    const formattedPosts = posts.map(post => {
      const data = post.toJSON();
      return {
        ...data,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
        published_at: data.published_at, // 这个字段已经是下划线，保持一致
      };
    });

    // 返回文章列表和分页信息
    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        total: count, // 文章总数
        page, // 当前页码
        limit, // 每页数量
        totalPages: Math.ceil(count / limit), // 总页数
      },
    });

  } catch (error) {
    console.error('获取文章列表失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * 文章创建API - 创建新文章
 * 
 * 请求体格式：
 * {
 *   title: string (必填),
 *   content: string (必填),
 *   excerpt?: string,
 *   categoryId?: number,
 *   featuredImage?: string,
 *   published?: boolean
 * }
 * 
 * 响应：创建的文章对象（包含分类信息）
 */
export async function POST(request) {
  try {
    // 解析请求体
    const body = await request.json();
    const { title, content, excerpt, categoryId, featuredImage, published } = body;

    // 基本验证
    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      );
    }

    // 生成URL友好的slug：标题转小写，非字母数字汉字替换为连字符，加时间戳确保唯一性
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-') // 非字母数字汉字替换为-
      .replace(/^-+|-+$/g, '') // 去除首尾的-
      + '-' + Date.now(); // 添加时间戳确保唯一性

    // 创建文章记录
    const post = await Post.create({
      title,
      slug,
      content,
      excerpt,
      category_id: categoryId,
      featured_image: featuredImage,
      published: published || false, // 默认为草稿状态
      published_at: published ? new Date() : null, // 如果发布则设置发布时间
    });

    // 重新查询文章以获取完整的分类信息
    const postWithCategory = await Post.findByPk(post.id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'] // 返回分类的基本信息
      }]
    });

    return NextResponse.json(postWithCategory, { status: 201 });

  } catch (error) {
    console.error('创建文章失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}