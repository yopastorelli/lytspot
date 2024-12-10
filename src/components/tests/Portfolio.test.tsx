import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import PortfolioGrid from '../portfolio/PortfolioGrid';
import { portfolioItems } from '../../data/portfolio';

describe('PortfolioGrid', () => {
  it('renders all portfolio items', () => {
    render(<PortfolioGrid />);
    
    portfolioItems.forEach(item => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
      expect(screen.getByText(item.category)).toBeInTheDocument();
    });
  });

  it('opens modal when clicking an item', async () => {
    render(<PortfolioGrid />);
    
    const firstItem = screen.getByText(portfolioItems[0].title);
    await fireEvent.click(firstItem);
    
    expect(screen.getByText(portfolioItems[0].description)).toBeInTheDocument();
  });
});