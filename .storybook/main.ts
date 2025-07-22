// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../src/**/*.story.@(js|jsx|ts|tsx)',
    '../docs/**/*.stories.@(js|jsx|ts|tsx|mdx)'
  ],
  
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-backgrounds',
    '@storybook/addon-measure',
    '@storybook/addon-outline',
    '@storybook/addon-a11y',
    '@storybook/addon-storysource',
    'storybook-dark-mode'
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {}
  },

  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    }
  },

  async viteFinal(config, { configType }) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
          '@/components': path.resolve(__dirname, '../src/components'),
          '@/utils': path.resolve(__dirname, '../src/utils'),
          '@/hooks': path.resolve(__dirname, '../src/hooks'),
          '@/types': path.resolve(__dirname, '../src/types'),
          '@/stores': path.resolve(__dirname, '../src/stores'),
          '@/services': path.resolve(__dirname, '../src/services')
        }
      },
      define: {
        global: 'globalThis'
      },
      optimizeDeps: {
        include: ['@storybook/blocks']
      }
    });
  },

  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation'
  },

  features: {
    experimentalRSC: false,
    buildStoriesJson: true
  },

  staticDirs: ['../public'],

  core: {
    disableTelemetry: true
  }
};

export default config;