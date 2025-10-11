'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';

/**
 * 评论表单组件
 * @param {Object} props
 * @param {number} props.postId - 文章ID
 * @param {number|null} props.parentId - 父评论ID，null表示顶级评论
 * @param {string|null} props.replyTo - 回复对象名称
 * @param {Function} props.onSuccess - 评论成功回调
 * @param {Function} props.onCancel - 取消回复回调（仅回复时）
 */
export default function CommentForm({
  postId,
  parentId = null,
  replyTo = null,
  onSuccess,
  onCancel
}) {
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误信息
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 验证表单
    if (!formData.author_name.trim()) {
      setError('请输入昵称');
      return;
    }
    if (!formData.content.trim()) {
      setError('请输入评论内容');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 获取浏览器指纹
      const { getCachedFingerprint } = await import('@/lib/fingerprint');
      const fingerprint = await getCachedFingerprint();

      if (!fingerprint) {
        setError('无法生成浏览器指纹，请刷新页面重试');
        setIsSubmitting(false);
        return;
      }

      const response = await apiFetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          parent_id: parentId,
          author_name: formData.author_name.trim(),
          author_email: formData.author_email.trim() || null,
          content: formData.content.trim(),
          fingerprint,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 清空表单
        setFormData({
          author_name: '',
          author_email: '',
          content: '',
        });

        // 调用成功回调
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        setError(result.error || '评论发布失败');
      }
    } catch (err) {
      console.error('评论提交失败:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      {replyTo && (
        <div className="mb-4 text-sm text-muted-foreground">
          回复给 <span className="font-medium">{replyTo}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="author_name" className="block text-sm font-medium text-foreground mb-1">
              昵称 *
            </label>
            <input
              type="text"
              id="author_name"
              name="author_name"
              value={formData.author_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:border-primary focus:border-2 focus:outline-none bg-background text-foreground"
              placeholder="请输入您的昵称"
              maxLength={100}
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label htmlFor="author_email" className="block text-sm font-medium text-foreground mb-1">
              邮箱
            </label>
            <input
              type="email"
              id="author_email"
              name="author_email"
              value={formData.author_email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:border-primary focus:border-2 focus:outline-none bg-background text-foreground"
              placeholder="请输入您的邮箱（可选）"
              maxLength={255}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-foreground mb-1">
            评论内容 *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-md focus:border-primary focus:border-2 focus:outline-none resize-none bg-background text-foreground"
            placeholder="请输入您的评论内容..."
            required
          />
        </div>

        {error && (
          <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="hidden md:block text-sm text-muted-foreground">
            您的评论将使用浏览器指纹匿名识别
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm text-muted-foreground border border-border rounded-md hover:bg-muted hover:text-foreground transition-colors"
                disabled={isSubmitting}
              >
                取消
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 text-sm border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '发布中...' : '发布评论'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}