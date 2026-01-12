import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../../App';

describe('App Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('has the root element', () => {
    const { container } = render(<App />);
    expect(container.querySelector('.h-screen')).toBeTruthy();
  });
});
