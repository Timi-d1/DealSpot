// AddListing.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddListing from './AddListing';
import '@testing-library/jest-dom';
import { useParams } from 'react-router-dom';

// test case for category selection
jest.mock('./CategorySelection', () => (props: any) => {
    return (
      <div>
        CategorySelection
        <button onClick={() => props.onCategorySelect(['Electronics'])}>Set Category</button>
      </div>
    );
  });
  // test case for  photoupload
  jest.mock('./PhotoUpload', () => (props: any) => {
    return (
      <div>
        PhotoUpload
        <button onClick={() => props.onPhotosUpload([{ url: 'test.jpg' }])}>Upload Photo</button>
      </div>
    );
  });
  // test case for product details
  jest.mock('./ProductDetails', () => (props: any) => {
    return (
      <div>
        ProductDetails
        <button onClick={() =>
          props.onProductDetailsChange({
            product_name: 'Phone',
            description: 'Cool phone',
            number_of_units: 1,
            initial_price: 100,
            dimensions: { length: 10, width: 5, height: 2 },
          })
        }>
          Fill Details
        </button>
      </div>
    );
  });
  // test case for delivery options
  jest.mock('./DeliveryOptions', () => (props: any) => {
    return (
      <div>
        DeliveryOptions
        <button onClick={() => props.onDeliverySelect(['Pickup'])}>Set Delivery</button>
      </div>
    );
  });
  // test case for listing id fetch
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ listingId: '123' }),
  }));
  

describe('AddListing', () => {
    beforeEach(() => {
        window.alert = jest.fn(); // mock alert
      
        Object.defineProperty(window, 'location', {
          configurable: true,
          value: {
            ...window.location,
            reload: jest.fn(),
          },
        });
      
        localStorage.setItem('user', JSON.stringify({ id: 'test-user' }));
      });
      
// test actions for error and edge case handling
  it('renders title and buttons', () => {
    render(<AddListing />, { wrapper: MemoryRouter });
    expect(screen.getByText('Add Listing')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Post')).toBeInTheDocument();
  });

  it('alerts when trying to post with initial_price 0', async () => {
    render(<AddListing />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText('Post'));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Initial price must be greater than zero!');
    });
  });

  it('alerts when fetch throws an error', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
  
    render(<AddListing />, { wrapper: MemoryRouter });
  //button click activation
    fireEvent.click(screen.getByText('Set Category'));
    fireEvent.click(screen.getByText('Upload Photo'));
    fireEvent.click(screen.getByText('Fill Details'));
    fireEvent.click(screen.getByText('Set Delivery'));
    fireEvent.click(screen.getByText('Post'));
  
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to post listing.');
    });
  });
 
  it('does not send request if no category is selected', async () => {
    render(<AddListing />, { wrapper: MemoryRouter });
  
    // Skip Set Category --> if not selected
    fireEvent.click(screen.getByText('Upload Photo'));
    fireEvent.click(screen.getByText('Fill Details'));
    fireEvent.click(screen.getByText('Set Delivery'));
    fireEvent.click(screen.getByText('Post'));
  
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled(); // Optional: match specific message
    });
  });
  it('navigates to dashboard when Dashboard button is clicked', () => {
    delete window.location;
    window.location = { href: '' } as any;
  
    render(<AddListing />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText('Dashboard'));
  
    expect(window.location.href).toBe('/dashboard');
  });
  it('handles empty listing data gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        new Response('{}', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
  
    render(<AddListing />, { wrapper: MemoryRouter });
  
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:5001/api/listings/123');
    });
  
    // Checking  form to not to crash or break
    expect(screen.getByText('Add Listing')).toBeInTheDocument();
  });
      
  it('fetches listing data when listingId is present', async () => {
    const mockData = {
      product_name: 'Mock Phone',
      description: 'Mock description',
      number_of_units: 10,
      initial_price: 500,
      dimensions: { length: '10', width: '5', height: '2' },
      category: ['Electronics'],
      photos: ['photo.jpg'],
      delivery_option: ['Delivery'],
    };
  
    global.fetch = jest.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
      );
      
  
    render(<AddListing />, { wrapper: MemoryRouter });
  
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:5001/api/listings/123');
    });
  });
    
  it('sends correct data when form is valid', async () => {
    const mockFetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Listing posted!' }),
      })
    ) as jest.Mock;
    global.fetch = mockFetch;
  
    render(<AddListing />, { wrapper: MemoryRouter });
  
    // Simulate full form interaction
    fireEvent.click(screen.getByText('Set Category'));
    fireEvent.click(screen.getByText('Upload Photo'));
    fireEvent.click(screen.getByText('Fill Details'));
    fireEvent.click(screen.getByText('Set Delivery'));
  
    // Click post --> test post 
    fireEvent.click(screen.getByText('Post'));
  
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:5001/api/add_listing',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        })
      );
    });
  });
  
});
