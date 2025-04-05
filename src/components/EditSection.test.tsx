import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductsSection from './EditSection';
import '@testing-library/jest-dom';

describe('ProductsSection', () => {
  const sampleProducts = [
    { image: 'image1.jpg' },
    { image: 'image2.jpg' },
    { image: 'image3.jpg' }
  ];

  it('renders section title', () => {
    render(<ProductsSection products={sampleProducts} />);
    expect(screen.getByText(/your products/i)).toBeInTheDocument();
  });

  it('renders correct number of products', () => {
    render(<ProductsSection products={sampleProducts} />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(sampleProducts.length);
  });

  it('displays images with correct src and alt', () => {
    render(<ProductsSection products={sampleProducts} />);
    sampleProducts.forEach((product, index) => {
      const img = screen.getByAltText(`Product ${index + 1}`) as HTMLImageElement;
      expect(img).toBeInTheDocument();
      expect(img.src).toContain(product.image);
    });
  });

  it('renders an edit and delete button for each product', () => {
    render(<ProductsSection products={sampleProducts} />);
    const editButtons = screen.getAllByText('✏️ Edit');
    const deleteButtons = screen.getAllByText('🗑️ Delete');
    expect(editButtons).toHaveLength(sampleProducts.length);
    expect(deleteButtons).toHaveLength(sampleProducts.length);
  });

  it('edit and delete buttons are clickable', () => {
    render(<ProductsSection products={sampleProducts} />);
    const editButtons = screen.getAllByText('✏️ Edit');
    const deleteButtons = screen.getAllByText('🗑️ Delete');

    fireEvent.click(editButtons[0]);
    fireEvent.click(deleteButtons[0]);

    // Since there is no event handler, we just ensure they don't crash
    expect(true).toBe(true);
  });

  it('renders nothing if no products are passed', () => {
    render(<ProductsSection products={[]} />);
    const images = screen.queryAllByRole('img');
    expect(images).toHaveLength(0);
  });
});
