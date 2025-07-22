// src/stores/enterprise/brandStore.ts

import { create } from 'zustand';
import { BrandConfiguration } from '../../types/enterprise';

interface BrandState {
  // State
  currentBrand: BrandConfiguration | null;
  brands: BrandConfiguration[];
  previewMode: boolean;
  previewBrand: Partial<BrandConfiguration> | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  
  // Actions
  loadBrands: () => Promise<void>;
  loadBrand: (id: string) => Promise<void>;
  createBrand: (brand: Omit<BrandConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<string>;
  updateBrand: (id: string, updates: Partial<BrandConfiguration>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  duplicateBrand: (id: string, name: string) => Promise<string>;
  
  // Preview Actions
  enablePreview: (brand: Partial<BrandConfiguration>) => void;
  disablePreview: () => void;
  updatePreview: (updates: Partial<BrandConfiguration>) => void;
  
  // Validation
  validateBrand: (brand: Partial<BrandConfiguration>) => { isValid: boolean; errors: string[]; };
  
  // Theme Generation
  generateTheme: (brand: BrandConfiguration) => Record<string, string>;
  applyBrand: (brand: BrandConfiguration) => void;
  resetBrand: () => void;
  
  // Utility Actions
  setCurrentBrand: (brand: BrandConfiguration | null) => void;
  clearError: () => void;
  setDirty: (dirty: boolean) => void;
}

// Mock API functions
const mockApi = {
  async getBrands(): Promise<BrandConfiguration[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        id: 'brand-1',
        organizationId: 'org-1',
        name: 'Default Brand',
        description: 'Default Kairos branding configuration',
        status: 'active',
        logo: {
          primary: 'https://via.placeholder.com/200x60/6366f1/ffffff?text=KAIROS',
          favicon: 'https://via.placeholder.com/32x32/6366f1/ffffff?text=K',
          width: 200,
          height: 60,
        },
        colors: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
          background: '#ffffff',
          surface: '#f8fafc',
          text: {
            primary: '#1e293b',
            secondary: '#64748b',
            disabled: '#cbd5e1',
          },
          status: {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
          },
        },
        typography: {
          fontFamily: {
            primary: 'Inter, system-ui, sans-serif',
            secondary: 'Inter, system-ui, sans-serif',
            monospace: 'JetBrains Mono, monospace',
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
          },
          fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
          },
        },
        layout: {
          borderRadius: {
            none: '0',
            sm: '0.125rem',
            md: '0.375rem',
            lg: '0.5rem',
            xl: '0.75rem',
            full: '9999px',
          },
          spacing: {
            xs: '0.5rem',
            sm: '0.75rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem',
            '2xl': '3rem',
          },
          shadows: {
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
          },
        },
        domain: {
          sslEnabled: true,
          status: 'active',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
        version: 1,
      },
      {
        id: 'brand-2',
        organizationId: 'org-1',
        name: 'Dark Mode Brand',
        description: 'Dark theme variant for professional users',
        status: 'draft',
        logo: {
          primary: 'https://via.placeholder.com/200x60/ffffff/1e293b?text=KAIROS',
          favicon: 'https://via.placeholder.com/32x32/ffffff/1e293b?text=K',
          width: 200,
          height: 60,
        },
        colors: {
          primary: '#8b5cf6',
          secondary: '#6366f1',
          accent: '#06b6d4',
          background: '#0f172a',
          surface: '#1e293b',
          text: {
            primary: '#f1f5f9',
            secondary: '#cbd5e1',
            disabled: '#64748b',
          },
          status: {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
          },
        },
        typography: {
          fontFamily: {
            primary: 'Inter, system-ui, sans-serif',
            secondary: 'Inter, system-ui, sans-serif',
            monospace: 'JetBrains Mono, monospace',
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
          },
          fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
          },
        },
        layout: {
          borderRadius: {
            none: '0',
            sm: '0.125rem',
            md: '0.375rem',
            lg: '0.5rem',
            xl: '0.75rem',
            full: '9999px',
          },
          spacing: {
            xs: '0.5rem',
            sm: '0.75rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem',
            '2xl': '3rem',
          },
          shadows: {
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
            xl: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
          },
        },
        domain: {
          sslEnabled: true,
          status: 'pending',
        },
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z',
        createdBy: 'user-1',
        version: 1,
      },
    ];
  },
  
  async getBrand(id: string): Promise<BrandConfiguration> {
    const brands = await this.getBrands();
    const brand = brands.find(b => b.id === id);
    if (!brand) throw new Error('Brand not found');
    return brand;
  },
  
  async createBrand(brand: Omit<BrandConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `brand-${Date.now()}`;
  },
  
  async updateBrand(id: string, updates: Partial<BrandConfiguration>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
  },
  
  async deleteBrand(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
  },
};

