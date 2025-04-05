import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatCard from './StatCard';

describe('StatCard Component', () => {
  const mockProps = {
    icon: '<svg><circle cx="10" cy="10" r="10" /></svg>',
    label: 'Total Sales',
    value: '1000',
  };

  it('renders the label correctly', () => {
    render(<StatCard {...mockProps} />);
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
  });

  it('renders the value correctly', () => {
    render(<StatCard {...mockProps} />);
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  it('renders the icon HTML safely using dangerouslySetInnerHTML', () => {
    render(<StatCard {...mockProps} />);
    const iconContainer = screen.getByTestId('stat-icon');
    expect(iconContainer.innerHTML).toContain('<svg>');
  });

  it('matches snapshot', () => {
    const { container } = render(<StatCard {...mockProps} />);
    expect(container).toMatchSnapshot();
  });
});
