import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise = null;

/**
 * 获取浏览器指纹
 * 基于浏览器特征生成稳定的指纹ID，用于匿名识别评论者
 * @returns {Promise<string>} 浏览器指纹ID
 */
export async function getFingerprint() {
  try {
    if (!fpPromise) {
      fpPromise = FingerprintJS.load();
    }
    const fp = await fpPromise;
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error('获取浏览器指纹失败:', error);
    // 如果指纹获取失败，生成一个基于时间的随机ID作为备用
    return `fallback_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}

/**
 * 获取缓存的指纹（如果已存在）
 * 避免重复计算指纹，提升性能
 * @returns {Promise<string|null>} 缓存的指纹ID，如果不存在则返回null
 */
export async function getCachedFingerprint() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cached = localStorage.getItem('blog_fingerprint');
    if (cached) {
      return cached;
    }

    const fingerprint = await getFingerprint();
    localStorage.setItem('blog_fingerprint', fingerprint);
    return fingerprint;
  } catch (error) {
    console.error('获取缓存指纹失败:', error);
    // 如果缓存获取失败，直接生成一个新的指纹
    return await getFingerprint();
  }
}