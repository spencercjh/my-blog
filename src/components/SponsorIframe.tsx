import React, { useEffect, useRef } from 'react';

type Props = {
  src: string;
  allowedOrigin: string; // Only allow messages from this origin
  title?: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  loading?: 'eager' | 'lazy';
  className?: string;
  sandbox?: string;
};

const SponsorIframe: React.FC<Props> = ({
  src,
  allowedOrigin = 'github.com',
  title = 'embedded-content',
  width = '100%',
  height = 225,
  style,
  loading = 'lazy',
  className,
  sandbox = 'allow-scripts allow-forms allow-same-origin allow-top-navigation-by-user-activation',
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Helper to check allowed protocols (e.g., http/https, prevent javascript:)
  function isSafeUrl(url: string): boolean {
    try {
      const parsed = new URL(url, window.location.href); // Allows relative URLs
      // Only allow http: or https: URLs (modify as desired to restrict further)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      // Require correct iframe and origin
      if (
        iframeRef.current &&
        e.source === iframeRef.current.contentWindow &&
        e.origin === allowedOrigin // strict origin match
      ) {
        const data = e.data as any;
        if (
          data &&
          data.type === 'navigate' &&
          typeof data.url === 'string' &&
          isSafeUrl(data.url)
        ) {
          window.location.assign(data.url);
        }
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [src, allowedOrigin]);

  const styleObj: React.CSSProperties = {
    border: 0,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  };

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      style={styleObj}
      loading={loading}
      sandbox={sandbox}
      className={className}
    />
  );
};

export default SponsorIframe;
