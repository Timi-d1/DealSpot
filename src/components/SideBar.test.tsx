import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import Sidebar from './SideBar';
import { MemoryRouter, useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});

describe('Sidebar Component', () => {
  const mockNavigate = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    jest.clearAllMocks();
  });

  it('renders without crashing when visible', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Sidebar isVisible={true} onClose={mockOnClose} />
      </MemoryRouter>
    );

    expect(getByText('Main Page')).toBeInTheDocument();
    expect(getByText('Add Listing')).toBeInTheDocument();
    expect(getByText('Chats')).toBeInTheDocument();
  });

  it('applies open class when isVisible is true', () => {
    const { container } = render(
      <MemoryRouter>
        <Sidebar isVisible={true} onClose={mockOnClose} />
      </MemoryRouter>
    );
    expect(container.firstChild).toHaveClass('sidebarOpen');
  });

  it('does not apply open class when isVisible is false', () => {
    const { container } = render(
      <MemoryRouter>
        <Sidebar isVisible={false} onClose={mockOnClose} />
      </MemoryRouter>
    );
    expect(container.firstChild).not.toHaveClass('sidebarOpen');
  });

  it('navigates to /homepage when Main Page is clicked', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Sidebar isVisible={true} onClose={mockOnClose} />
      </MemoryRouter>
    );
    fireEvent.click(getByText('Main Page'));
    expect(mockNavigate).toHaveBeenCalledWith('/homepage');
  });

  it('navigates to /add-listing when Add Listing is clicked', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Sidebar isVisible={true} onClose={mockOnClose} />
      </MemoryRouter>
    );
    fireEvent.click(getByText('Add Listing'));
    expect(mockNavigate).toHaveBeenCalledWith('/add-listing');
  });

  it('navigates to /message when Chats is clicked', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Sidebar isVisible={true} onClose={mockOnClose} />
      </MemoryRouter>
    );
    fireEvent.click(getByText('Chats'));
    expect(mockNavigate).toHaveBeenCalledWith('/message');
  });
});
