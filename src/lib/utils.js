import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * 类名合并工具函数
 * 结合 clsx 和 tailwind-merge，用于合并和处理 Tailwind CSS 类名
 * 
 * @param {...any} inputs - 要合并的类名参数（字符串、对象、数组等）
 * @returns {string} 合并后的类名字符串
 * 
 * 使用示例：
 * cn('px-2 py-1', 'bg-red-500') // 'px-2 py-1 bg-red-500'
 * cn('px-2', { 'bg-red-500': true, 'text-white': false }) // 'px-2 bg-red-500'
 * cn('px-2 py-1', 'px-4') // 'py-1 px-4' (tailwind-merge 会处理冲突的类名)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
