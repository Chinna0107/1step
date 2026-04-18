import './Skeleton.css'

export function SkeletonLine({ width = '100%', height = 14, radius = 6, style = {} }) {
  return <div className="sk-line" style={{ width, height, borderRadius: radius, ...style }} />
}

export function SkeletonStat() {
  return (
    <div className="sk-stat">
      <SkeletonLine width={28} height={28} radius={8} style={{ marginBottom: 10 }} />
      <SkeletonLine width="60%" height={10} style={{ marginBottom: 6 }} />
      <SkeletonLine width="40%" height={22} />
    </div>
  )
}

export function SkeletonCard({ rows = 4 }) {
  return (
    <div className="sk-card">
      <div className="sk-card-header">
        <SkeletonLine width="35%" height={14} />
      </div>
      <div className="sk-card-body">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="sk-row">
            <SkeletonLine width="30%" height={12} />
            <SkeletonLine width="45%" height={12} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="sk-table-wrap">
      <div className="sk-table-header">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} width="80%" height={10} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="sk-table-row">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonLine key={j} width={j === 0 ? '40%' : '70%'} height={12} />
          ))}
        </div>
      ))}
    </div>
  )
}
