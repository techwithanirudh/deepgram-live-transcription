export {};

declare global {
  // biome-ignore lint/style/useConsistentTypeDefinitions: Global augmentation must use interface merging
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
