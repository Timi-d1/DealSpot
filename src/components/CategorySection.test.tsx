import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import CategorySection from './CategorySection';

describe('CategorySection', () => {
  const mockSelect = jest.fn();

  beforeEach(() => {
    mockSelect.mockClear();
  });

  it('renders the section title', () => {
    render(<CategorySection onSubcategorySelect={mockSelect} />);
    expect(screen.getByText('Browse By Category')).toBeInTheDocument();
  });

  it('renders all main categories as buttons', () => {
    render(<CategorySection onSubcategorySelect={mockSelect} />);
    const buttons = screen.getAllByRole('button');
    // Should be 7 category buttons (based on the categories object)
    expect(buttons.length).toBe(7);
    expect(buttons[0]).toHaveTextContent('Phones and accessories');
  });

  it('expands subcategories on category button click', () => {
    render(<CategorySection onSubcategorySelect={mockSelect} />);
    fireEvent.click(screen.getByText('Phones and accessories'));
    expect(screen.getByText('Smartphones')).toBeInTheDocument();
    expect(screen.getByText('Smartwatches')).toBeInTheDocument();
  });

  it('collapses an expanded category on second click', () => {
    render(<CategorySection onSubcategorySelect={mockSelect} />);
    const button = screen.getByText('Phones and accessories');
    fireEvent.click(button); // expand
    fireEvent.click(button); // collapse
    expect(screen.queryByText('Smartphones')).not.toBeInTheDocument();
  });

  it('expands only one category at a time', () => {
    render(<CategorySection onSubcategorySelect={mockSelect} />);
    fireEvent.click(screen.getByText('Phones and accessories'));
    fireEvent.click(screen.getByText('Computers'));

    expect(screen.queryByText('Smartphones')).not.toBeInTheDocument();
    expect(screen.getByText('Laptops')).toBeInTheDocument();
  });

  it('calls onSubcategorySelect when a subcategory is clicked', () => {
    render(<CategorySection onSubcategorySelect={mockSelect} />);
    fireEvent.click(screen.getByText('Photography'));
    fireEvent.click(screen.getByText('Lenses'));
    expect(mockSelect).toHaveBeenCalledWith('Lenses');
  });

  it('renders no subcategories by default', () => {
    render(<CategorySection onSubcategorySelect={mockSelect} />);
    expect(screen.queryByText('Smartphones')).not.toBeInTheDocument();
    expect(screen.queryByText('Laptops')).not.toBeInTheDocument();
  });
});
