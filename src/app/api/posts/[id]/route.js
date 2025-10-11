import { NextResponse } from 'next/server';
import { Post, Category } from '../../../../models/index.js';

/**
 * 单个文章API - 获取指定文章详情
 * 
 * 路径参数：
 * - id: 文章ID
 * 
 * 响应：文章对象（包含分类信息）
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params; // 获取路径参数中的文章ID
    
    // 查询文章及其关联的分类信息
    const post = await Post.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'] // 只返回分类的基本信息
      }]
    });

    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);

  } catch (error) {
    console.error('获取文章失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * 文章更新API - 更新指定文章
 * 
 * 路径参数：
 * - id: 文章ID
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
 * 响应：更新后的文章对象（包含分类信息）
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params; // 获取路径参数中的文章ID
    const body = await request.json(); // 解析请求体
    const { title, content, excerpt, categoryId, featuredImage, published } = body;

    const post = await Post.findByPk(id);
    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    // 基本验证
    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      );
    }

    // 更新数据
    await post.update({
      title,
      content,
      excerpt,
      category_id: categoryId,
      featured_image: featuredImage,
      published: published || false,
      published_at: published ? (post.published_at || new Date()) : null,
    });

    // 返回更新后的文章
    const updatedPost = await Post.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }]
    });

    return NextResponse.json(updatedPost);

  } catch (error) {
    console.error('更新文章失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * 文章删除API - 删除指定文章
 * 
 * 路径参数：
 * - id: 文章ID
 * 
 * 响应：成功消息
 * 
 * 注意：删除操作不可逆，前端应该提供确认对话框
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const post = await Post.findByPk(id);
    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    await post.destroy();

    return NextResponse.json({ message: '文章删除成功' });

  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}