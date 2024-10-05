export interface LoaderResolver {
  fetch(): Promise<void>;
}
