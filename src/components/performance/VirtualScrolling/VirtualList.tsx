// src/components/performance/VirtualScrolling/VirtualList.tsx
/**
 * Virtual Scrolling List Component
 * Optimized for rendering large datasets with minimal DOM nodes
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useVirtualScrolling } from './useVirtualScrolling';

export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number, item: T) => number);
  containerHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  onScroll?: (scrollTop: number, scrollDirection: 'up' | 'down') => void;
  overscan?: number;
  className?: string;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  estimatedItemHeight?: number;
  maintainScrollPosition?: boolean;
}

export const VirtualList = <T extends any>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  onScroll,
  overscan = 5,
  className = '',
  loadingComponent,
  emptyComponent,
  onEndReached,
  endReachedThreshold = 0.8,
  estimatedItemHeight = 50,
  maintainScrollPosition = false
}: VirtualListProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getItemHeight = useCallback((index: number): number => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index, items[index]);
    }
    return itemHeight;
  }, [itemHeight, items]);

  const {
    scrollTop,
    visibleStart,
    visibleEnd,
    totalHeight,
    offsetY,
    scrollToIndex,
    scrollToTop,
    handleScroll
  } = useVirtualScrolling({
    itemCount: items.length,
    getItemHeight,
    containerHeight,
    overscan,
    estimatedItemHeight
  });

  // Handle scroll events
  const onScrollInternal = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    handleScroll(scrollTop);

    // Determine scroll direction
    const scrollDirection = scrollTop > (target as any).previousScrollTop ? 'down' : 'up';
    (target as any).previousScrollTop = scrollTop;

    onScroll?.(scrollTop, scrollDirection);

    // Handle end reached
    if (onEndReached && scrollTop + clientHeight >= scrollHeight * endReachedThreshold) {
      if (!isLoading) {
        setIsLoading(true);
        onEndReached();
        // Reset loading state after a delay
        setTimeout(() => setIsLoading(false), 1000);
      }
    }
  }, [handleScroll, onScroll, onEndReached, endReachedThreshold, isLoading]);

  // Render visible items
  const visibleItems = useMemo(() => {
    const items_to_render = [];
    let currentOffset = offsetY;

    for (let i = visibleStart; i <= visibleEnd; i++) {
      if (i >= 0 && i < items.length) {
        const height = getItemHeight(i);
        const style: React.CSSProperties = {
          position: 'absolute',
          top: currentOffset,
          left: 0,
          right: 0,
          height: height,
          willChange: 'transform'
        };

        items_to_render.push(
          <div key={i} style={style}>
            {renderItem(items[i], i, style)}
          </div>
        );

        currentOffset += height;
      }
    }

    return items_to_render;
  }, [visibleStart, visibleEnd, items, offsetY, getItemHeight, renderItem]);

  // Empty state
  if (items.length === 0 && emptyComponent) {
    return (
      <div className={`virtual-list-empty ${className}`} style={{ height: containerHeight }}>
        {emptyComponent}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`virtual-list relative overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={onScrollInternal}
    >
      {/* Total height container */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items */}
        {visibleItems}
        
        {/* Loading indicator */}
        {isLoading && loadingComponent && (
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center">
            {loadingComponent}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Virtual Grid Component for 2D virtualization
 */
export interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  gap?: number;
  className?: string;
}

export const VirtualGrid = <T extends any>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  gap = 0,
  className = ''
}: VirtualGridProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const itemsPerRow = Math.floor(containerWidth / (itemWidth + gap));
  const totalRows = Math.ceil(items.length / itemsPerRow);
  const totalHeight = totalRows * (itemHeight + gap);

  const visibleRowStart = Math.floor(scrollTop / (itemHeight + gap));
  const visibleRowEnd = Math.min(
    visibleRowStart + Math.ceil(containerHeight / (itemHeight + gap)) + 1,
    totalRows
  );

  const visibleItems = useMemo(() => {
    const visibleItems = [];

    for (let row = visibleRowStart; row < visibleRowEnd; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const index = row * itemsPerRow + col;
        if (index >= items.length) break;

        const x = col * (itemWidth + gap);
        const y = row * (itemHeight + gap);

        const style: React.CSSProperties = {
          position: 'absolute',
          left: x,
          top: y,
          width: itemWidth,
          height: itemHeight,
          willChange: 'transform'
        };

        visibleItems.push(
          <div key={index} style={style}>
            {renderItem(items[index], index, style)}
          </div>
        );
      }
    }

    return visibleItems;
  }, [visibleRowStart, visibleRowEnd, items, itemsPerRow, itemWidth, itemHeight, gap, renderItem]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
    setScrollLeft(target.scrollLeft);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`virtual-grid relative overflow-auto ${className}`}
      style={{ width: containerWidth, height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
};

/**
 * Virtual Table Component for large datasets
 */
export interface VirtualTableColumn<T> {
  key: keyof T;
  title: string;
  width: number;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  fixed?: 'left' | 'right';
}

export interface VirtualTableProps<T> {
  data: T[];
  columns: VirtualTableColumn<T>[];
  rowHeight: number;
  containerHeight: number;
  containerWidth: number;
  onRowClick?: (item: T, index: number) => void;
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((item: T, index: number) => string);
}

export const VirtualTable = <T extends Record<string, any>>({
  data,
  columns,
  rowHeight,
  containerHeight,
  containerWidth,
  onRowClick,
  className = '',
  headerClassName = '',
  rowClassName = ''
}: VirtualTableProps<T>) => {
  const renderRow = useCallback((item: T, index: number, style: React.CSSProperties) => {
    const rowClass = typeof rowClassName === 'function' ? rowClassName(item, index) : rowClassName;
    
    return (
      <div
        className={`virtual-table-row flex border-b hover:bg-gray-50 cursor-pointer ${rowClass}`}
        onClick={() => onRowClick?.(item, index)}
        style={{ ...style, display: 'flex' }}
      >
        {columns.map((column, colIndex) => {
          const value = item[column.key];
          const content = column.render ? column.render(value, item, index) : value;
          
          return (
            <div
              key={colIndex}
              className="virtual-table-cell flex-shrink-0 px-4 py-2 text-sm border-r"
              style={{ width: column.width }}
            >
              {content}
            </div>
          );
        })}
      </div>
    );
  }, [columns, onRowClick, rowClassName]);

  const headerHeight = 40;
  const bodyHeight = containerHeight - headerHeight;

  return (
    <div className={`virtual-table ${className}`} style={{ width: containerWidth, height: containerHeight }}>
      {/* Table Header */}
      <div
        className={`virtual-table-header flex bg-gray-100 border-b ${headerClassName}`}
        style={{ height: headerHeight }}
      >
        {columns.map((column, index) => (
          <div
            key={index}
            className="virtual-table-header-cell flex-shrink-0 px-4 py-2 font-medium text-sm border-r"
            style={{ width: column.width }}
          >
            {column.title}
          </div>
        ))}
      </div>

      {/* Table Body */}
      <VirtualList
        items={data}
        itemHeight={rowHeight}
        containerHeight={bodyHeight}
        renderItem={renderRow}
        className="virtual-table-body"
      />
    </div>
  );
};

/**
 * Performance monitoring for virtual scrolling
 */
export const useVirtualScrollingPerformance = (listName: string) => {
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCountRef.current++;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    // Log performance metrics
    if (renderCountRef.current % 10 === 0) {
      console.log(`[Virtual Scrolling] ${listName} - Renders: ${renderCountRef.current}, Last render time: ${timeSinceLastRender.toFixed(2)}ms`);
    }
  });

  return {
    renderCount: renderCountRef.current,
    resetMetrics: () => {
      renderCountRef.current = 0;
      lastRenderTime.current = performance.now();
    }
  };
};