'use client';
import { apiFetch } from '@/lib/api';

import { useState, useEffect, useCallback } from 'react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

/**
 * 评论列表容器组件
 * @param {Object} props
 * @param {number} props.postId - 文章ID
 */
export default function CommentList({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 加载评论
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/api/comments?post_id=${postId}`);
      const result = await response.json();

      if (result.success) {
        setComments(result.data || []);
      } else {
        setError(result.error || '加载评论失败');
      }
    } catch (err) {
      console.error('加载评论失败:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // 组件挂载时加载评论
  useEffect(() => {
    loadComments();
  }, [postId, loadComments]);

  // 处理新评论成功
  const handleCommentSuccess = (newComment) => {
    // 重新加载评论列表
    loadComments();
  };

  // 处理回复成功
  const handleReplySuccess = () => {
    // 重新加载评论列表
    loadComments();
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        加载评论中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 评论数量 */}
      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-semibold text-foreground">
          评论 ({comments.length})
        </h3>
      </div>

      {/* 评论表单 */}
      <CommentForm
        postId={postId}
        onSuccess={handleCommentSuccess}
      />

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border border-border rounded-lg">
          暂无评论，快来发表第一条评论吧！
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onReplySuccess={handleReplySuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
}