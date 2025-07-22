// src/components/business/atoms/AtomCard/AtomCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { within, userEvent, expect } from '@storybook/test';
import { AtomCard } from './AtomCard';

const meta: Meta<typeof AtomCard> = {
  title: 'Components/Business/AtomCard',
  component: AtomCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The AtomCard component displays eligibility atoms in a professional card format, providing essential information and actions for marketing decisioning workflows.

## Features
- **Atom type indicators** with color-coded categories
- **Performance metrics** including usage count and accuracy
- **Interactive actions** for editing, duplicating, and deleting
- **Selection support** for bulk operations
- **Accessibility compliance** with ARIA labels and keyboard navigation
- **Responsive design** adapting to different screen sizes

## Atom Types
- **Demographic**: Age, income, location-based targeting
- **Behavioral**: Purchase history, engagement patterns
- **Transactional**: Order value, frequency, recency
- **Contextual**: Time, device, channel preferences
        `
      }
    }
  },
  argTypes: {
    atom: {
      description: 'Atom data object containing all atom information'
    },
    variant: {
      control: 'select',
      options: ['default', 'compact', 'detailed'],
      description: 'Visual variant of the card'
    },
    selected: {
      control: 'boolean',
      description: 'Whether the atom card is selected'
    },
    disabled: {
      control: 'boolean', 
      description: 'Whether the atom card is disabled'
    },
    onSelect: {
      action: 'atom-selected',
      description: 'Function called when atom is selected'
    },
    onEdit: {
      action: 'atom-edited',
      description: 'Function called when edit action is triggered'
    },
    onDuplicate: {
      action: 'atom-duplicated',
      description: 'Function called when duplicate action is triggered'
    },
    onDelete: {
      action: 'atom-deleted',
      description: 'Function called when delete action is triggered'
    }
  }
};

export default meta;
type Story = StoryObj<typeof AtomCard>;

// Mock atom data
const mockAtoms = {
  demographic: {
    id: 'age-25-34',
    name: 'Age 25-34',
    type: 'demographic' as const,
    category: 'Customer Segmentation',
    description: 'Customers aged between 25 and 34 years old',
    conditions: [
      { field: 'age', operator: 'between', values: [25, 34] }
    ],
    usageCount: 127,
    accuracy: 0.94,
    lastUsed: '2024-01-15T10:30:00Z',
    tags: ['age', 'demographics', 'targeting'],
    performance: {
      impressions: 45200,
      conversions: 2890,
      conversionRate: 0.064
    }
  },
  behavioral: {
    id: 'high-engagement',
    name: 'High Engagement Users',
    type: 'behavioral' as const,
    category: 'Engagement Scoring',
    description: 'Users with high engagement scores (80+) over the last 30 days',
    conditions: [
      { field: 'engagement_score', operator: 'gte', values: [80] },
      { field: 'last_activity', operator: 'within_days', values: [30] }
    ],
    usageCount: 89,
    accuracy: 0.87,
    lastUsed: '2024-01-16T14:20:00Z',
    tags: ['engagement', 'activity', 'scoring'],
    performance: {
      impressions: 32100,
      conversions: 3210,
      conversionRate: 0.10
    }
  },
  transactional: {
    id: 'premium-spenders',
    name: 'Premium Spenders',
    type: 'transactional' as const,
    category: 'Purchase Behavior',
    description: 'Customers with lifetime value > $1000 and recent high-value purchases',
    conditions: [
      { field: 'lifetime_value', operator: 'gt', values: [1000] },
      { field: 'last_order_value', operator: 'gt', values: [200] }
    ],
    usageCount: 203,
    accuracy: 0.96,
    lastUsed: '2024-01-16T09:15:00Z',
    tags: ['purchase', 'value', 'premium'],
    performance: {
      impressions: 18900,
      conversions: 1890,
      conversionRate: 0.10
    }
  },
  contextual: {
    id: 'evening-mobile',
    name: 'Evening Mobile Users',
    type: 'contextual' as const,
    category: 'Timing & Device',
    description: 'Users active on mobile devices during evening hours (6-10 PM)',
    conditions: [
      { field: 'device_type', operator: 'equals', values: ['mobile'] },
      { field: 'time_of_day', operator: 'between', values: ['18:00', '22:00'] }
    ],
    usageCount: 156,
    accuracy: 0.91,
    lastUsed: '2024-01-16T19:45:00Z',
    tags: ['timing', 'device', 'mobile'],
    performance: {
      impressions: 67800,
      conversions: 4070,
      conversionRate: 0.06
    }
  }
};

// Basic variants
export const Default: Story = {
  args: {
    atom: mockAtoms.demographic,
    onSelect: action('atom-selected'),
    onEdit: action('atom-edited'),
    onDuplicate: action('atom-duplicated'),
    onDelete: action('atom-deleted')
  }
};

export const Compact: Story = {
  args: {
    atom: mockAtoms.behavioral,
    variant: 'compact',
    onSelect: action('atom-selected'),
    onEdit: action('atom-edited'),
    onDuplicate: action('atom-duplicated'),
    onDelete: action('atom-deleted')
  }
};

export const Detailed: Story = {
  args: {
    atom: mockAtoms.transactional,
    variant: 'detailed',
    onSelect: action('atom-selected'),
    onEdit: action('atom-edited'),
    onDuplicate: action('atom-duplicated'),
    onDelete: action('atom-deleted')
  }
};

// Atom Types
export const AtomTypes: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      <AtomCard 
        atom={mockAtoms.demographic}
        onEdit={action('edit-demographic')}
        onDuplicate={action('duplicate-demographic')}
        onDelete={action('delete-demographic')}
      />
      <AtomCard 
        atom={mockAtoms.behavioral}
        onEdit={action('edit-behavioral')}
        onDuplicate={action('duplicate-behavioral')}
        onDelete={action('delete-behavioral')}
      />
      <AtomCard 
        atom={mockAtoms.transactional}
        onEdit={action('edit-transactional')}
        onDuplicate={action('duplicate-transactional')}
        onDelete={action('delete-transactional')}
      />
      <AtomCard 
        atom={mockAtoms.contextual}
        onEdit={action('edit-contextual')}
        onDuplicate={action('duplicate-contextual')}
        onDelete={action('delete-contextual')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different atom types with their characteristic color coding and metrics.'
      }
    }
  }
};

// States
export const States: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Default State</h4>
        <AtomCard 
          atom={mockAtoms.demographic}
          onEdit={action('edit-default')}
        />
      </div>
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Selected State</h4>
        <AtomCard 
          atom={mockAtoms.behavioral}
          selected={true}
          onSelect={action('select-atom')}
          onEdit={action('edit-selected')}
        />
      </div>
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Disabled State</h4>
        <AtomCard 
          atom={mockAtoms.transactional}
          disabled={true}
          onEdit={action('edit-disabled')}
        />
      </div>
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Loading State</h4>
        <AtomCard 
          atom={mockAtoms.contextual}
          loading={true}
          onEdit={action('edit-loading')}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different states including default, selected, disabled, and loading.'
      }
    }
  }
};

// Performance Metrics
export const PerformanceMetrics: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <AtomCard 
        atom={{
          ...mockAtoms.demographic,
          accuracy: 0.98,
          usageCount: 342,
          performance: {
            impressions: 125000,
            conversions: 8750,
            conversionRate: 0.07
          }
        }}
        variant="detailed"
        onEdit={action('edit-high-performance')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Atom card showing high-performance metrics and detailed analytics.'
      }
    }
  }
};

// Interactive Selection
export const InteractiveSelection: Story = {
  render: () => {
    const [selectedAtoms, setSelectedAtoms] = React.useState<string[]>([]);
    
    const handleSelect = (atomId: string) => {
      setSelectedAtoms(prev => 
        prev.includes(atomId) 
          ? prev.filter(id => id !== atomId)
          : [...prev, atomId]
      );
    };

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Selected: {selectedAtoms.length} atoms
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(mockAtoms).map(atom => (
            <AtomCard
              key={atom.id}
              atom={atom}
              selected={selectedAtoms.includes(atom.id)}
              onSelect={() => handleSelect(atom.id)}
              onEdit={action(`edit-${atom.id}`)}
              onDuplicate={action(`duplicate-${atom.id}`)}
              onDelete={action(`delete-${atom.id}`)}
            />
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive selection example with multiple atom cards.'
      }
    }
  }
};

// Accessibility Test
export const AccessibilityTest: Story = {
  args: {
    atom: mockAtoms.demographic,
    onSelect: action('atom-selected'),
    onEdit: action('atom-edited'),
    onDuplicate: action('atom-duplicated'),
    onDelete: action('atom-deleted')
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test keyboard navigation
    await userEvent.tab();
    await userEvent.keyboard('{Enter}'); // Select atom
    
    // Test action menu
    const moreButton = canvas.getByLabelText(/more actions/i);
    await userEvent.click(moreButton);
    
    // Test edit action
    const editButton = canvas.getByText(/edit/i);
    await userEvent.click(editButton);
  },
  parameters: {
    docs: {
      description: {
        story: 'Accessibility test demonstrating keyboard navigation and screen reader support.'
      }
    }
  }
};

// Real-world Usage
export const AtomLibraryView: Story = {
  render: () => (
    <div className="p-6 bg-gray-50 rounded-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Eligibility Atoms Library</h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage your targeting atoms for precise customer segmentation
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(mockAtoms).map(atom => (
          <AtomCard
            key={atom.id}
            atom={atom}
            onEdit={action(`edit-${atom.id}`)}
            onDuplicate={action(`duplicate-${atom.id}`)}
            onDelete={action(`delete-${atom.id}`)}
          />
        ))}
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Real-world usage example showing an atom library interface.'
      }
    }
  }
};