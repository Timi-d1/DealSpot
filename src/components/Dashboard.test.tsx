import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Dashboard from './Dashboard';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

jest.mock('./HeaderSellerDash', () => () => <div>Header</div>);
jest.mock('./SideBar', () => (props: any) => (
  <div>
    Sidebar
    <button onClick={props.onClose}>Close Sidebar</button>
  </div>
));
jest.mock('./FooterSellerDash', () => (props: any) => (
  <div>Footer - {props.sections.length} sections</div>
));
jest.mock('./StatCard', () => (props: any) => (
  <div>{props.label}: {props.value}</div>
));

describe('Dashboard', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ id: 'test-seller' }));
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('seller_listings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: '1', product_name: 'Item A', initial_price: '100' },
            { id: '2', product_name: 'Item B', initial_price: '200' }
          ])
        }) as any;
      }
      return Promise.reject('Unknown endpoint') as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders header, footer, and sidebar toggle', async () => {
    render(<Dashboard />, { wrapper: MemoryRouter });
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Footer - 3 sections')).toBeInTheDocument();
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
  });

  it('fetches and displays products correctly', async () => {
    render(<Dashboard />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText('Item A')).toBeInTheDocument();
      expect(screen.getByText('Item B')).toBeInTheDocument();
    });
  });

  it('displays total sales and average order value correctly', async () => {
    render(<Dashboard />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText('Total Sales: $300.00')).toBeInTheDocument();
      expect(screen.getByText('Avg. Order Value: $150.00')).toBeInTheDocument();
    });
  });

  it('shows message when no products are available', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(<Dashboard />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText('No products found.')).toBeInTheDocument();
    });
  });

  it('allows clicking edit and delete buttons', async () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    render(<Dashboard />, { wrapper: MemoryRouter });

    await waitFor(() => {
      const editBtn = screen.getAllByLabelText('Edit listing')[0];
      const deleteBtn = screen.getAllByLabelText('Delete listing')[0];
      expect(editBtn).toBeInTheDocument();
      expect(deleteBtn).toBeInTheDocument();
    });
  });

  it('toggles sidebar visibility', () => {
    render(<Dashboard />, { wrapper: MemoryRouter });
    const hamburger = screen.getByRole('button');
    fireEvent.click(hamburger);
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
  });
});
