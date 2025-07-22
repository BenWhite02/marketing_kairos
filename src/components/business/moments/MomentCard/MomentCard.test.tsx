// src/components/business/moments/MomentCard/MomentCard.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MomentCard } from './MomentCard';
import { MomentCardErrorBoundary } from './MomentCardErrorBoundary';
import type { Moment } from '@/types/api/moments';

// Mock dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock UI components
jest.mock('../../../ui/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('../../../ui/Badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-variant={variant}>{children}</span>
  ),
}));

jest.mock('../../../ui/Progress', () => ({
  Progress: ({ value, variant }: any) => (
    <div data-testid="progress" data-value={value} data-variant={variant} />
  ),
}));

jest.mock('../../../ui/Tooltip', () => ({
  Tooltip: ({ children, content }: any) => (
    <div data-tooltip={content}>{children}</div>
  ),
}));

// Test data
const validMoment: Moment = {
  id: 'test-moment-1',
  name: 'Test Welcome Email',
  description: 'A test welcome email campaign',
  type: 'triggered',
  status: 'active',
  channel: 'email',
  priority: 'high',
  audienceSize: 1500,
  segmentIds: ['new-users'],
  performance: {
    sent: 1500,
    delivered: 1470,
    opened: 735,
    clicked: 147,
    converted: 44,
    deliveryRate: 98.0,
    openRate: 50.0,
    clickRate: 20.0,
    conversionRate: 30.0,
  },
  content: {
    subject: 'Welcome to our platform!',
    hasPersonalization: true,
    hasABTest: false,
    variants: 1,
  },
  tags: ['welcome', 'onboarding'],
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:22:00Z',
  createdBy: 'test@example.com',
};

const invalidMoment = {
  id: 'invalid-moment',
  name: 'Invalid Moment',
  // Missing channel property - this would cause the original error
  status: 'active',
  performance: {
    // Incomplete performance data
    sent: 100,
  },
  content: {
    hasPersonalization: false,
  },
  tags: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: 'test@example.com',
};

const malformedMoment = {
  // Completely invalid structure
  someRandomProperty: 'value',
  id: null,
  name: 123,
  channel: 'invalid-channel',
};

