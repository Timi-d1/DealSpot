import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EditListing from './EditListing';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

jest.mock('./CategorySelection', () => (props: any) => (
  <div>
    CategorySelection
    <button onClick={() => props.onCategorySelect(['Electronics'])}>Set Category</button>
  </div>
));

jest.mock('./DeliveryOptions', () => (props: any) => (
  <div>
    DeliveryOptions
    <button onClick={() => props.onDeliverySelect(['selfPickup'])}>Set Delivery</button>
  </div>
));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ listingId: '123' }),
}));

describe('EditListing', () => {
  const listingMock = {
    product_name: 'Test Product',
    description: 'Great item',
    number_of_units: 10,
    dimensions: { length: 100, width: 50, height: 20 },
    initial_price: 150,
    category: ['Phones'],
    photos: ['1.jpg'],
    delivery_option: ['cashOnDelivery'],
  };

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      if ((url as string).includes('/api/listings/123')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(listingMock),
        }) as any;
      }

      if ((url as string).includes('/api/update_listing')) {
        return Promise.resolve({ ok: true }) as any;
      }

      return Promise.reject('Unknown fetch') as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  function renderPage() {
    return render(
      <MemoryRouter initialEntries={['/edit-listing/123']}>
        <Routes>
          <Route path="/edit-listing/:listingId" element={<EditListing />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('renders loading state initially', async () => {
    renderPage();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('loads and displays listing data', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Great item')).toBeInTheDocument();
    });
  });

  it('handles input changes', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Edit Listing')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Test Product');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    expect(nameInput).toHaveValue('Updated Name');
  });

  it('submits updated listing and redirects', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Edit Listing')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Set Category'));
    fireEvent.click(screen.getByText('Set Delivery'));
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/update_listing/123'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error message if fetch fails', async () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({ ok: false }) as any
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/error fetching listing data/i)).toBeInTheDocument();
    });
  });

  it('shows fallback if listing data is missing', async () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(null),
      }) as any
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/error fetching listing data/i)).toBeInTheDocument();
    });
  });

  it('navigates to dashboard when cancel is clicked', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Edit Listing')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
