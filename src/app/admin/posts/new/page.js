"use client";
import { apiFetch } from "@/lib/api";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";

export default function NewPost() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const contentTextareaRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    categoryId: 'null',
    featuredImage: '',
    published: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiFetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await apiFetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          published: publish,
          categoryId: formData.categoryId || null,
        }),
      });

      if (response.ok) {
        const post = await response.json();
        router.push('/admin/posts');
      } else {
        const error = await response.json();
        alert(error.error || '保存失败');
      }
    } catch (error) {
      console.error('保存文章失败:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 上传图片并插入Markdown语法到内容区域
  const uploadAndInsertImage = async (file) => {
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await apiFetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const result = await response.json();
        const markdown = `<img src="${result.url}" alt="${file.name}" width="600" />`;

        // 获取当前光标位置并插入HTML
        if (contentTextareaRef.current) {
          const textarea = contentTextareaRef.current;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = formData.content;
          const newText = text.substring(0, start) + markdown + text.substring(end);

          setFormData(prev => ({ ...prev, content: newText }));

          // 设置光标位置到插入内容之后
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
            textarea.focus();
          }, 0);
        } else {
          // 如果没有ref，直接追加到末尾
          setFormData(prev => ({
            ...prev,
            content: prev.content + '\n' + markdown
          }));
        }
      } else {
        alert('图片上传失败');
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 处理内容粘贴事件（检测图片）
  const handleContentPaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        await uploadAndInsertImage(file);
        break; // 只处理第一张图片
      }
    }
  };

  // 处理内容图片上传（点击按钮）
  const handleContentImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadAndInsertImage(file);
      // 清空input，允许重复上传同一文件
      e.target.value = '';
    }
  };

  // 特色图片上传
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await apiFetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          featuredImage: result.url
        }));
      } else {
        alert('图片上传失败');
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('图片上传失败');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">新建文章</h1>
          <p className="text-muted-foreground">创建新的博客文章</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/admin/posts">
            <Button variant="outline">取消</Button>
          </Link>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="请输入文章标题"
                required
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">摘要</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="请输入文章摘要（可选）"
                rows={3}
              />
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">内容 *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleContentImageUpload}
                    className="hidden"
                    id="content-image-upload"
                    disabled={uploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => document.getElementById('content-image-upload').click()}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {uploading ? '上传中...' : '插入图片'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    {previewMode ? '编辑' : '预览'}
                  </Button>
                </div>
              </div>

              {previewMode ? (
                <Card className="max-h-[calc(100vh-28rem)] overflow-hidden">
                  <CardHeader>
                    <CardTitle>预览</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-y-auto max-h-[calc(100vh-32rem)]">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {formData.content || '内容为空'}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Textarea
                  ref={contentTextareaRef}
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  onPaste={handleContentPaste}
                  placeholder="请输入文章内容（支持 Markdown 语法和 HTML）&#10;提示：可直接复制粘贴图片，或点击上方【插入图片】按钮&#10;插入的图片默认宽度为 600px，可手动修改 width 属性"
                  className="font-mono h-[calc(100vh-28rem)] resize-none"
                  required
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Actions */}
            <Card>
              <CardHeader>
                <CardTitle>发布</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? '保存中...' : '保存草稿'}
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={saving}
                    variant="default"
                    className="w-full"
                  >
                    {saving ? '发布中...' : '发布文章'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>分类</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value === 'null' ? null : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">无分类</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  <Link href="/admin/categories" className="hover:underline">
                    管理分类
                  </Link>
                </p>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>特色图片</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.featuredImage && (
                  <div className="space-y-2">
                    <img
                      src={formData.featuredImage}
                      alt="特色图片"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                      className="w-full"
                    >
                      移除图片
                    </Button>
                  </div>
                )}
                
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  >
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="text-sm text-muted-foreground">点击上传图片</p>
                    </div>
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Markdown Help */}
            <Card>
              <CardHeader>
                <CardTitle>Markdown 语法</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div><code># 标题</code> - 一级标题</div>
                <div><code>## 标题</code> - 二级标题</div>
                <div><code>**文本**</code> - 粗体</div>
                <div><code>*文本*</code> - 斜体</div>
                <div><code>`代码`</code> - 行内代码</div>
                <div><code>```代码块```</code> - 代码块</div>
                <div><code>[链接](URL)</code> - 链接</div>
                <div><code>&lt;img src=&quot;URL&quot; width=&quot;600&quot; /&gt;</code> - 图片</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}