// ECommerceHomePage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ECommerceHomePage from './ECommerceHomePage';
import '@testing-library/jest-dom';

// Mock components used in ECommerceHomePage
jest.mock('./Header', () => (props: any) => (
  <div data-testid="header">
    Header
    <button onClick={() => props.setSearchQuery('Laptop')}>Mock Search</button>
  </div>
));
jest.mock('./CategorySection', () => (props: any) => (
  <div data-testid="category">
    CategorySection
    <button onClick={() => props.onSubcategorySelect('Phones')}>Select Phones</button>
  </div>
));
jest.mock('./NewItemsSection', () => (props: any) => (
  <div data-testid="new-items">
    NewItemsSection - Subcategory: {props.subcategory}, Query: {props.searchQuery}
  </div>
));
jest.mock('./Footer', () => () => <div data-testid="footer">Footer</div>);

// Mock @typebot.io/react
jest.mock('@typebot.io/react', () => ({
  Bubble: () => <div data-testid="chatbot">Chatbot</div>,
}));

beforeEach(() => {
  localStorage.clear();
});

describe('ECommerceHomePage Component', () => {
  it('renders without crashing', () => {
    render(<ECommerceHomePage />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('category')).toBeInTheDocument();
    expect(screen.getByTestId('new-items')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders chatbot bubble from Typebot', () => {
    render(<ECommerceHomePage />);
    expect(screen.getByTestId('chatbot')).toBeInTheDocument();
  });

  it('updates searchQuery when Header triggers setSearchQuery', async () => {
    render(<ECommerceHomePage />);
    fireEvent.click(screen.getByText('Mock Search'));
    await waitFor(() => {
      expect(screen.getByTestId('new-items')).toHaveTextContent('Query: Laptop');
    });
  });

  it('updates selectedSubcategory when CategorySection triggers selection', async () => {
    render(<ECommerceHomePage />);
    fireEvent.click(screen.getByText('Select Phones'));
    await waitFor(() => {
      expect(screen.getByTestId('new-items')).toHaveTextContent('Subcategory: Phones');
    });
  });

  it('shows tour prompt if localStorage has showTour = "true"', () => {
    localStorage.setItem('showTour', 'true');
    render(<ECommerceHomePage />);
    expect(screen.getByText('Welcome to DealSpot! Would you like a quick tour?')).toBeInTheDocument();
  });

  it('starts the tour when "Start Tour" is clicked', async () => {
    localStorage.setItem('showTour', 'true');
    render(<ECommerceHomePage />);
    fireEvent.click(screen.getByText('Start Tour'));
    await waitFor(() => {
      expect(screen.queryByText('Welcome to DealSpot! Would you like a quick tour?')).not.toBeInTheDocument();
    });
  });

  it('skips the tour and hides the prompt when "Skip" is clicked', () => {
    localStorage.setItem('showTour', 'true');
    render(<ECommerceHomePage />);
    fireEvent.click(screen.getByText('Skip'));
    expect(localStorage.getItem('showTour')).toBe('false');
    expect(screen.queryByText('Welcome to DealSpot! Would you like a quick tour?')).not.toBeInTheDocument();
  });
});
