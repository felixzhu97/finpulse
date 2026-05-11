import { describe, it, expect } from 'vitest';
import { cn } from './index';

describe('cn', () => {
  describe('when given a single class string', () => {
    it('should return the class string unchanged', () => {
      expect(cn('foo')).toBe('foo');
    });
  });

  describe('when given multiple class strings', () => {
    it('should combine multiple class strings with spaces', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should combine three or more class strings', () => {
      expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
    });
  });

  describe('when given class objects', () => {
    it('should include classes for truthy values', () => {
      expect(cn({ foo: true, bar: true })).toBe('foo bar');
    });

    it('should exclude classes for falsy values', () => {
      expect(cn({ foo: true, bar: false })).toBe('foo');
    });

    it('should include only truthy classes from mixed input', () => {
      expect(cn('static-class', { conditional: true, hidden: false })).toBe('static-class conditional');
    });
  });

  describe('when given class arrays', () => {
    it('should flatten nested arrays', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar');
    });

    it('should handle nested arrays with objects', () => {
      expect(cn(['foo', { bar: true }])).toBe('foo bar');
    });

    it('should filter falsy values in arrays', () => {
      expect(cn(['foo', null, undefined, false, 'bar'])).toBe('foo bar');
    });
  });

  describe('when given empty inputs', () => {
    it('should return empty string for no arguments', () => {
      expect(cn()).toBe('');
    });

    it('should return empty string for all falsy values', () => {
      expect(cn(null as any, false as any, undefined as any)).toBe('');
    });
  });

  describe('when given mixed input types', () => {
    it('should handle complex mixed inputs', () => {
      expect(cn('base', ['medium', 'padding'], { 'text-center': true, hidden: false })).toBe('base medium padding text-center');
    });

    it('should merge duplicate classes from different inputs', () => {
      const result = cn('foo foo', 'foo');
      expect(result).toContain('foo');
    });
  });

  describe('Tailwind merge behavior', () => {
    it('should merge tailwind classes with conflicting values (last wins)', () => {
      expect(cn('p-2 p-4')).toBe('p-4');
    });

    it('should merge padding classes', () => {
      expect(cn('px-2 py-4', 'px-4')).toBe('py-4 px-4');
    });

    it('should merge margin classes', () => {
      expect(cn('m-2', 'm-4')).toBe('m-4');
    });

    it('should merge color classes', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('should keep non-conflicting classes', () => {
      expect(cn('p-2 m-2', 'p-4')).toBe('m-2 p-4');
    });
  });
});
