// src/utils/performance/cachingStrategies.ts
/**
 * Advanced Caching Strategies
 * Multi-layer caching system for optimal performance
 */

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Cache entry interface
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  priority: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  checkInterval: number;
  evictionPolicy: 'LRU' | 'LFU' | 'TTL' | 'FIFO';
  persistToStorage: boolean;
  storageKey?: string;
}

/**
 * Advanced in-memory cache implementation
 */
export class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;
  private cleanupInterval?: NodeJS.Timeout;
  private hitCount = 0;
  private missCount = 0;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      checkInterval: 60 * 1000,   // 1 minute
      evictionPolicy: 'LRU',
      persistToStorage: false,
      ...config
    };

    this.startCleanup();
    this.loadFromStorage();
  }

  /**
   * Get item from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.hitCount++;

    return entry.data;
  }

  /**
   * Set item in cache
   */
  set(key: string, data: T, ttl?: number, priority: number = 0): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: now,
      priority
    };

    // Check if we need to evict items
    if (this.cache.size >= this.config.maxSize) {
      this.evictItems();
    }

    this.cache.set(key, entry);
    this.saveToStorage();
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result) {
      this.saveToStorage();
    }
    return result;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    this.saveToStorage();
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry ? !this.isExpired(entry) : false;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitCount: number;
    missCount: number;
    hitRate: number;
    memoryUsage: number;
  } {
    const hitRate = this.hitCount + this.missCount > 0 
      ? this.hitCount / (this.hitCount + this.missCount) 
      : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values in cache
   */
  values(): T[] {
    return Array.from(this.cache.values()).map(entry => entry.data);
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evict items based on policy
   */
  private evictItems(): void {
    const entries = Array.from(this.cache.entries());

    switch (this.config.evictionPolicy) {
      case 'LRU':
        entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        break;
      case 'LFU':
        entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
        break;
      case 'TTL':
        entries.sort((a, b) => (a[1].timestamp + a[1].ttl) - (b[1].timestamp + b[1].ttl));
        break;
      case 'FIFO':
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        break;
    }

    // Remove oldest 10% of entries
    const removeCount = Math.ceil(this.cache.size * 0.1);
    for (let i = 0; i < removeCount; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
    this.saveToStorage();
  }

  /**
   * Start cleanup interval
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.checkInterval);
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    let size = 0;
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2; // UTF-16 encoding
      size += JSON.stringify(entry.data).length * 2;
      size += 64; // Estimated overhead for entry metadata
    }
    return size;
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    if (!this.config.persistToStorage || !this.config.storageKey) return;

    try {
      const data = {
        entries: Array.from(this.cache.entries()),
        stats: { hitCount: this.hitCount, missCount: this.missCount }
      };
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('[Cache] Failed to save to storage:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    if (!this.config.persistToStorage || !this.config.storageKey) return;

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data.entries);
        this.hitCount = data.stats.hitCount || 0;
        this.missCount = data.stats.missCount || 0;
        
        // Clean up expired entries
        this.cleanup();
      }
    } catch (error) {
      console.warn('[Cache] Failed to load from storage:', error);
    }
  }
}

/**
 * Query cache for API responses
 */
export class QueryCache {
  private cache: AdvancedCache<any>;
  private pendingQueries = new Map<string, Promise<any>>();

  constructor(config?: Partial<CacheConfig>) {
    this.cache = new AdvancedCache({
      maxSize: 500,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      persistToStorage: true,
      storageKey: 'kairos_query_cache',
      ...config
    });
  }

  /**
   * Fetch with caching
   */
  async fetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
    forceRefresh: boolean = false
  ): Promise<T> {
    // Return cached data if available and not forcing refresh
    if (!forceRefresh) {
      const cached = this.cache.get(key);
      if (cached) {
        return cached;
      }
    }

    // Check if query is already pending
    if (this.pendingQueries.has(key)) {
      return this.pendingQueries.get(key)!;
    }

    // Execute query
    const promise = fetcher()
      .then(data => {
        this.cache.set(key, data, ttl);
        this.pendingQueries.delete(key);
        return data;
      })
      .catch(error => {
        this.pendingQueries.delete(key);
        throw error;
      });

    this.pendingQueries.set(key, promise);
    return promise;
  }

  /**
   * Invalidate cache entries
   */
  invalidate(pattern?: string | RegExp): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const keys = this.cache.keys();
    keys.forEach(key => {
      const matches = typeof pattern === 'string' 
        ? key.includes(pattern)
        : pattern.test(key);
      
      if (matches) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Prefetch data
   */
  async prefetch<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<void> {
    if (!this.cache.has(key)) {
      try {
        await this.fetch(key, fetcher, ttl);
      } catch (error) {
        console.warn('[QueryCache] Prefetch failed:', error);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }
}

/**
 * React hook for query caching
 */
export const useQueryCache = () => {
  const queryCache = useRef<QueryCache>();

  if (!queryCache.current) {
    queryCache.current = new QueryCache();
  }

  return queryCache.current;
};

/**
 * Component state caching hook
 */
export const useStateCache = <T>(
  key: string,
  initialValue: T,
  ttl: number = 30 * 60 * 1000 // 30 minutes
) => {
  const cache = useRef<AdvancedCache<T>>();
  
  if (!cache.current) {
    cache.current = new AdvancedCache<T>({
      maxSize: 100,
      defaultTTL: ttl,
      persistToStorage: true,
      storageKey: 'kairos_state_cache'
    });
  }

  const [state, setState] = useState<T>(() => {
    const cached = cache.current!.get(key);
    return cached !== null ? cached : initialValue;
  });

  const setCachedState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prevState => {
      const newState = typeof value === 'function' 
        ? (value as (prev: T) => T)(prevState)
        : value;
      
      cache.current!.set(key, newState, ttl);
      return newState;
    });
  }, [key, ttl]);

  const clearCache = useCallback(() => {
    cache.current!.delete(key);
    setState(initialValue);
  }, [key, initialValue]);

  return [state, setCachedState, clearCache] as const;
};

/**
 * Image caching utility
 */
export class ImageCache {
  private static instance: ImageCache;
  private cache = new Map<string, HTMLImageElement>();
  private loading = new Map<string, Promise<HTMLImageElement>>();

  static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache();
    }
    return ImageCache.instance;
  }

  async loadImage(src: string): Promise<HTMLImageElement> {
    // Return cached image
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    // Return pending promise
    if (this.loading.has(src)) {
      return this.loading.get(src)!;
    }

    // Load new image
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(src, img);
        this.loading.delete(src);
        resolve(img);
      };
      img.onerror = () => {
        this.loading.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });

    this.loading.set(src, promise);
    return promise;
  }

  preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(urls.map(url => this.loadImage(url)));
  }

  clearCache(): void {
    this.cache.clear();
    this.loading.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

/**
 * Service Worker cache utility
 */
export const ServiceWorkerCache = {
  /**
   * Register service worker
   */
  async register(scriptUrl: string = '/sw.js'): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(scriptUrl);
        console.log('[ServiceWorker] Registered successfully');
        return registration;
      } catch (error) {
        console.error('[ServiceWorker] Registration failed:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Cache resources
   */
  async cacheResources(resources: string[], cacheName: string = 'kairos-cache'): Promise<void> {
    if ('caches' in window) {
      try {
        const cache = await caches.open(cacheName);
        await cache.addAll(resources);
        console.log('[ServiceWorker] Resources cached successfully');
      } catch (error) {
        console.error('[ServiceWorker] Failed to cache resources:', error);
      }
    }
  },

  /**
   * Clear cache
   */
  async clearCache(cacheName?: string): Promise<void> {
    if ('caches' in window) {
      try {
        if (cacheName) {
          await caches.delete(cacheName);
        } else {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        console.log('[ServiceWorker] Cache cleared successfully');
      } catch (error) {
        console.error('[ServiceWorker] Failed to clear cache:', error);
      }
    }
  },

  /**
   * Get cached response
   */
  async getCachedResponse(request: string | Request): Promise<Response | null> {
    if ('caches' in window) {
      try {
        return await caches.match(request);
      } catch (error) {
        console.error('[ServiceWorker] Failed to get cached response:', error);
        return null;
      }
    }
    return null;
  }
};

/**
 * Cache management utilities
 */
export const CacheManager = {
  /**
   * Global cache instances
   */
  queryCache: new QueryCache(),
  imageCache: ImageCache.getInstance(),

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.queryCache.invalidate();
    this.imageCache.clearCache();
    ServiceWorkerCache.clearCache();
    
    // Clear localStorage cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('kairos_') && key.endsWith('_cache')) {
        localStorage.removeItem(key);
      }
    });
  },

  /**
   * Get cache statistics
   */
  getStats(): {
    queryCache: any;
    imageCacheSize: number;
    localStorageUsage: number;
  } {
    let localStorageUsage = 0;
    try {
      const storage = JSON.stringify(localStorage);
      localStorageUsage = new Blob([storage]).size;
    } catch (error) {
      console.warn('[CacheManager] Failed to calculate localStorage usage');
    }

    return {
      queryCache: this.queryCache.getStats(),
      imageCacheSize: this.imageCache.getCacheSize(),
      localStorageUsage
    };
  },

  /**
   * Monitor cache performance
   */
  startMonitoring(interval: number = 60000): void {
    setInterval(() => {
      const stats = this.getStats();
      console.log('[CacheManager] Performance stats:', stats);
      
      // Trigger cleanup if memory usage is high
      if (stats.localStorageUsage > 5 * 1024 * 1024) { // 5MB
        console.warn('[CacheManager] High localStorage usage, triggering cleanup');
        this.clearAll();
      }
    }, interval);
  }
};