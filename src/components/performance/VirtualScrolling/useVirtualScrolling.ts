// src/components/performance/VirtualScrolling/useVirtualScrolling.ts
/**
 * Virtual Scrolling Hook
 * Core logic for virtual scrolling implementation
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

export interface VirtualScrollingOptions {
  itemCount: number;
  getItemHeight: (index: number) => number;
  containerHeight: number;
  overscan?: number;
  estimatedItemHeight?: number;
  scrollToAlignment?: 'auto' | 'start' | 'center' | 'end';
}

export interface VirtualScrollingReturn {
  scrollTop: number;
  visibleStart: number;
  visibleEnd: number;
  totalHeight: number;
  offsetY: number;
  scrollToIndex: (index: number, alignment?: 'auto' | 'start' | 'center' | 'end') => void;
  scrollToTop: () => void;
  handleScroll: (scrollTop: number) => void;
}

export const useVirtualScrolling = ({
  itemCount,
  getItemHeight,
  containerHeight,
  overscan = 5,
  estimatedItemHeight = 50,
  scrollToAlignment = 'auto'
}: VirtualScrollingOptions): VirtualScrollingReturn => {
  const [scrollTop, setScrollTop] = useState(0);
  const itemHeightCache = useRef<Map<number, number>>(new Map());
  const totalHeightCache = useRef<number>(0);
  const offsetCache = useRef<Map<number, number>>(new Map());

  // Calculate item heights and cache them
  const getItemHeightCached = useCallback((index: number): number => {
    if (itemHeightCache.current.has(index)) {
      return itemHeightCache.current.get(index)!;
    }
    
    const height = getItemHeight(index);
    itemHeightCache.current.set(index, height);
    return height;
  }, [getItemHeight]);

  // Calculate cumulative offsets and cache them
  const getItemOffset = useCallback((index: number): number => {
    if (index <= 0) return 0;
    
    if (offsetCache.current.has(index)) {
      return offsetCache.current.get(index)!;
    }

    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getItemHeightCached(i);
    }
    
    offsetCache.current.set(index, offset);
    return offset;
  }, [getItemHeightCached]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (totalHeightCache.current > 0 && itemHeightCache.current.size === itemCount) {
      return totalHeightCache.current;
    }

    let height = 0;
    for (let i = 0; i < itemCount; i++) {
      height += getItemHeightCached(i);
    }
    
    totalHeightCache.current = height;
    return height;
  }, [itemCount, getItemHeightCached]);

  // Binary search to find start index
  const findStartIndex = useCallback((scrollTop: number): number => {
    let low = 0;
    let high = itemCount - 1;
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const offset = getItemOffset(mid);
      
      if (offset === scrollTop) {
        return mid;
      } else if (offset < scrollTop) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    
    return Math.max(0, high);
  }, [itemCount, getItemOffset]);

  // Find visible range
  const getVisibleRange = useCallback((scrollTop: number) => {
    const start = findStartIndex(scrollTop);
    let end = start;
    let accumulatedHeight = getItemOffset(start);
    
    // Find end index
    while (end < itemCount && accumulatedHeight < scrollTop + containerHeight) {
      accumulatedHeight += getItemHeightCached(end);
      end++;
    }
    
    return {
      start: Math.max(0, start - overscan),
      end: Math.min(itemCount - 1, end + overscan)
    };
  }, [
    findStartIndex,
    getItemOffset,
    getItemHeightCached,
    itemCount,
    containerHeight,
    overscan
  ]);

  // Current visible range
  const { start: visibleStart, end: visibleEnd } = useMemo(() => {
    return getVisibleRange(scrollTop);
  }, [scrollTop, getVisibleRange]);

  // Calculate offset for visible items
  const offsetY = useMemo(() => {
    return getItemOffset(visibleStart);
  }, [visibleStart, getItemOffset]);

  // Scroll to specific index
  const scrollToIndex = useCallback((
    index: number, 
    alignment: 'auto' | 'start' | 'center' | 'end' = scrollToAlignment
  ) => {
    if (index < 0 || index >= itemCount) return;

    const itemOffset = getItemOffset(index);
    const itemHeight = getItemHeightCached(index);
    
    let scrollTo = itemOffset;

    switch (alignment) {
      case 'start':
        scrollTo = itemOffset;
        break;
      case 'end':
        scrollTo = itemOffset + itemHeight - containerHeight;
        break;
      case 'center':
        scrollTo = itemOffset + itemHeight / 2 - containerHeight / 2;
        break;
      case 'auto':
        const currentViewportStart = scrollTop;
        const currentViewportEnd = scrollTop + containerHeight;
        
        if (itemOffset < currentViewportStart) {
          scrollTo = itemOffset;
        } else if (itemOffset + itemHeight > currentViewportEnd) {
          scrollTo = itemOffset + itemHeight - containerHeight;
        } else {
          return; // Item is already visible
        }
        break;
    }

    setScrollTop(Math.max(0, Math.min(scrollTo, totalHeight - containerHeight)));
  }, [
    itemCount,
    getItemOffset,
    getItemHeightCached,
    containerHeight,
    scrollTop,
    totalHeight,
    scrollToAlignment
  ]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    setScrollTop(0);
  }, []);

  // Handle scroll event
  const handleScroll = useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop);
  }, []);

  // Clear caches when item count changes
  useEffect(() => {
    itemHeightCache.current.clear();
    offsetCache.current.clear();
    totalHeightCache.current = 0;
  }, [itemCount]);

  return {
    scrollTop,
    visibleStart,
    visibleEnd,
    totalHeight,
    offsetY,
    scrollToIndex,
    scrollToTop,
    handleScroll
  };
};

/**
 * Hook for dynamic item heights
 */
