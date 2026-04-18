import React from 'react'

export function SkeletonTable({ rows = 4, cols = 5 }) {
  return (
    <div className="sa-skeleton-table">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="sa-skeleton-table-row">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="sa-skeleton sa-skeleton-line" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonRows({ rows = 3 }) {
  return (
    <div className="sa-skeleton-row">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`sa-skeleton sa-skeleton-line ${i % 3 === 2 ? 'short' : i % 3 === 1 ? 'med' : ''}`} />
      ))}
    </div>
  )
}

export function SkeletonStats({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="sa-skeleton-stat">
          <div className="sa-skeleton sa-skeleton-stat-icon" />
          <div className="sa-skeleton-stat-body">
            <div className="sa-skeleton" />
            <div className="sa-skeleton" />
          </div>
        </div>
      ))}
    </>
  )
}
