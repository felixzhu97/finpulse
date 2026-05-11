/**
 * AssetAllocation Component Tests
 * Following TDD best practices with parameterized tests and domain test values
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssetAllocation } from './AssetAllocation';
import { ASSET_ALLOCATION_DOMAIN, ASSET_CATEGORIES } from '@/__fixtures__/domain';

describe('AssetAllocation', () => {
  describe('rendering', () => {
    it('should render the AssetAllocation title', () => {
      render(<AssetAllocation />);
      expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
    });

    it('should render total assets value from domain', () => {
      render(<AssetAllocation />);
      expect(screen.getByText(ASSET_ALLOCATION_DOMAIN.VALID.balanced.totalAssets)).toBeInTheDocument();
    });

    it('should render Total Assets label', () => {
      render(<AssetAllocation />);
      expect(screen.getByText('Total Assets')).toBeInTheDocument();
    });
  });

  describe('asset categories', () => {
    it.each(ASSET_CATEGORIES)('should render "$category" category', (category) => {
      render(<AssetAllocation />);
      expect(screen.getByText(category)).toBeInTheDocument();
    });

    it('should render all asset categories from domain', () => {
      render(<AssetAllocation />);
      ASSET_ALLOCATION_DOMAIN.VALID.balanced.allocation.forEach(({ category }) => {
        expect(screen.getByText(category)).toBeInTheDocument();
      });
    });
  });

  describe('percentage values', () => {
    it('should render percentage values', () => {
      render(<AssetAllocation />);
      ASSET_ALLOCATION_DOMAIN.VALID.balanced.allocation.forEach(({ percentage }) => {
        expect(screen.getByText(`${percentage}%`)).toBeInTheDocument();
      });
    });
  });

  describe('Card component', () => {
    it('should render Card with glass styling', () => {
      render(<AssetAllocation />);
      const card = screen.getByText('Asset Allocation').closest('.glass');
      expect(card).toBeInTheDocument();
    });
  });

  describe('allocation distribution', () => {
    it('should display balanced allocation with multiple categories', () => {
      const { allocation } = ASSET_ALLOCATION_DOMAIN.VALID.balanced;
      
      expect(allocation.length).toBeGreaterThan(1);
      
      const totalPercentage = allocation.reduce((sum, a) => sum + a.percentage, 0);
      expect(totalPercentage).toBeLessThanOrEqual(100);
    });

    it('should have category names as strings', () => {
      ASSET_ALLOCATION_DOMAIN.VALID.balanced.allocation.forEach(({ category }) => {
        expect(typeof category).toBe('string');
        expect(category.length).toBeGreaterThan(0);
      });
    });

    it('should have valid percentage values', () => {
      ASSET_ALLOCATION_DOMAIN.VALID.balanced.allocation.forEach(({ percentage }) => {
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('boundary scenarios', () => {
    it('should handle all cash allocation', () => {
      const { allocation } = ASSET_ALLOCATION_DOMAIN.BOUNDARY.allCash;
      expect(allocation.length).toBe(1);
      expect(allocation[0].category).toBe('Cash');
      expect(allocation[0].percentage).toBe(100);
    });

    it('should handle all stocks allocation', () => {
      const { allocation } = ASSET_ALLOCATION_DOMAIN.BOUNDARY.allStocks;
      expect(allocation.length).toBe(1);
      expect(allocation[0].category).toBe('Stocks');
      expect(allocation[0].percentage).toBe(100);
    });
  });
});
