import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {},
  length: 0,
  key: (index: number) => null,
};

global.localStorage = localStorageMock as Storage;

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: () => Promise.resolve({
      getTracks: () => [],
    }),
    getDisplayMedia: () => Promise.resolve({
      getTracks: () => [],
    }),
  },
  writable: true,
});
