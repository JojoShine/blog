import Link from "next/link";

/**
 * 分页组件
 * 支持紧凑模式和完整模式
 *
 * @param {Object} props - 组件属性
 * @param {number} props.currentPage - 当前页码
 * @param {number} props.totalPages - 总页数
 * @param {string} props.baseUrl - 基础URL (例如: "/blog")
 * @param {Object} props.queryParams - 额外的查询参数 (例如: {categoryId: 1})
 * @param {boolean} props.compact - 是否使用紧凑模式 (默认 false)
 * @param {string} props.className - 额外的CSS类名
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  baseUrl = "",
  queryParams = {},
  compact = false,
  className = "",
}) {
  // 如果只有一页或没有页面，不显示分页
  if (totalPages <= 1) {
    return null;
  }

  // 构建URL查询参数
  const buildUrl = (page) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());

    // 添加额外的查询参数
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, value.toString());
      }
    });

    return `${baseUrl}?${params.toString()}`;
  };

  // 紧凑模式: 简洁的分页样式,适合右上角显示
  if (compact) {
    return (
      <div className={`flex items-center space-x-2 flex-shrink-0 ${className}`}>
        {currentPage > 1 && (
          <Link
            href={buildUrl(currentPage - 1)}
            className="px-3 py-1.5 border rounded-lg hover:bg-secondary transition-colors text-sm"
          >
            上一页
          </Link>
        )}

        <span className="px-3 py-1.5 text-sm whitespace-nowrap">
          {currentPage} / {totalPages}
        </span>

        {currentPage < totalPages && (
          <Link
            href={buildUrl(currentPage + 1)}
            className="px-3 py-1.5 border rounded-lg hover:bg-secondary transition-colors text-sm"
          >
            下一页
          </Link>
        )}
      </div>
    );
  }

  // 完整模式: 显示详细的分页信息
  return (
    <div className={`flex justify-center items-center space-x-2 ${className}`}>
      {currentPage > 1 && (
        <Link
          href={buildUrl(currentPage - 1)}
          className="px-4 py-2 border rounded-lg hover:bg-secondary transition-colors"
        >
          上一页
        </Link>
      )}

      <span className="px-4 py-2">
        第 {currentPage} 页，共 {totalPages} 页
      </span>

      {currentPage < totalPages && (
        <Link
          href={buildUrl(currentPage + 1)}
          className="px-4 py-2 border rounded-lg hover:bg-secondary transition-colors"
        >
          下一页
        </Link>
      )}
    </div>
  );
}
