import { NextResponse } from 'next/server';
import { Category, Post } from '../../../models/index.js';

/**
 * 分类列表API - 获取所有分类
 * 
 * 查询参数：
 * - includePosts: 是否包含分类下的文章列表 (true/false)
 * 
 * 响应：分类数组，按名称升序排列
 */
export async function GET(request) {
  try {
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const includePosts = searchParams.get('includePosts') === 'true'; // 是否包含文章信息

    // 根据参数决定是否包含文章信息
    const include = includePosts ? [{
      model: Post,
      as: 'posts',
      attributes: ['id', 'title', 'slug', 'published'], // 只返回文章的基本信息
      where: { published: true }, // 只包含已发布的文章
      required: false, // 左连接，即使没有文章也返回分类
    }] : [];

    // 查询所有分类
    const categories = await Category.findAll({
      include, // 条件性包含文章信息
      order: [['name', 'ASC']], // 按分类名称升序排列
    });

    // 为每个分类添加文章数量,并转换字段命名
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const postCount = await Post.count({
          where: {
            category_id: category.id,
            published: true // 只统计已发布的文章
          }
        });

        const data = category.toJSON();
        return {
          ...data,
          created_at: data.createdAt, // 转换为下划线命名
          updated_at: data.updatedAt, // 转换为下划线命名
          postCount
        };
      })
    );

    return NextResponse.json(categoriesWithCount);

  } catch (error) {
    console.error('获取分类列表失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * 分类创建API - 创建新分类
 * 
 * 请求体格式：
 * {
 *   name: string (必填),
 *   description?: string
 * }
 * 
 * 响应：创建的分类对象
 * 
 * 注意：slug会根据名称自动生成，并检查唯一性
 */
export async function POST(request) {
  try {
    // 解析请求体
    const body = await request.json();
    const { name, description } = body;

    // 基本验证
    if (!name) {
      return NextResponse.json(
        { error: '分类名称不能为空' },
        { status: 400 }
      );
    }

    // 生成URL友好的slug：名称转小写，非字母数字汉字替换为连字符
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-') // 非字母数字汉字替换为-
      .replace(/^-+|-+$/g, ''); // 去除首尾的-

    // 检查slug是否已存在（避免重复）
    const existingCategory = await Category.findOne({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: '分类已存在' },
        { status: 400 }
      );
    }

    // 创建新分类
    const category = await Category.create({
      name,
      slug,
      description,
    });

    return NextResponse.json(category, { status: 201 });

  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}