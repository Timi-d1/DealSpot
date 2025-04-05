import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './FooterSellerDash';
import '@testing-library/jest-dom'; 

const mockSections = [
  {
    title: 'About',
    items: ['Team', 'Locations', 'Privacy'],
  },
  {
    title: 'Services',
    items: ['Sell', 'Buy'],
  },
];

describe('FooterSellerDash Component', () => {
  it('renders section titles and items', () => {
    render(<Footer sections={mockSections} />);

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Sell')).toBeInTheDocument();
  });

  it('renders the footer container class', () => {
    const { container } = render(<Footer sections={mockSections} />);
    expect(container.firstChild).toHaveClass('footer');
  });
});
