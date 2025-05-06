
export {};

declare global {
  interface Window {
    productsRefreshInterval?: NodeJS.Timer;
  }
}
