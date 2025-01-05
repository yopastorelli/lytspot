import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import PortfolioGrid from '../portfolio/PortfolioGrid';
import { portfolioItems } from '../../data/portfolioItems';
import type { PortfolioItem } from '../../data/portfolioItems';

describe('PortfolioGrid', () => {
  it('renders all portfolio items', () => {
    render(<PortfolioGrid />);

    portfolioItems.forEach((item: PortfolioItem) => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
      if (['eventos', 'empresas', 'ensaios'].includes(item.category)) {
        expect(screen.getByText(item.category)).toBeInTheDocument();
      }
    });
  });

  it('filters portfolio items by category', () => {
    render(<PortfolioGrid />);

    const categoryButtons = ['eventos', 'empresas', 'ensaios'];

    categoryButtons.forEach((category) => {
      const button = screen.getByText(category.charAt(0).toUpperCase() + category.slice(1));
      fireEvent.click(button);

      portfolioItems
        .filter((filteredItem: PortfolioItem) => filteredItem.category === category)
        .forEach((filteredItem) => {
          expect(screen.getByText(filteredItem.title)).toBeInTheDocument();
        });
    });
  });

  it('displays a modal when a portfolio item is clicked', () => {
    render(<PortfolioGrid />);
    const firstItem = portfolioItems[0];

    const itemElement = screen.getByText(firstItem.title);
    fireEvent.click(itemElement);

    expect(screen.getByText(firstItem.description)).toBeInTheDocument();
    expect(
      screen.getByText(
        `Categoria: ${firstItem.category.charAt(0).toUpperCase() + firstItem.category.slice(1)}`
      )
    ).toBeInTheDocument();
  });
});