export const useDynamicVirtualScrolling = (
  items: any[],
  estimatedItemHeight: number = 50,
  containerHeight: number,
  overscan: number = 5
) => {
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());
  const measuredHeights = useRef<Map<number, number>>(new Map());

  const getItemHeight = useCallback((index: number): number => {
    return measuredHeights.current.get(index) || estimatedItemHeight;
  }, [estimatedItemHeight]);

  const setItemHeight = useCallback((index: number, height: number) => {
    measuredHeights.current.set(index, height);
    setItemHeights(new Map(measuredHeights.current));
  }, []);

  const virtualScrolling = useVirtualScrolling({
    itemCount: items.length,
    getItemHeight,
    containerHeight,
    overscan,
    estimatedItemHeight
  });

  return {
    ...virtualScrolling,
    setItemHeight,
    itemHeights: measuredHeights.current
  };
};

/**
 * Hook for virtual scrolling with smooth scrolling
 */
export const useSmoothVirtualScrolling = (
  options: VirtualScrollingOptions
) => {
  const virtualScrolling = useVirtualScrolling(options);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const smoothScrollToIndex = useCallback((
    index: number,
    alignment?: 'auto' | 'start' | 'center' | 'end',
    duration: number = 300
  ) => {
    const startScrollTop = virtualScrolling.scrollTop;
    const itemOffset = virtualScrolling.offsetY;
    
    let targetScrollTop = itemOffset;
    
    // Calculate target based on alignment (similar to scrollToIndex logic)
    // ... alignment logic here ...

    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentScrollTop = startScrollTop + (targetScrollTop - startScrollTop) * eased;
      virtualScrolling.handleScroll(currentScrollTop);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [virtualScrolling]);

  const handleSmoothScroll = useCallback((scrollTop: number) => {
    setIsScrolling(true);
    virtualScrolling.handleScroll(scrollTop);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [virtualScrolling]);

  return {
    ...virtualScrolling,
    handleScroll: handleSmoothScroll,
    smoothScrollToIndex,
    isScrolling
  };
};

/**
 * Hook for virtual scrolling with infinite loading
 */
export const useInfiniteVirtualScrolling = (
  items: any[],
  loadMore: () => Promise<void>,
  options: Omit<VirtualScrollingOptions, 'itemCount'>
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const virtualScrolling = useVirtualScrolling({
    ...options,
    itemCount: items.length
  });

  const handleScroll = useCallback(async (scrollTop: number) => {
    virtualScrolling.handleScroll(scrollTop);
    
    // Check if we're near the end
    const threshold = 0.8;
    const isNearEnd = (scrollTop + options.containerHeight) >= (virtualScrolling.totalHeight * threshold);
    
    if (isNearEnd && !isLoading && hasMore) {
      setIsLoading(true);
      try {
        await loadMore();
      } catch (error) {
        console.error('Failed to load more items:', error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    }
  }, [virtualScrolling, options.containerHeight, loadMore, isLoading, hasMore]);

  return {
    ...virtualScrolling,
    handleScroll,
    isLoading,
    hasMore,
    setHasMore
  };
};