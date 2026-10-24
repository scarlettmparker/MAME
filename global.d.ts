declare module "@sun/components";

interface Window {
  requestIdleCallback(callback: (deadline: IdleDeadline) => void, options?: { timeout: number }): number;
  cancelIdleCallback(handle: number): void;
}

interface IdleDeadline {
  didTimeout: boolean;
  timeRemaining(): number;
}
