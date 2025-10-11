import { NextResponse } from 'next/server';
import { Comment, Post } from '@/models';

/**
 * 获取所有评论（管理端使用）
 * GET /api/admin/comments
 */
export async function GET() {
  try {
    // 获取所有评论，包含关联的文章信息
    const comments = await Comment.findAll({
      include: [
        {
          model: Post,
          as: 'post',
          attributes: ['id', 'title', 'slug'],
        },
      ],
      order: [['created_at', 'DESC']],
      raw: true,
      nest: true,
    });

    // 确保日期字段正确映射
    const processedComments = comments.map(comment => ({
      ...comment,
      // Sequelize 使用 timestamps: true 会创建 createdAt 和 updatedAt 字段
      // 但 raw: true 时会保持原字段名，这里确保使用正确的字段名
      created_at: comment.created_at || comment.createdAt,
      updated_at: comment.updated_at || comment.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: processedComments,
      total: processedComments.length,
    });

  } catch (error) {
    console.error('获取评论列表失败:', error);
    return NextResponse.json(
      { error: '获取评论失败' },
      { status: 500 }
    );
  }
}