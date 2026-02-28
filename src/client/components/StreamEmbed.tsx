/**
 * Stream Embed Component
 * 
 * This component renders a sanitized iframe for third-party sports stream embeds.
 * It proxies the embed through the backend to strip malicious elements and
 * applies proper sandbox attributes for security.
 * 
 * Features:
 * - Constructs proxy URL to fetch sanitized HTML
 * - Applies sandbox attributes to iframe
 * - Handles loading and error states
 * - Responsive design with proper aspect ratio
 * 
 * @example
 * ```tsx
 * <StreamEmbed url="https://pooembed.eu/embed-noads/premierleague/2026-02-27/wol-avl" />
 * ```
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, AlertCircle, RefreshCw } from 'lucide-react';

interface StreamEmbedProps {
  /** The original URL of the embed to proxy */
  url: string;
  /** Optional title for the iframe */
  title?: string;
  /** Optional className for styling */
  className?: string;
  /** Optional aspect ratio (default: 16/9) */
  aspectRatio?: '16/9' | '4/3' | '21/9' | '1/1';
  /** Optional callback when embed loads successfully */
  onLoad?: () => void;
  /** Optional callback when embed fails to load */
  onError?: (error: Error) => void;
}

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

const StreamEmbed: React.FC<StreamEmbedProps> = React.memo(({
  url,
  title = 'Stream Embed',
  className = '',
  aspectRatio = '16/9',
  onLoad,
  onError,
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const retryCountRef = useRef<number>(0);
  const MAX_RETRIES = 3;

  // Construct the proxy URL
  const proxyUrl = `/api/proxy/embed?url=${encodeURIComponent(url)}`;

  // Get aspect ratio class
  const getAspectRatioClass = (): string => {
    switch (aspectRatio) {
      case '4/3':
        return 'aspect-[4/3]';
      case '21/9':
        return 'aspect-[21/9]';
      case '1/1':
        return 'aspect-square';
      case '16/9':
      default:
        return 'aspect-video';
    }
  };

  // Handle iframe load event
  const handleLoad = (): void => {
    setLoadingState('loaded');
    retryCountRef.current = 0;
    onLoad?.();
  };

  // Handle iframe error event
  const handleError = (): void => {
    const error = new Error('Failed to load stream embed');
    setErrorMessage('Unable to load the stream. Please try again.');
    setLoadingState('error');
    onError?.(error);
  };

  // Retry loading the embed
  const handleRetry = (): void => {
    if (retryCountRef.current < MAX_RETRIES) {
      retryCountRef.current += 1;
      setLoadingState('loading');
      setErrorMessage('');
      
      // Force iframe reload by changing src
      if (iframeRef.current) {
        const currentSrc = iframeRef.current.src;
        iframeRef.current.src = '';
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.src = currentSrc;
          }
        }, 100);
      }
    } else {
      setErrorMessage('Maximum retry attempts reached. Please refresh the page.');
    }
  };

  // Set loading state when component mounts
  useEffect(() => {
    setLoadingState('loading');
  }, [url]);

  // Render loading state
  const renderLoadingState = (): React.ReactNode => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
          <Play className="absolute inset-0 m-auto w-5 h-5 text-sky-500" />
        </div>
        <p className="text-sm font-medium text-zinc-400">Loading stream...</p>
      </div>
    </div>
  );

  // Render error state
  const renderErrorState = (): React.ReactNode => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/95 backdrop-blur-sm p-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Stream Unavailable</h3>
          <p className="text-sm text-zinc-400 mb-4">
            {errorMessage || 'The stream could not be loaded at this time.'}
          </p>
        </div>
        {retryCountRef.current < MAX_RETRIES && (
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-black font-bold text-sm uppercase tracking-wider rounded-lg transition-all hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]"
          >
            <RefreshCw className="w-4 h-4" />
            Retry ({MAX_RETRIES - retryCountRef.current} remaining)
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={`relative w-full bg-black rounded-lg overflow-hidden border border-white/10 ${getAspectRatioClass()} ${className}`}>
      {/* Loading overlay */}
      {loadingState === 'loading' && renderLoadingState()}
      
      {/* Error overlay */}
      {loadingState === 'error' && renderErrorState()}
      
      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={proxyUrl}
        title={title}
        className="w-full h-full"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
        allowFullScreen
        allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
        credentialless
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
});

StreamEmbed.displayName = 'StreamEmbed';

export { StreamEmbed };
export default StreamEmbed;
