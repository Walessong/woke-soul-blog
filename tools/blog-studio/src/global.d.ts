import type { EnvironmentStatus, PublishResult, StudioConfig, StudioPost } from './shared';

declare global {
  interface Window {
    studio: {
      config: { get(): Promise<StudioConfig>; save(config: StudioConfig): Promise<StudioConfig> };
      chooseRepository(): Promise<string | undefined>;
      status(): Promise<EnvironmentStatus>;
      posts: { list(): Promise<StudioPost[]>; save(post: StudioPost): Promise<StudioPost>; delete(filename: string): Promise<void> };
      importImages(): Promise<string[]>;
      publish(filename: string, images: string[]): Promise<PublishResult>;
      openExternal(url: string): Promise<void>;
    };
  }
}

export {};
