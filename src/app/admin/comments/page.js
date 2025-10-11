'use client';
import { apiFetch } from '@/lib/api';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * 评论管理页面
 * 显示所有评论，支持查看、回复、删除功能
 */
export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComment, setSelectedComment] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // 存储待删除评论的 ID

  // 加载所有评论
  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/admin/comments');
      const result = await response.json();

      if (result.success) {
        setComments(result.data || []);
      } else {
        toast.error(result.error || '加载评论失败');
      }
    } catch (error) {
      console.error('加载评论失败:', error);
      toast.error('加载评论失败');
    } finally {
      setLoading(false);
    }
  };

  // 显示删除确认对话框
  const showDeleteConfirm = (commentId) => {
    setDeleteConfirm(commentId);
  };

  // 取消删除
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // 确认删除评论
  const confirmDeleteComment = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await apiFetch(`/api/comments/${deleteConfirm}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result && result.success) {
        toast.success('评论删除成功');
        loadComments(); // 重新加载评论列表
      } else {
        toast.error(result?.error || '删除失败');
      }
    } catch (error) {
      console.error('删除评论失败:', error);
      toast.error('删除评论失败');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // 回复评论
  const handleReply = async (comment) => {
    if (!replyContent.trim()) {
      toast.error('请输入回复内容');
      return;
    }

    try {
      setReplying(true);
      // 对于管理员回复，使用固定的指纹标识
      const adminFingerprint = 'admin_reply_' + Date.now();

      const response = await apiFetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: comment.post_id,
          parent_id: comment.id,
          author_name: '管理员',
          content: replyContent.trim(),
          fingerprint: adminFingerprint,
          is_author: true, // 标记为作者回复
        }),
      });

      const result = await response.json();

      if (result && result.success) {
        toast.success('回复成功');
        setReplyContent('');
        setSelectedComment(null);
        loadComments(); // 重新加载评论列表
      } else {
        toast.error(result?.error || '回复失败');
      }
    } catch (error) {
      console.error('回复评论失败:', error);
      toast.error('回复评论失败');
    } finally {
      setReplying(false);
    }
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    if (!timestamp) return '未知时间';

    try {
      const date = new Date(timestamp);

      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return '无效日期';
      }

      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('日期格式化失败:', error);
      return '日期格式错误';
    }
  };

  // 组件挂载时加载评论
  useEffect(() => {
    loadComments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载评论中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">评论管理</h1>
          <p className="text-muted-foreground mt-1">
            管理博客文章的评论和回复
          </p>
        </div>
      </div>

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无评论</h3>
          <p className="text-gray-500">还没有用户发表评论</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
              {/* 评论头部 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-900">
                      {comment.author_name}
                    </span>
                    {comment.is_author && (
                      <span className="px-2 py-1 text-xs bg-primary text-white rounded-full">
                        作者
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatTime(comment.created_at)}
                  </span>
                </div>
              </div>

              {/* 评论内容 */}
              <div className="text-gray-800 mb-3 whitespace-pre-wrap">
                {comment.content}
              </div>

              {/* 评论信息 */}
              <div className="text-sm text-gray-500 mb-3">
                <span>文章: {comment.post?.title || '未知文章'}</span>
                {comment.parent_id && (
                  <span className="ml-4">回复: #{comment.parent_id}</span>
                )}
              </div>

              {/* 操作按钮 - 只对顶级评论显示回复按钮 */}
              <div className="flex gap-2">
                {/* 只有没有父评论的顶级评论才显示回复按钮 */}
                {!comment.parent_id && (
                  <button
                    onClick={() => setSelectedComment(selectedComment?.id === comment.id ? null : comment)}
                    className="px-3 py-1 text-sm text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
                  >
                    {selectedComment?.id === comment.id ? '取消回复' : '回复'}
                  </button>
                )}
                <button
                  onClick={() => showDeleteConfirm(comment.id)}
                  className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition-colors"
                >
                  删除
                </button>
              </div>

              {/* 回复表单 */}
              {selectedComment?.id === comment.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">回复评论</h4>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-primary focus:border-2 focus:outline-none resize-none"
                    placeholder="请输入回复内容..."
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setSelectedComment(null)}
                      className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                      disabled={replying}
                    >
                      取消
                    </button>
                    <button
                      onClick={() => handleReply(comment)}
                      className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
                      disabled={replying || !replyContent.trim()}
                    >
                      {replying ? '回复中...' : '发布回复'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 删除确认对话框 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">确认删除</h3>
            <p className="text-gray-600 mb-6">确定要删除这条评论吗？此操作不可撤销。</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteComment}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}