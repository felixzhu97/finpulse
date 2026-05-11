/**
 * AG Grid Theme Tests
 * Following TDD best practices for theme configuration
 */
import { describe, it, expect } from 'vitest';
import { finpulseAgGridTheme } from './ag-grid-theme';

describe('ag-grid-theme', () => {
  describe('finpulseAgGridTheme', () => {
    it('should be defined', () => {
      expect(finpulseAgGridTheme).toBeDefined();
    });

    it('should be an object', () => {
      expect(typeof finpulseAgGridTheme).toBe('object');
    });

    it('should have theme properties', () => {
      expect(Object.keys(finpulseAgGridTheme).length).toBeGreaterThan(0);
    });

    it('should be usable as a theme instance', () => {
      expect(finpulseAgGridTheme).toBeDefined();
      expect(typeof finpulseAgGridTheme).toBe('object');
    });
  });
});
