import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeliveryOptions from './DeliveryOptions';
import '@testing-library/jest-dom';

describe('DeliveryOptions', () => {
  const mockOnDeliverySelect = jest.fn();

  beforeEach(() => {
    mockOnDeliverySelect.mockClear();
  });

  it('renders all delivery options', () => {
    render(<DeliveryOptions onDeliverySelect={mockOnDeliverySelect} />);
    expect(screen.getByText('Delivery options')).toBeInTheDocument();
    expect(screen.getByText('Self pickup')).toBeInTheDocument();
    expect(screen.getByText('Online payment')).toBeInTheDocument();
    expect(screen.getByText('Courier cash on delivery')).toBeInTheDocument();
  });

  it('selects a delivery option when checked', () => {
    render(<DeliveryOptions onDeliverySelect={mockOnDeliverySelect} />);
    const checkbox = screen.getByLabelText('Self pickup');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(mockOnDeliverySelect).toHaveBeenCalledWith(['selfPickup']);
  });

  it('deselects a delivery option when unchecked', () => {
    render(<DeliveryOptions onDeliverySelect={mockOnDeliverySelect} initialSelected={['selfPickup']} />);
    const checkbox = screen.getByLabelText('Self pickup');
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(mockOnDeliverySelect).toHaveBeenCalledWith([]);
  });

  it('selects multiple delivery options', () => {
    render(<DeliveryOptions onDeliverySelect={mockOnDeliverySelect} />);
    const pickup = screen.getByLabelText('Self pickup');
    const online = screen.getByLabelText('Online payment');

    fireEvent.click(pickup);
    fireEvent.click(online);

    expect(pickup).toBeChecked();
    expect(online).toBeChecked();
    expect(mockOnDeliverySelect).toHaveBeenCalledWith(['selfPickup']);
    expect(mockOnDeliverySelect).toHaveBeenCalledWith(['selfPickup', 'onlinePayment']);
  });

  it('respects initialSelected prop', () => {
    render(<DeliveryOptions onDeliverySelect={mockOnDeliverySelect} initialSelected={['cashOnDelivery']} />);
    const checkbox = screen.getByLabelText('Courier cash on delivery');
    expect(checkbox).toBeChecked();
  });

  it('calls onDeliverySelect on mount with initialSelected', () => {
    render(<DeliveryOptions onDeliverySelect={mockOnDeliverySelect} initialSelected={['onlinePayment']} />);
    expect(mockOnDeliverySelect).toHaveBeenCalledWith(['onlinePayment']);
  });
});
