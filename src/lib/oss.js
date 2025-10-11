import OSS from 'ali-oss';

/**
 * 阿里云OSS对象存储客户端配置
 * 用于处理博客图片和媒体文件的上传、存储和删除
 *
 * 环境变量配置：
 * - OSS_REGION: OSS区域（如：oss-cn-hangzhou）
 * - OSS_ACCESS_KEY_ID: AccessKey ID
 * - OSS_ACCESS_KEY_SECRET: AccessKey Secret
 * - OSS_BUCKET: 存储桶名称
 * - OSS_PUBLIC_URL: 自定义域名或公开访问URL（可选）
 */

/**
 * 创建OSS客户端实例
 * @returns {OSS} OSS客户端
 */
function getOSSClient() {
  return new OSS({
    region: process.env.OSS_REGION || 'oss-cn-hangzhou',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
  });
}

/**
 * 上传文件到OSS
 * @param {string} fileName - 文件名（包含路径）
 * @param {Buffer} fileBuffer - 文件内容Buffer
 * @param {string} contentType - 文件MIME类型
 * @returns {Promise<Object>} 上传结果
 */
export async function uploadFile(fileName, fileBuffer, contentType) {
  try {
    const client = getOSSClient();

    // 上传文件到OSS
    const result = await client.put(fileName, fileBuffer, {
      headers: {
        'Content-Type': contentType,
      },
    });

    // 生成公开访问URL
    let publicUrl;
    if (process.env.OSS_PUBLIC_URL) {
      // 如果配置了自定义域名
      publicUrl = `${process.env.OSS_PUBLIC_URL}/${fileName}`;
    } else {
      // 使用OSS默认域名
      publicUrl = result.url;
    }

    return {
      success: true,
      fileName,
      url: publicUrl,
    };
  } catch (error) {
    console.error('OSS文件上传失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 删除OSS中的文件
 * @param {string} fileName - 要删除的文件名
 * @returns {Promise<Object>} 删除结果
 */
export async function deleteFile(fileName) {
  try {
    const client = getOSSClient();
    await client.delete(fileName);

    return { success: true };
  } catch (error) {
    console.error('OSS文件删除失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 批量删除文件
 * @param {string[]} fileNames - 要删除的文件名数组
 * @returns {Promise<Object>} 删除结果
 */
export async function deleteMultipleFiles(fileNames) {
  try {
    const client = getOSSClient();
    const result = await client.deleteMulti(fileNames);

    return {
      success: true,
      deleted: result.deleted
    };
  } catch (error) {
    console.error('OSS批量删除失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default getOSSClient;
