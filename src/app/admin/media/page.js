"use client";
import { apiFetch } from "@/lib/api";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";

/**
 * 媒体库管理组件
 * 提供图片上传、预览、链接复制等功能
 */
export default function MediaLibrary() {
  // 上传状态管理
  const [uploading, setUploading] = useState(false);
  // 已上传文件列表
  const [uploadedFiles, setUploadedFiles] = useState([]);

  /**
   * 处理文件上传
   * @param {Event} e - 文件输入事件
   */
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      // 并行上传多个文件
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiFetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          return {
            id: Date.now() + Math.random(), // 临时ID，避免重复
            fileName: result.fileName,
            url: result.url,
            originalName: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date(),
          };
        }
        return null;
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean);
      // 新上传的文件显示在列表顶部
      setUploadedFiles(prev => [...successfulUploads, ...prev]);

      // 清空文件输入，允许重复选择相同文件
      e.target.value = '';

      if (successfulUploads.length > 0) {
        toast.success(`成功上传 ${successfulUploads.length} 个文件`);
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      toast.error('文件上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  /**
   * 复制图片URL到剪贴板
   * @param {string} url - 要复制的图片URL
   */
  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('URL已复制到剪贴板');
    }).catch(() => {
      toast.error('复制失败，请重试');
    });
  };

  /**
   * 格式化文件大小显示
   * @param {number} bytes - 文件字节数
   * @returns {string} 格式化后的文件大小
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">媒体库</h1>
          <p className="text-muted-foreground">管理博客图片和媒体文件</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>上传文件</CardTitle>
          <CardDescription>
            支持 JPEG、PNG、GIF、WebP 格式，单个文件最大 5MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="file-upload"
              />
              <Label
                htmlFor="file-upload"
                className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  uploading 
                    ? 'border-muted-foreground/25 cursor-not-allowed' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
              >
                <div className="text-center">
                  {uploading ? (
                    <>
                      <svg className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <p className="text-sm text-muted-foreground">上传中...</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-8 h-8 mx-auto mb-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="text-sm text-muted-foreground">点击选择文件或拖拽文件到此处</p>
                      <p className="text-xs text-muted-foreground mt-1">支持多文件上传</p>
                    </>
                  )}
                </div>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>已上传文件</CardTitle>
            <CardDescription>
              共 {uploadedFiles.length} 个文件
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="border rounded-lg p-2 space-y-1.5">
                  {/* Image Preview */}
                  <div className="aspect-square bg-muted rounded-md overflow-hidden">
                    <img
                      src={file.url}
                      alt={file.originalName}
                      className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                      onClick={() => window.open(file.url, '_blank')}
                    />
                  </div>
                  
                  {/* File Info */}
                  <div className="space-y-1.5">
                    <div>
                      <p className="text-xs font-medium truncate" title={file.originalName}>
                        {file.originalName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    {/* Actions */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(file.url)}
                      className="w-full text-xs h-7"
                    >
                      复制链接
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">在文章中使用图片:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. 上传图片后，复制图片URL</p>
              <p>2. 在Markdown编辑器中使用: <code className="bg-secondary px-1 py-0.5 rounded">![描述](图片URL)</code></p>
              <p>3. 或者在编辑文章时设置为特色图片</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">支持的格式:</h4>
            <div className="flex flex-wrap gap-2">
              {['JPEG', 'PNG', 'GIF', 'WebP'].map((format) => (
                <span key={format} className="bg-secondary px-2 py-1 rounded text-sm">
                  {format}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">文件限制:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 单个文件最大 5MB</li>
              <li>• 支持多文件同时上传</li>
              <li>• 文件名会自动生成UUID避免冲突</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}