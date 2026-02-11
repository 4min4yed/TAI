import React from "react";

interface SkeletonProps {
  className?: string;
  count?: number;
}

/**
 * Skeleton loading component
 */
export function Skeleton({ className = "", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
        />
      ))}
    </>
  );
}
