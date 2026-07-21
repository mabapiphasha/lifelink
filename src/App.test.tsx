import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders LifeLink', () => {
  render(<App />);
  const linkElement = screen.getByText(/LifeLink/i);
  expect(linkElement).toBeInTheDocument();
});