export const useBrandStore = create<BrandState>((set, get) => ({
  // Initial State
  currentBrand: null,
  brands: [],
  previewMode: false,
  previewBrand: null,
  isLoading: false,
  error: null,
  isDirty: false,
  
  // Load Actions
  loadBrands: async () => {
    set({ isLoading: true, error: null });
    try {
      const brands = await mockApi.getBrands();
      set({ brands, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load brands', isLoading: false });
    }
  },
  
  loadBrand: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const brand = await mockApi.getBrand(id);
      set({ currentBrand: brand, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load brand', isLoading: false });
    }
  },
  
  // CRUD Actions
  createBrand: async (brandData) => {
    set({ isLoading: true, error: null });
    try {
      const id = await mockApi.createBrand(brandData);
      const newBrand: BrandConfiguration = {
        ...brandData,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };
      
      set(state => ({
        brands: [...state.brands, newBrand],
        currentBrand: newBrand,
        isLoading: false,
        isDirty: false,
      }));
      
      return id;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create brand', isLoading: false });
      throw error;
    }
  },
  
  updateBrand: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await mockApi.updateBrand(id, updates);
      
      set(state => ({
        brands: state.brands.map(brand => 
          brand.id === id 
            ? { ...brand, ...updates, updatedAt: new Date().toISOString(), version: brand.version + 1 }
            : brand
        ),
        currentBrand: state.currentBrand?.id === id 
          ? { ...state.currentBrand, ...updates, updatedAt: new Date().toISOString(), version: state.currentBrand.version + 1 }
          : state.currentBrand,
        isLoading: false,
        isDirty: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update brand', isLoading: false });
    }
  },
  
  deleteBrand: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await mockApi.deleteBrand(id);
      
      set(state => ({
        brands: state.brands.filter(brand => brand.id !== id),
        currentBrand: state.currentBrand?.id === id ? null : state.currentBrand,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete brand', isLoading: false });
    }
  },
  
  duplicateBrand: async (id, name) => {
    const brand = get().brands.find(b => b.id === id);
    if (!brand) throw new Error('Brand not found');
    
    const { id: _, createdAt, updatedAt, version, ...brandData } = brand;
    return get().createBrand({
      ...brandData,
      name,
      description: `Copy of ${brand.name}`,
      status: 'draft',
    });
  },
  
  // Preview Actions
  enablePreview: (brand) => {
    set({ previewMode: true, previewBrand: brand });
    get().applyBrand(brand as BrandConfiguration);
  },
  
  disablePreview: () => {
    set({ previewMode: false, previewBrand: null });
    const currentBrand = get().currentBrand;
    if (currentBrand) {
      get().applyBrand(currentBrand);
    } else {
      get().resetBrand();
    }
  },
  
  updatePreview: (updates) => {
    const currentPreview = get().previewBrand;
    const updatedPreview = { ...currentPreview, ...updates };
    set({ previewBrand: updatedPreview, isDirty: true });
    get().applyBrand(updatedPreview as BrandConfiguration);
  },
  
  // Validation
  validateBrand: (brand) => {
    const errors: string[] = [];
    
    if (!brand.name?.trim()) {
      errors.push('Brand name is required');
    }
    
    if (!brand.colors?.primary) {
      errors.push('Primary color is required');
    }
    
    if (!brand.logo?.primary) {
      errors.push('Primary logo is required');
    }
    
    if (brand.domain?.customDomain && !/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,})$/.test(brand.domain.customDomain)) {
      errors.push('Invalid custom domain format');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
  
  // Theme Generation
  generateTheme: (brand) => {
    const cssVariables: Record<string, string> = {};
    
    // Colors
    Object.entries(brand.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        cssVariables[`--color-${key}`] = value;
      } else if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          cssVariables[`--color-${key}-${subKey}`] = subValue;
        });
      }
    });
    
    // Typography
    Object.entries(brand.typography.fontFamily).forEach(([key, value]) => {
      cssVariables[`--font-${key}`] = value;
    });
    
    Object.entries(brand.typography.fontSize).forEach(([key, value]) => {
      cssVariables[`--text-${key}`] = value;
    });
    
    Object.entries(brand.typography.fontWeight).forEach(([key, value]) => {
      cssVariables[`--font-weight-${key}`] = value.toString();
    });
    
    // Layout
    Object.entries(brand.layout.borderRadius).forEach(([key, value]) => {
      cssVariables[`--radius-${key}`] = value;
    });
    
    Object.entries(brand.layout.spacing).forEach(([key, value]) => {
      cssVariables[`--spacing-${key}`] = value;
    });
    
    Object.entries(brand.layout.shadows).forEach(([key, value]) => {
      cssVariables[`--shadow-${key}`] = value;
    });
    
    return cssVariables;
  },
  
  applyBrand: (brand) => {
    const theme = get().generateTheme(brand);
    const root = document.documentElement;
    
    Object.entries(theme).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon && brand.logo?.favicon) {
      favicon.href = brand.logo.favicon;
    }
    
    // Update page title prefix
    const titleElement = document.querySelector('title');
    if (titleElement && brand.name) {
      const originalTitle = titleElement.textContent || '';
      if (!originalTitle.startsWith(brand.name)) {
        titleElement.textContent = `${brand.name} - ${originalTitle.replace(/^[^-]+-\s*/, '')}`;
      }
    }
  },
  
  resetBrand: () => {
    const root = document.documentElement;
    const theme = get().generateTheme({} as BrandConfiguration);
    
    Object.keys(theme).forEach(property => {
      root.style.removeProperty(property);
    });
  },
  
  // Utility Actions
  setCurrentBrand: (brand) => {
    set({ currentBrand: brand });
    if (brand) {
      get().applyBrand(brand);
    }
  },
  
  clearError: () => set({ error: null }),
  
  setDirty: (dirty) => set({ isDirty: dirty }),
}));