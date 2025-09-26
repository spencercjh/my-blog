import React, { useEffect, useRef } from 'react';

type Props = {
  src: string;
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
  title = 'embedded-content',
  width = '100%',
  height = 225,
  style,
  loading = 'lazy',
  className,
  sandbox = 'allow-scripts allow-forms allow-same-origin allow-top-navigation-by-user-activation',
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) return;
      const data = e.data as any;
      if (data && data.type === 'navigate' && typeof data.url === 'string') {
        window.location.assign(data.url);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [src]);

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
