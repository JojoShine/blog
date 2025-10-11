import { NextResponse } from 'next/server';
import { Comment } from '@/models';

/**
 * 删除评论
 * DELETE /api/comments/[id]
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: '缺少评论ID' },
        { status: 400 }
      );
    }

    // 查找评论
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return NextResponse.json(
        { error: '评论不存在' },
        { status: 404 }
      );
    }

    // 删除评论（级联删除所有回复）
    await comment.destroy();

    return NextResponse.json({
      success: true,
      message: '评论删除成功',
    });

  } catch (error) {
    console.error('删除评论失败:', error);
    return NextResponse.json(
      { error: '删除评论失败' },
      { status: 500 }
    );
  }
}