describe('MomentCard', () => {
  const mockHandlers = {
    onSelect: jest.fn(),
    onEdit: jest.fn(),
    onTest: jest.fn(),
    onDuplicate: jest.fn(),
    onToggleStatus: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Valid Moment Data', () => {
    it('renders moment card with valid data', () => {
      render(<MomentCard moment={validMoment} {...mockHandlers} />);

      expect(screen.getByText('Test Welcome Email')).toBeInTheDocument();
      expect(screen.getByText('A test welcome email campaign')).toBeInTheDocument();
      expect(screen.getByText('EMAIL')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('displays performance metrics correctly', () => {
      render(<MomentCard moment={validMoment} {...mockHandlers} />);

      expect(screen.getByText('98.0%')).toBeInTheDocument(); // Delivery rate
      expect(screen.getByText('50.0%')).toBeInTheDocument(); // Open rate
      expect(screen.getByText('30.0% conv. rate')).toBeInTheDocument();
    });

    it('shows tags when present', () => {
      render(<MomentCard moment={validMoment} {...mockHandlers} />);

      expect(screen.getByText('welcome')).toBeInTheDocument();
      expect(screen.getByText('onboarding')).toBeInTheDocument();
    });

    it('handles click events correctly', () => {
      render(<MomentCard moment={validMoment} {...mockHandlers} />);

      fireEvent.click(screen.getByText('Test Welcome Email'));
      expect(mockHandlers.onSelect).toHaveBeenCalledWith(validMoment);
    });

    it('handles edit button click', () => {
      render(<MomentCard moment={validMoment} {...mockHandlers} />);

      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
      expect(mockHandlers.onEdit).toHaveBeenCalledWith(validMoment);
    });
  });

  describe('Invalid Moment Data', () => {
    it('handles missing channel property gracefully', () => {
      // This should not throw an error like the original implementation
      render(<MomentCard moment={invalidMoment as any} {...mockHandlers} />);

      expect(screen.getByText('Invalid Moment')).toBeInTheDocument();
      expect(screen.getByText('EMAIL')).toBeInTheDocument(); // Default channel
    });

    it('uses default values for missing performance data', () => {
      render(<MomentCard moment={invalidMoment as any} {...mockHandlers} />);

      expect(screen.getByText('0.0%')).toBeInTheDocument(); // Default rates
    });

    it('handles completely malformed data', () => {
      render(<MomentCard moment={malformedMoment as any} {...mockHandlers} />);

      // Should show error message or use defaults
      expect(screen.getByText(/Error Loading Moment|Unknown Moment/)).toBeInTheDocument();
    });

    it('handles undefined moment gracefully', () => {
      render(<MomentCard moment={undefined as any} {...mockHandlers} />);

      expect(screen.getByText(/Error Loading Moment/)).toBeInTheDocument();
    });

    it('handles null moment gracefully', () => {
      render(<MomentCard moment={null as any} {...mockHandlers} />);

      expect(screen.getByText(/Error Loading Moment/)).toBeInTheDocument();
    });
  });

  describe('Variant Rendering', () => {
    it('renders compact variant correctly', () => {
      render(
        <MomentCard 
          moment={validMoment} 
          variant="compact" 
          {...mockHandlers} 
        />
      );

      expect(screen.getByText('Test Welcome Email')).toBeInTheDocument();
      expect(screen.getByText('EMAIL')).toBeInTheDocument();
      // Should not show detailed metrics in compact mode
      expect(screen.queryByText('98.0%')).not.toBeInTheDocument();
    });

    it('renders detailed variant correctly', () => {
      render(
        <MomentCard 
          moment={validMoment} 
          variant="detailed" 
          {...mockHandlers} 
        />
      );

      expect(screen.getByText('Test Welcome Email')).toBeInTheDocument();
      expect(screen.getByText('Delivery Rate')).toBeInTheDocument();
      expect(screen.getByText('Open Rate')).toBeInTheDocument();
      expect(screen.getByText('Personalized')).toBeInTheDocument();
    });

    it('renders default variant correctly', () => {
      render(<MomentCard moment={validMoment} {...mockHandlers} />);

      expect(screen.getByText('Test Welcome Email')).toBeInTheDocument();
      expect(screen.getByText('Delivery')).toBeInTheDocument();
      expect(screen.getByText('Open Rate')).toBeInTheDocument();
    });
  });

  describe('Selection State', () => {
    it('applies selection styling when selected', () => {
      const { container } = render(
        <MomentCard 
          moment={validMoment} 
          isSelected={true} 
          {...mockHandlers} 
        />
      );

      const cardElement = container.querySelector('.ring-2.ring-blue-500');
      expect(cardElement).toBeInTheDocument();
    });

    it('does not apply selection styling when not selected', () => {
      const { container } = render(
        <MomentCard 
          moment={validMoment} 
          isSelected={false} 
          {...mockHandlers} 
        />
      );

      const cardElement = container.querySelector('.ring-2.ring-blue-500');
      expect(cardElement).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('catches and handles errors in performance calculations', () => {
      const momentWithBadPerformance = {
        ...validMoment,
        performance: {
          sent: 'invalid' as any,
          delivered: null as any,
          opened: undefined as any,
          clicked: NaN,
          converted: Infinity,
          deliveryRate: 'bad' as any,
          openRate: -50,
          clickRate: 150,
          conversionRate: null as any,
        },
      };

      render(<MomentCard moment={momentWithBadPerformance} {...mockHandlers} />);

      // Should not crash and should show default values
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('handles missing content object gracefully', () => {
      const momentWithoutContent = {
        ...validMoment,
        content: undefined as any,
      };

      render(<MomentCard moment={momentWithoutContent} {...mockHandlers} />);

      expect(screen.getByText('Test Welcome Email')).toBeInTheDocument();
      // Should not show personalization indicators
      expect(screen.queryByText('P')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('prevents event propagation on action button clicks', () => {
      render(<MomentCard moment={validMoment} {...mockHandlers} />);

      const testButton = screen.getAllByRole('button').find(
        button => button.querySelector('svg') // Find button with icon
      );

      if (testButton) {
        fireEvent.click(testButton);
        // onSelect should not be called due to stopPropagation
        expect(mockHandlers.onSelect).not.toHaveBeenCalled();
      }
    });
  });

  describe('Date Handling', () => {
    it('handles invalid date strings gracefully', () => {
      const momentWithBadDates = {
        ...validMoment,
        createdAt: 'not-a-date',
        updatedAt: 'also-not-a-date',
        nextRun: 'invalid-date',
      };

      render(<MomentCard moment={momentWithBadDates} {...mockHandlers} />);

      expect(screen.getByText(/Invalid Date/)).toBeInTheDocument();
    });
  });
});

describe('MomentCardErrorBoundary', () => {
  const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>Normal content</div>;
  };

  it('renders children when no error occurs', () => {
    render(
      <MomentCardErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </MomentCardErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders error UI when error occurs', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MomentCardErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </MomentCardErrorBoundary>
    );

    expect(screen.getByText('Error Loading Moment Card')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('calls error handler when provided', () => {
    const errorHandler = jest.fn();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MomentCardErrorBoundary onError={errorHandler}>
        <ThrowingComponent shouldThrow={true} />
      </MomentCardErrorBoundary>
    );

    expect(errorHandler).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('renders custom fallback when provided', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const customFallback = <div>Custom error message</div>;

    render(
      <MomentCardErrorBoundary fallback={customFallback}>
        <ThrowingComponent shouldThrow={true} />
      </MomentCardErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});

describe('Integration Tests', () => {
  it('handles the original error scenario (missing channel)', () => {
    // This replicates the original error: moment.channel being undefined
    const problematicMoment = {
      id: 'test',
      name: 'Test Moment',
      type: 'immediate',
      status: 'active',
      // channel: undefined, // This would cause the original error
      priority: 'medium',
      audienceSize: 100,
      performance: {
        sent: 100,
        delivered: 95,
        opened: 47,
        clicked: 9,
        converted: 3,
        deliveryRate: 95,
        openRate: 49.5,
        clickRate: 19.1,
        conversionRate: 33.3,
      },
      content: {
        hasPersonalization: false,
        hasABTest: false,
        variants: 1,
      },
      tags: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'test@example.com',
    };

    // This should NOT throw the original error
    expect(() => {
      render(<MomentCard moment={problematicMoment as any} />);
    }).not.toThrow();

    // Should render with default channel
    expect(screen.getByText('EMAIL')).toBeInTheDocument();
  });

  it('handles moment with all possible malformed properties', () => {
    const extremelyBadMoment = {
      id: null,
      name: undefined,
      description: 123,
      type: 'invalid-type',
      status: null,
      channel: {},
      priority: [],
      audienceSize: 'not-a-number',
      segmentIds: 'not-an-array',
      performance: 'not-an-object',
      content: null,
      tags: 'not-an-array',
      createdAt: 123,
      updatedAt: new Date('invalid'),
      createdBy: {},
    };

    // Should not crash
    expect(() => {
      render(<MomentCard moment={extremelyBadMoment as any} />);
    }).not.toThrow();
  });
});