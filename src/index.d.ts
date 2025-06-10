export interface SubtitleSegment {
  /** Start time in seconds (as string) */
  start: string;
  /** Duration in seconds (as string) */
  dur: string;
  /** The subtitle text content */
  text: string;
}

export interface GetSubtitlesOptions {
  /** YouTube video ID */
  videoID: string;
  /** Language code (default: 'en') */
  lang?: string;
}

/**
 * Extract YouTube video transcripts using headless browser automation
 * @param options - Configuration options
 * @returns Promise that resolves to an array of subtitle segments
 */
export function getSubtitles(options: GetSubtitlesOptions): Promise<SubtitleSegment[]>;