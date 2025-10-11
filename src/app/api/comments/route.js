import { NextResponse } from 'next/server';
import { Comment, Post } from '@/models';

/**
 * 获取指定文章的评论列表
 * GET /api/comments?post_id=123
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');

    if (!postId) {
      return NextResponse.json(
        { error: '缺少文章ID参数' },
        { status: 400 }
      );
    }

    // 验证文章是否存在
    const post = await Post.findByPk(postId);
    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    // 获取该文章的所有评论，按创建时间排序
    const comments = await Comment.findAll({
      where: { post_id: postId },
      order: [['created_at', 'ASC']],
      raw: true,
    });

    // 构建评论树形结构
    const commentTree = buildCommentTree(comments);

    return NextResponse.json({
      success: true,
      data: commentTree,
      total: comments.length,
    });

  } catch (error) {
    console.error('获取评论列表失败:', error);
    return NextResponse.json(
      { error: '获取评论失败' },
      { status: 500 }
    );
  }
}

/**
 * 创建新评论
 * POST /api/comments
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { post_id, parent_id, author_name, author_email, content, fingerprint, is_author } = body;

    // 验证必填字段
    if (!post_id || !author_name || !content || !fingerprint) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 验证文章是否存在
    const post = await Post.findByPk(post_id);
    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    // 验证父评论是否存在（如果是回复）
    if (parent_id) {
      const parentComment = await Comment.findByPk(parent_id);
      if (!parentComment) {
        return NextResponse.json(
          { error: '父评论不存在' },
          { status: 404 }
        );
      }
      // 确保父评论属于同一篇文章
      if (parentComment.post_id !== parseInt(post_id)) {
        return NextResponse.json(
          { error: '父评论不属于该文章' },
          { status: 400 }
        );
      }
    }

    // 创建评论
    const comment = await Comment.create({
      post_id: parseInt(post_id),
      parent_id: parent_id ? parseInt(parent_id) : null,
      fingerprint,
      author_name: author_name.trim(),
      author_email: author_email?.trim() || null,
      content: content.trim(),
      is_author: is_author || false, // 使用请求中的 is_author 值，默认为 false
    });

    return NextResponse.json({
      success: true,
      data: comment.toJSON(),
      message: '评论发布成功',
    });

  } catch (error) {
    console.error('创建评论失败:', error);
    return NextResponse.json(
      { error: '评论发布失败' },
      { status: 500 }
    );
  }
}

/**
 * 构建评论树形结构
 * @param {Array} comments - 评论列表
 * @returns {Array} 树形结构的评论
 */
function buildCommentTree(comments) {
  const map = {};
  const roots = [];

  // 创建映射表
  comments.forEach(comment => {
    map[comment.id] = {
      ...comment,
      replies: [],
      // Sequelize 使用 timestamps: true 会创建 createdAt 和 updatedAt 字段
      // 但 raw: true 时会保持原字段名
      created_at: comment.created_at || comment.createdAt,
      updated_at: comment.updated_at || comment.updatedAt,
    };
  });

  // 构建树形结构
  comments.forEach(comment => {
    if (comment.parent_id) {
      // 如果有父评论，添加到父评论的replies中
      if (map[comment.parent_id]) {
        map[comment.parent_id].replies.push(map[comment.id]);
      }
    } else {
      // 没有父评论，添加到根节点
      roots.push(map[comment.id]);
    }
  });

  return roots;
}