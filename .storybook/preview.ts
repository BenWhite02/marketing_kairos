// .storybook/preview.ts
import type { Preview } from '@storybook/react';
import { themes } from '@storybook/theming';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      },
      expanded: true,
      hideNoControlsWarning: true
    },
    docs: {
      theme: themes.light,
      source: {
        state: 'open'
      }
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff'
        },
        {
          name: 'dark',
          value: '#1f2937'
        },
        {
          name: 'kairos-primary',
          value: '#3b82f6'
        },
        {
          name: 'kairos-secondary',
          value: '#f8fafc'
        }
      ]
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px'
          }
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px'
          }
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1200px',
            height: '800px'
          }
        },
        large: {
          name: 'Large Desktop',
          styles: {
            width: '1920px',
            height: '1080px'
          }
        }
      }
    },
    options: {
      storySort: {
        order: [
          'Documentation',
          ['Introduction', 'Getting Started', 'Design System', 'Accessibility'],
          'Design System',
          ['Colors', 'Typography', 'Spacing', 'Icons'],
          'Components',
          ['UI', 'Business', 'Features', 'Layout'],
          'Pages',
          'Examples'
        ]
      }
    },
    a11y: {
      element: '#root',
      config: {
        rules: [
          {
            id: 'autocomplete-valid',
            enabled: false
          },
          {
            id: 'landmark-one-main',
            enabled: false
          }
        ]
      },
      options: {
        checks: { 'color-contrast': { options: { noScroll: true } } },
        restoreScroll: true
      }
    }
  },

  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light' },
          { value: 'dark', icon: 'circle', title: 'Dark' }
        ],
        dynamicTitle: true
      }
    }
  },

  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';
      
      return (
        <div 
          className={`kairos-storybook ${theme === 'dark' ? 'dark' : ''}`}
          data-theme={theme}
          style={{
            minHeight: '100vh',
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#f9fafb' : '#111827',
            padding: '1rem'
          }}
        >
          <Story />
        </div>
      );
    }
  ],

  tags: ['autodocs']
};

export default preview;