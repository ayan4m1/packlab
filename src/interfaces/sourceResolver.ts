export interface SourceResolver {
  fetch(): Promise<void>;
}
