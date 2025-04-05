import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './HeaderSellerDash';

describe('HeaderSellerDash Component', () => {
  const mockLogo = 'DealSpot';

  it('renders logo text', () => {
    render(<Header logo={mockLogo} />);
    expect(screen.getByText(mockLogo)).toBeInTheDocument();
  });

  it('renders the header container', () => {
    const { container } = render(<Header logo={mockLogo} />);
    expect(container.firstChild).toHaveClass('header');
  });
});
