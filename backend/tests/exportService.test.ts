import { describe, expect, it } from 'vitest';
import { bundleToCsv, type ExportBundle } from '../src/services/exportService.js';

describe('bundleToCsv', () => {
  it('renders one CSV section per table with headers', () => {
    const bundle: ExportBundle = {
      generatedAt: '2026-01-01T00:00:00.000Z',
      data: {
        expenses: [
          { id: '1', amount: 100, description: 'Lunch' },
          { id: '2', amount: 200, description: 'Groceries, weekly' },
        ],
        tasks: [],
      },
    };

    const csv = bundleToCsv(bundle);

    expect(csv).toContain('# expenses');
    expect(csv).toContain('id,amount,description');
    expect(csv).toContain('"Groceries, weekly"'); // commas inside values are quoted
    expect(csv).toContain('# tasks');
    expect(csv).toContain('(no rows)');
  });
});
