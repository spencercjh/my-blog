import React, { useEffect, useRef } from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import useIsBrowser from '@docusaurus/useIsBrowser';

export default function GiscusComponent(): React.JSX.Element | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const isBrowser = useIsBrowser();

  useEffect(() => {
    if (!isBrowser || !containerRef.current) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'spencercjh/my-blog');
    script.setAttribute('data-repo-id', 'R_kgDOOlN43A');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDOOlN43M4C7Bkh');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-lang', 'zh-CN');
    script.setAttribute('data-theme', 'preferred_color_scheme');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    containerRef.current.appendChild(script);

    return () => {
      while (containerRef.current?.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
    };
  }, [isBrowser]);

  if (!ExecutionEnvironment.canUseDOM) {
    return null;
  }

  return <div ref={containerRef} style={{ marginTop: '40px' }} />;
}
