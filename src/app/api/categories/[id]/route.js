import { NextResponse } from 'next/server';
import { Category, Post } from '../../../../models/index.js';

// 获取单个分类
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const category = await Category.findByPk(id, {
      include: [{
        model: Post,
        as: 'posts',
        attributes: ['id', 'title', 'slug', 'excerpt', 'published', 'published_at'],
        where: { published: true },
        required: false,
        order: [['published_at', 'DESC']],
      }]
    });

    if (!category) {
      return NextResponse.json(
        { error: '分类不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);

  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 更新分类
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const category = await Category.findByPk(id);
    if (!category) {
      return NextResponse.json(
        { error: '分类不存在' },
        { status: 404 }
      );
    }

    // 基本验证
    if (!name) {
      return NextResponse.json(
        { error: '分类名称不能为空' },
        { status: 400 }
      );
    }

    // 生成新的slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // 检查slug是否与其他分类冲突
    const existingCategory = await Category.findOne({
      where: { slug, id: { [require('sequelize').Op.ne]: id } }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: '分类名称已存在' },
        { status: 400 }
      );
    }

    // 更新分类
    await category.update({
      name,
      slug,
      description,
    });

    return NextResponse.json(category);

  } catch (error) {
    console.error('更新分类失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 删除分类
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const category = await Category.findByPk(id);
    if (!category) {
      return NextResponse.json(
        { error: '分类不存在' },
        { status: 404 }
      );
    }

    // 检查是否有关联的文章
    const postCount = await Post.count({
      where: { category_id: id }
    });

    if (postCount > 0) {
      return NextResponse.json(
        { error: '无法删除包含文章的分类' },
        { status: 400 }
      );
    }

    await category.destroy();

    return NextResponse.json({ message: '分类删除成功' });

  } catch (error) {
    console.error('删除分类失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}