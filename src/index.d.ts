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

// New types for channel videos
export interface VideoInfo {
  /** YouTube video ID */
  id: string;
  /** Video title */
  title: string;
  /** View count text */
  views: string;
  /** Upload time text (e.g., "2 days ago") */
  uploadTime: string;
  /** Video duration text (e.g., "10:45") */
  duration: string;
  /** Thumbnail URL */
  thumbnail: string;
  /** Full YouTube video URL */
  url: string;
}

export interface ChannelInfo {
  /** Channel name */
  name: string;
  /** Subscriber count text */
  subscribers: string;
  /** Total video count text */
  videoCount: string;
}

export interface GetChannelVideosOptions {
  /** Channel URL, @handle, or channel ID */
  channelURL: string;
  /** Maximum number of videos to return (default: 30) */
  limit?: number;
  /** Page token for pagination (optional) */
  pageToken?: string | null;
}

export interface ChannelVideosResult {
  /** Channel information */
  channel: ChannelInfo;
  /** Array of videos */
  videos: VideoInfo[];
  /** Total videos loaded */
  totalLoaded: number;
  /** Whether there are more videos available */
  hasMore: boolean;
}

/**
 * Get videos from a YouTube channel with pagination support
 * @param options - Configuration options
 * @returns Promise that resolves to channel videos result
 */
export function getChannelVideos(options: GetChannelVideosOptions): Promise<ChannelVideosResult>;

export interface SearchChannelVideosOptions {
  /** Channel URL, @handle, or channel ID */
  channelURL: string;
  /** Search query */
  query: string;
  /** Maximum number of videos to return (default: 30) */
  limit?: number;
}

export interface SearchChannelVideosResult {
  /** Search query used */
  query: string;
  /** Array of matching videos */
  results: VideoInfo[];
  /** Total videos found */
  totalFound: number;
}

/**
 * Search for videos within a YouTube channel
 * @param options - Configuration options
 * @returns Promise that resolves to search results
 */
export function searchChannelVideos(options: SearchChannelVideosOptions): Promise<SearchChannelVideosResult>;

// Types for comments
export interface Comment {
  /** Comment author name */
  author: string;
  /** Author channel URL */
  authorUrl: string;
  /** Author avatar URL */
  authorAvatar: string;
  /** Comment text */
  text: string;
  /** Time ago text (e.g., "2 days ago") */
  time: string;
  /** Like count */
  likes: string;
  /** Number of replies */
  replyCount: string;
}

export interface VideoDetails {
  /** Video ID */
  id: string;
  /** Video title */
  title: string;
  /** Channel information */
  channel: {
    name: string;
    url: string;
  };
  /** View count text */
  views: string;
}

export interface GetVideoCommentsOptions {
  /** YouTube video ID */
  videoID: string;
  /** Maximum number of comments to return (default: 50) */
  limit?: number;
  /** Sort order: 'top' or 'newest' (default: 'top') */
  sortBy?: 'top' | 'newest';
  /** Page token for pagination (optional) */
  pageToken?: string | null;
}

export interface VideoCommentsResult {
  /** Video information */
  video: VideoDetails;
  /** Array of comments */
  comments: Comment[];
  /** Total comment count */
  totalComments: number;
  /** Total comments loaded */
  totalLoaded: number;
  /** Whether there are more comments available */
  hasMore: boolean;
  /** Sort order used */
  sortBy: 'top' | 'newest';
}

/**
 * Get comments from a YouTube video with pagination support
 * @param options - Configuration options
 * @returns Promise that resolves to video comments result
 */
export function getVideoComments(options: GetVideoCommentsOptions): Promise<VideoCommentsResult>;

// Types for global YouTube search
export interface SearchResult {
  /** Result ID (video ID or channel ID) */
  id: string;
  /** Result type */
  type: 'video' | 'channel';
  /** Title of the video or channel */
  title: string;
  /** Full YouTube URL */
  url: string;
  /** Thumbnail URL */
  thumbnail: string;
  /** Channel name (for videos) */
  channel?: string;
  /** View count (for videos) */
  views?: string;
  /** Upload time (for videos) */
  uploadTime?: string;
  /** Duration (for videos) */
  duration?: string;
  /** Subscriber count (for channels) */
  subscribers?: string;
  /** Video count (for channels) */
  videoCount?: string;
}

export interface SearchYouTubeGlobalOptions {
  /** Search query */
  query: string;
  /** Maximum number of results to return (1-20, default: 10) */
  maxResults?: number;
  /** Types of results to include (default: ['all']) */
  resultTypes?: ('videos' | 'channels' | 'all')[];
}

export interface SearchYouTubeGlobalResult {
  /** Search query used */
  query: string;
  /** Result types requested */
  resultTypes: ('videos' | 'channels' | 'all')[];
  /** Maximum results requested */
  maxResults: number;
  /** Total results found */
  totalFound: number;
  /** Array of search results */
  results: SearchResult[];
}

/**
 * Search across all of YouTube for videos and channels
 * @param options - Configuration options
 * @returns Promise that resolves to global search results
 */
export function searchYouTubeGlobal(options: SearchYouTubeGlobalOptions): Promise<SearchYouTubeGlobalResult>;