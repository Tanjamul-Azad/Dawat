import { expect, it } from 'vitest';
import { NAME_LIMIT, namesParam, parseNamesParam, withNames } from './storefront-names';

it('joins the two names with " & " and drops empty ones', () => {
  expect(namesParam({ first: 'Arib', second: 'Mehrin' })).toBe('Arib & Mehrin');
  expect(namesParam({ first: '', second: 'Mehrin' })).toBe('Mehrin');
  expect(namesParam({ first: '  ', second: '' })).toBe('');
});

it('keeps an "&" typed inside a name from splitting it into three parts', () => {
  expect(namesParam({ first: 'Arib & Co', second: 'Mehrin' })).toBe('Arib Co & Mehrin');
});

it('caps each name and reads the value back into two names', () => {
  const long = 'ক'.repeat(NAME_LIMIT + 20);
  const param = namesParam({ first: long, second: 'মেহরিন' });
  expect(parseNamesParam(param)).toEqual({ first: 'ক'.repeat(NAME_LIMIT), second: 'মেহরিন' });
});

it('ignores a missing or repeated query value', () => {
  expect(parseNamesParam(undefined)).toEqual({ first: '', second: '' });
  expect(parseNamesParam(['a', 'b'])).toEqual({ first: '', second: '' });
});

it('adds names to an order link and encodes them', () => {
  expect(withNames('/order/?template=jamdani', { first: 'Arib', second: 'Mehrin' })).toBe(
    '/order/?template=jamdani&names=Arib%20%26%20Mehrin',
  );
  expect(withNames('/order/', { first: 'Arib', second: '' })).toBe('/order/?names=Arib');
  expect(withNames('/order/?template=ivory', { first: '', second: '' })).toBe('/order/?template=ivory');
});
