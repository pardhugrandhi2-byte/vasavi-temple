import React from 'react'

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse flex flex-col gap-4">
          <div className="h-48 bg-gray-200 rounded-xl w-full"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-150 rounded w-full"></div>
          <div className="h-4 bg-gray-150 rounded w-5/6"></div>
          <div className="h-10 bg-gray-200 rounded-xl w-1/3 mt-2"></div>
        </div>
      ))}
    </div>
  )
}

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse flex flex-col gap-4">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50">
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  )
}

export default CardSkeleton
