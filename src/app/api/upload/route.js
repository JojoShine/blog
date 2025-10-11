import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '../../../lib/oss.js';
import crypto from 'crypto';

/**
 * 文件上传API - 将图片文件上传到阿里云OSS
 *
 * 支持的文件类型：JPEG, PNG, GIF, WebP
 * 文件大小限制：5MB
 *
 * 请求格式：Multipart/Form-Data
 * - file: 要上传的图片文件
 *
 * 响应格式：
 * {
 *   success: true,
 *   fileName: string,
 *   url: string
 * }
 */
export async function POST(request) {
  try {
    // 解析上传的表单数据
    const formData = await request.formData();
    const file = formData.get('file'); // 获取文件对象

    if (!file) {
      return NextResponse.json(
        { error: '没有找到文件' },
        { status: 400 }
      );
    }

    // 验证文件类型：只允许图片格式
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型，只支持 JPEG, PNG, GIF, WebP 格式' },
        { status: 400 }
      );
    }

    // 验证文件大小：限制为5MB以下
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `文件大小不能超过${maxSize / 1024 / 1024}MB，当前文件大小: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      );
    }

    // 生成唯一文件名：使用UUID避免文件名冲突
    const fileExtension = file.name.split('.').pop(); // 获取文件扩展名
    const fileName = `${crypto.randomUUID()}.${fileExtension}`; // UUID + 原扩展名

    // 将文件转换为Buffer格式以便上传
    const bytes = await file.arrayBuffer(); // 获取文件的二进制数据
    const buffer = Buffer.from(bytes); // 转换为Node.js Buffer

    // 上传文件到阿里云OSS对象存储
    const result = await uploadFile(fileName, buffer, file.type);

    // 检查上传结果并返回相应响应
    if (result.success) {
      return NextResponse.json({
        success: true,
        fileName: result.fileName, // 生成的文件名
        url: result.url, // 可访问的文件URL
      });
    } else {
      // 上传失败，返回错误信息
      return NextResponse.json(
        { error: result.error || '文件上传失败' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('上传失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}