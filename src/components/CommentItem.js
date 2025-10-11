'use client';

import { useState } from 'react';
import CommentForm from './CommentForm';

/**
 * 单条评论显示组件
 * @param {Object} props
 * @param {Object} props.comment - 评论数据
 * @param {number} props.postId - 文章ID
 * @param {Function} props.onReplySuccess - 回复成功回调
 * @param {number} props.depth - 嵌套深度，用于缩进显示
 * @param {string} props.parentAuthor - 父评论作者名
 */
export default function CommentItem({ comment, postId, onReplySuccess, depth = 0, parentAuthor = null }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showNestedReplyForms, setShowNestedReplyForms] = useState({});

  const handleReplyClick = () => {
    setShowReplyForm(true);
  };

  const handleReplySuccess = (newComment) => {
    setShowReplyForm(false);
    if (onReplySuccess) {
      onReplySuccess(newComment);
    }
  };

  const handleCancelReply = () => {
    setShowReplyForm(false);
  };

  const handleNestedReplyClick = (replyId) => {
    setShowNestedReplyForms(prev => ({
      ...prev,
      [replyId]: true
    }));
  };

  const handleNestedReplyCancel = (replyId) => {
    setShowNestedReplyForms(prev => ({
      ...prev,
      [replyId]: false
    }));
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

      const now = new Date();
      const diff = now - date;

      // 1分钟内
      if (diff < 60000 && diff >= 0) {
        return '刚刚';
      }

      // 1小时内
      if (diff < 3600000 && diff >= 0) {
        return `${Math.floor(diff / 60000)}分钟前`;
      }

      // 1天内
      if (diff < 86400000 && diff >= 0) {
        return `${Math.floor(diff / 3600000)}小时前`;
      }

      // 超过1天，显示具体日期
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

  // 判断是否为回复评论（depth > 0）
  const isReply = depth > 0;

  // 根据深度决定左右布局：偶数深度在左侧，奇数深度在右侧
  const isLeftSide = depth % 2 === 0;

  return (
    <div className="mb-4">
      {/* 主评论样式 */}
      {!isReply && (
        <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
          {/* 评论头部 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="font-medium text-foreground">
                  {comment.author_name}
                </span>
                {comment.is_author && (
                  <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
                    作者
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {formatTime(comment.created_at)}
              </span>
            </div>
          </div>

          {/* 评论内容 */}
          <div className="text-foreground mb-3 whitespace-pre-wrap">
            {comment.content}
          </div>

          {/* 评论操作 */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleReplyClick}
              className="px-3 py-1 text-sm border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              回复
            </button>
          </div>

          {/* 回复表单 */}
          {showReplyForm && (
            <div className="mt-4">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                replyTo={comment.author_name}
                onSuccess={handleReplySuccess}
                onCancel={handleCancelReply}
              />
            </div>
          )}

          {/* 显示回复 - 所有回复放在同一个框内 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 border-t border-border pt-4">
              {comment.replies.map((reply, index) => (
                <div key={reply.id}>
                  {/* 回复之间的横线分隔 */}
                  {index > 0 && <div className="border-t border-border/50 my-3"></div>}

                  {/* 回复内容 */}
                  <div className="bg-muted rounded-lg p-3">
                    {/* 回复头部 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-foreground text-sm">
                            {reply.author_name}
                          </span>
                          {reply.is_author && (
                            <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                              作者
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(reply.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* 回复内容 - 显示回复给谁 */}
                    <div className="text-xs text-muted-foreground mb-1">
                      回复给 <span className="font-medium">{comment.author_name}</span>
                    </div>

                    {/* 回复内容 */}
                    <div className="text-foreground text-sm mb-2 whitespace-pre-wrap">
                      {reply.content}
                    </div>

                    {/* 回复操作 */}
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleNestedReplyClick(reply.id)}
                        className="px-2 py-1 text-xs border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        回复
                      </button>
                    </div>

                    {/* 回复表单 */}
                    {showNestedReplyForms[reply.id] && (
                      <div className="mt-3">
                        <CommentForm
                          postId={postId}
                          parentId={reply.id}
                          replyTo={reply.author_name}
                          onSuccess={handleReplySuccess}
                          onCancel={() => handleNestedReplyCancel(reply.id)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 回复评论样式 - 用于嵌套回复 */}
      {isReply && (
        <div className="ml-8">
          <div className="bg-muted rounded-lg p-3">
            {/* 回复头部 */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground text-sm">
                    {comment.author_name}
                  </span>
                  {comment.is_author && (
                    <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      作者
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTime(comment.created_at)}
                </span>
              </div>
            </div>

            {/* 回复内容 - 显示回复给谁 */}
            {parentAuthor && (
              <div className="text-xs text-muted-foreground mb-1">
                回复给 <span className="font-medium">{parentAuthor}</span>
              </div>
            )}

            {/* 回复内容 */}
            <div className="text-foreground text-sm mb-2 whitespace-pre-wrap">
              {comment.content}
            </div>

            {/* 回复操作 */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleReplyClick}
                className="px-2 py-1 text-xs border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                回复
              </button>
            </div>

            {/* 回复表单 */}
            {showReplyForm && (
              <div className="mt-3">
                <CommentForm
                  postId={postId}
                  parentId={comment.id}
                  replyTo={comment.author_name}
                  onSuccess={handleReplySuccess}
                  onCancel={handleCancelReply}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 显示嵌套回复 - 用于更深层次的回复 */}
      {comment.replies && comment.replies.length > 0 && isReply && (
        <div className="mt-2 ml-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onReplySuccess={onReplySuccess}
              depth={depth + 1}
              parentAuthor={comment.author_name}
            />
          ))}
        </div>
      )}
    </div>
  );
}