/**
 * API 工具函数
 * 处理生产环境的 basePath 前缀
 */

/**
 * 获取 API 路径
 * 在生产环境自动添加 /blog 前缀
 * @param {string} path - API 路径，如 '/api/posts'
 * @returns {string} 完整的 API 路径
 */
export function getApiPath(path) {
  // 生产环境需要添加 basePath 前缀
  const basePath = process.env.NODE_ENV === 'production' ? '/blog' : '';

  // 确保 path 以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${basePath}${normalizedPath}`;
}

/**
 * API fetch 封装
 * 自动处理 basePath
 * @param {string} path - API 路径
 * @param {RequestInit} options - fetch 选项
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  const fullPath = getApiPath(path);
  return fetch(fullPath, options);
}

/**
 * 服务端组件 API fetch
 * 专门用于服务端组件，使用相对路径
 * @param {string} path - API 路径
 * @param {RequestInit} options - fetch 选项
 * @returns {Promise<Response>}
 */
export async function serverApiFetch(path, options = {}) {
  // 服务端组件使用相对路径，Next.js会自动处理basePath
  return fetch(path, options);
}