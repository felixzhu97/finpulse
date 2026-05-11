import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Basic Test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });
});
