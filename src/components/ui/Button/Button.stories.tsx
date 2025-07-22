// src/components/ui/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { within, userEvent, expect } from '@storybook/test';
import { Button } from './Button';
import { PlusIcon, ArrowRightIcon, TrashIcon } from '@heroicons/react/24/outline';

const meta: Meta<typeof Button> = {
  title: 'Components/UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Button component is a foundational UI element that provides consistent styling and behavior across the Kairos application. It supports multiple variants, sizes, and states while maintaining accessibility standards.

## Features
- **8 visual variants** for different use cases
- **4 size options** with responsive support
- **Loading states** with animated indicators
- **Icon support** with automatic spacing
- **Full accessibility** with ARIA attributes
- **Keyboard navigation** support
        `
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'danger', 'success', 'warning', 'ghost', 'link'],
      description: 'Visual style variant of the button'
    },
    size: {
      control: 'select', 
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the button'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled'
    },
    loading: {
      control: 'boolean',
      description: 'Whether the button is in loading state'
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button takes full width of container'
    },
    children: {
      control: 'text',
      description: 'Button content (text or elements)'
    },
    onClick: {
      action: 'clicked',
      description: 'Function called when button is clicked'
    }
  },
  args: {
    onClick: action('button-click')
  }
};

export default meta;
type Story = StoryObj<typeof Button>;

// Basic Variants
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
};

export const Secondary: Story = {
  args: {
    variant: 'secondary', 
    children: 'Secondary Button'
  }
};

export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
    children: 'Tertiary Button'
  }
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete Item'
  }
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Save Changes'
  }
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Proceed with Caution'
  }
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button'
  }
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button'
  }
};

// Sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <Button variant="primary" size="sm">Small</Button>
      <Button variant="primary" size="md">Medium</Button>
      <Button variant="primary" size="lg">Large</Button>
      <Button variant="primary" size="xl">Extra Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons come in four sizes: sm, md (default), lg, and xl.'
      }
    }
  }
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <Button variant="primary" leftIcon={<PlusIcon className="w-4 h-4" />}>
        Add Item
      </Button>
      <Button variant="secondary" rightIcon={<ArrowRightIcon className="w-4 h-4" />}>
        Continue
      </Button>
      <Button variant="danger" leftIcon={<TrashIcon className="w-4 h-4" />}>
        Delete
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons can include icons on the left or right side with automatic spacing.'
      }
    }
  }
};

// Loading States
export const LoadingStates: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <Button variant="primary" loading>
        Loading...
      </Button>
      <Button variant="secondary" loading>
        Processing
      </Button>
      <Button variant="primary" loading leftIcon={<PlusIcon className="w-4 h-4" />}>
        Creating...
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading state shows an animated spinner and disables interaction.'
      }
    }
  }
};

// Disabled States
export const DisabledStates: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <Button variant="primary" disabled>
        Disabled Primary
      </Button>
      <Button variant="secondary" disabled>
        Disabled Secondary
      </Button>
      <Button variant="danger" disabled>
        Disabled Danger
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled buttons are not interactive and have reduced visual prominence.'
      }
    }
  }
};

// Full Width
export const FullWidth: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <Button variant="primary" fullWidth>
        Full Width Primary
      </Button>
      <Button variant="secondary" fullWidth>
        Full Width Secondary  
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full width buttons expand to fill their container.'
      }
    }
  }
};

// Interactive Test
export const InteractiveTest: Story = {
  args: {
    variant: 'primary',
    children: 'Click me!'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Test button click
    await userEvent.click(button);
    
    // Test keyboard interaction
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive test demonstrating click and keyboard navigation.'
      }
    }
  }
};

// Accessibility Test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-4">
      <Button 
        variant="primary"
        aria-label="Add new campaign"
        leftIcon={<PlusIcon className="w-4 h-4" />}
      >
        Add Campaign
      </Button>
      <Button 
        variant="danger"
        aria-describedby="delete-help"
        leftIcon={<TrashIcon className="w-4 h-4" />}
      >
        Delete Item
      </Button>
      <div id="delete-help" className="text-sm text-gray-600">
        This action cannot be undone
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with proper ARIA labels and descriptions for screen readers.'
      }
    }
  }
};

// Real-world Examples
export const CampaignActions: Story = {
  render: () => (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Campaign Actions</h3>
      <div className="flex items-center gap-3">
        <Button 
          variant="primary" 
          leftIcon={<PlusIcon className="w-4 h-4" />}
        >
          Create Campaign
        </Button>
        <Button variant="secondary">
          Import Data
        </Button>
        <Button variant="tertiary">
          Export Results
        </Button>
        <Button 
          variant="danger" 
          leftIcon={<TrashIcon className="w-4 h-4" />}
        >
          Delete Selected
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example showing campaign management actions.'
      }
    }
  }
};

export const FormActions: Story = {
  render: () => (
    <div className="p-6 bg-white border rounded-lg max-w-md">
      <h3 className="text-lg font-semibold mb-4">Moment Configuration</h3>
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Configure your marketing moment settings and save when ready.
        </div>
        <div className="flex justify-between items-center">
          <Button variant="ghost">
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary">
              Save Draft
            </Button>
            <Button 
              variant="primary"
              rightIcon={<ArrowRightIcon className="w-4 h-4" />}
            >
              Deploy Live
            </Button>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Form action pattern with cancel, save, and submit actions.'
      }
    }
  }
};