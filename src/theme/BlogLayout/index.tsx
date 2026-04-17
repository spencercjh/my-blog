import React, { type ReactNode, useEffect, useState } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import BlogSidebar from '@theme/BlogSidebar';

import type { Props } from '@theme/BlogLayout';

import styles from './styles.module.css';

const STORAGE_KEY = 'blog-sidebar-collapsed';
const SIDEBAR_TOGGLE_EVENT = 'blog-sidebar-toggle';

function readCollapsedState(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function BlogLayout(props: Props): ReactNode {
  const { sidebar, toc, children, ...layoutProps } = props;
  const hasSidebar = Boolean(sidebar?.items.length);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isExpandedLayout = hasSidebar && isSidebarCollapsed;

  useEffect(() => {
    if (!hasSidebar) {
      setIsSidebarCollapsed(false);
      return;
    }

    setIsSidebarCollapsed(readCollapsedState());

    const handleSidebarToggle = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setIsSidebarCollapsed(customEvent.detail);
        return;
      }
      setIsSidebarCollapsed(readCollapsedState());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setIsSidebarCollapsed(event.newValue === 'true');
      }
    };

    window.addEventListener(SIDEBAR_TOGGLE_EVENT, handleSidebarToggle as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(SIDEBAR_TOGGLE_EVENT, handleSidebarToggle as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, [hasSidebar]);

  return (
    <Layout {...layoutProps}>
      <div
        className={clsx('container margin-vert--lg', {
          [styles.blogContainerExpanded]: isExpandedLayout,
        })}
      >
        <div className="row">
          <BlogSidebar sidebar={sidebar} />
          <main
            className={clsx('col', {
              'col--7': hasSidebar && !isExpandedLayout,
              'col--9 col--offset-1': !hasSidebar,
              'col--12': isExpandedLayout && !toc,
              'col--10': isExpandedLayout && toc,
            })}
          >
            {children}
          </main>
          {toc && <div className="col col--2">{toc}</div>}
        </div>
      </div>
    </Layout>
  );
}
