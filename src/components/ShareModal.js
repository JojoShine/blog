'use client';

import { useState } from 'react';
import Image from 'next/image';
import weiboIcon from '../assets/images/weibo.png';

export default function ShareModal({ post, onClose }) {
  const [copied, setCopied] = useState(false);

  // 构建完整的文章 URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const postUrl = `${baseUrl}/${post.slug}`;


  const handleWeiboShare = () => {
    // 微博分享
    const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(post.title)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    // Twitter 分享
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // 降级方案：使用老式复制方法
      const textArea = document.createElement('textarea');
      textArea.value = postUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">分享文章</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="关闭"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium">
              {copied ? '已复制' : '复制链接'}
            </span>
          </button>

          <button
            onClick={handleWeiboShare}
            className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <Image
                src={weiboIcon}
                alt="微博"
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <span className="text-sm font-medium">微博</span>
          </button>

          <button
            onClick={handleTwitterShare}
            className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </div>
            <span className="text-sm font-medium">Twitter</span>
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            分享文章《{post.title}》
          </p>
        </div>
      </div>
    </div>
  );
}