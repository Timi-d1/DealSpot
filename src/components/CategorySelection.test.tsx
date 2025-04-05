import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategorySelection from './CategorySelection';

describe('CategorySelection', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders the title and all categories', () => {
    render(<CategorySelection onCategorySelect={mockOnSelect} />);
    expect(screen.getByText('Select the category your goods belong to (max. 3)')).toBeInTheDocument();
    expect(screen.getByText('Phones and accessories')).toBeInTheDocument();
    expect(screen.getByText('Smartphones')).toBeInTheDocument();
  });

  it('selects a subcategory when checkbox is clicked', () => {
    render(<CategorySelection onCategorySelect={mockOnSelect} />);
    const checkbox = screen.getByLabelText('Smartphones');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(mockOnSelect).toHaveBeenCalledWith(['Smartphones']);
  });

  it('deselects a selected subcategory on second click', () => {
    render(<CategorySelection onCategorySelect={mockOnSelect} />);
    const checkbox = screen.getByLabelText('Smartphones');
    fireEvent.click(checkbox); // select
    fireEvent.click(checkbox); // deselect
    expect(checkbox).not.toBeChecked();
    expect(mockOnSelect).toHaveBeenCalledWith([]);
  });

  it('does not allow selecting more than 3 subcategories', () => {
    render(<CategorySelection onCategorySelect={mockOnSelect} />);
    const a = screen.getByLabelText('Smartphones');
    const b = screen.getByLabelText('Smartwatches');
    const c = screen.getByLabelText('Tablets');
    const d = screen.getByLabelText('Accessories GSM');

    fireEvent.click(a);
    fireEvent.click(b);
    fireEvent.click(c);
    fireEvent.click(d); // this one should be ignored

    expect(a).toBeChecked();
    expect(b).toBeChecked();
    expect(c).toBeChecked();
    expect(d).not.toBeChecked();
  });

  it('disables unchecked checkboxes after selecting 3', () => {
    render(<CategorySelection onCategorySelect={mockOnSelect} />);
    fireEvent.click(screen.getByLabelText('Smartphones'));
    fireEvent.click(screen.getByLabelText('Smartwatches'));
    fireEvent.click(screen.getByLabelText('Tablets'));

    const disabledCheckbox = screen.getByLabelText('Accessories GSM');
    expect(disabledCheckbox).toBeDisabled();
  });

  it('removes subcategory via ✖ button in selected chip', () => {
    render(<CategorySelection onCategorySelect={mockOnSelect} initialSelected={['Smartphones']} />);

    // Get all elements with the text 'Smartphones'
    const chips = screen.getAllByText('Smartphones');

    // Find the one that is a chip (not the label)
    const chip = chips.find(el => el.className.includes('categoryChip'));
    expect(chip).toBeInTheDocument();

    // Click the ✖ button inside the chip
    const removeButton = chip?.querySelector('button') as HTMLElement;
    fireEvent.click(removeButton);

    expect(mockOnSelect).toHaveBeenCalledWith([]);
  });

  it('respects initialSelected prop on first render', () => {
    render(<CategorySelection onCategorySelect={mockOnSelect} initialSelected={['Laptops', 'TVs']} />);
    expect(screen.getByLabelText('Laptops')).toBeChecked();
    expect(screen.getByLabelText('TVs')).toBeChecked();
  });
});
