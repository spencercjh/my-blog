import React, { memo, useState, useEffect } from 'react';
import clsx from 'clsx';
import { translate } from '@docusaurus/Translate';
import {
  useVisibleBlogSidebarItems,
  BlogSidebarItemList,
} from '@docusaurus/plugin-content-blog/client';
import BlogSidebarContent from '@theme/BlogSidebar/Content';
import type { Props as BlogSidebarContentProps } from '@theme/BlogSidebar/Content';
import type { Props } from '@theme/BlogSidebar/Desktop';

import styles from './styles.module.css';

const STORAGE_KEY = 'blog-sidebar-collapsed';
const SIDEBAR_TOGGLE_EVENT = 'blog-sidebar-toggle';

const ChevronIcon: React.FC<{ className?: string; rotated?: boolean }> = ({
  className,
  rotated,
}) => (
  <svg
    className={clsx(className, rotated && styles.iconRotated)}
    width="20"
    height="20"
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11.354 8.354a.5.5 0 000-.708L6.207 2.5a.5.5 0 00-.708 0l-.146.147a.5.5 0 000 .707L9.793 7.5 5.353 11.939a.5.5 0 000 .707l.147.147a.5.5 0 00.708 0l5.146-5.146z" />
  </svg>
);

const ListComponent: BlogSidebarContentProps['ListComponent'] = ({ items }) => {
  return (
    <BlogSidebarItemList
      items={items}
      ulClassName={clsx(styles.sidebarItemList, 'clean-list')}
      liClassName={styles.sidebarItem}
      linkClassName={styles.sidebarItemLink}
      linkActiveClassName={styles.sidebarItemLinkActive}
    />
  );
};

function BlogSidebarDesktop({ sidebar }: Props) {
  const items = useVisibleBlogSidebarItems(sidebar.items);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const emitCollapseState = (collapsed: boolean) => {
    if (typeof window === 'undefined') {
      return;
    }
    window.dispatchEvent(new CustomEvent(SIDEBAR_TOGGLE_EVENT, { detail: collapsed }));
  };

  useEffect(() => {
    let initialCollapsed = false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        initialCollapsed = saved === 'true';
      }
    } catch {
      // Ignore localStorage errors
    }
    setIsCollapsed(initialCollapsed);
  }, []);

  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    try {
      localStorage.setItem(STORAGE_KEY, String(newState));
    } catch {
      // Ignore localStorage errors
    }
    emitCollapseState(newState);
  };

  if (isCollapsed) {
    return (
      <>
        <button
          className={styles.floatingExpandButton}
          onClick={toggleCollapsed}
          aria-label="展开侧边栏"
          type="button"
        >
          <ChevronIcon rotated={true} />
        </button>
        {null}
      </>
    );
  }

  return (
    <>
      <aside className={clsx('col col--3', styles.sidebarColumn)}>
        <nav
          className={clsx(styles.sidebar, 'thin-scrollbar')}
          aria-label={translate({
            id: 'theme.blog.sidebar.navAriaLabel',
            message: 'Blog recent posts navigation',
            description: 'The ARIA label for recent posts in the blog sidebar',
          })}
        >
          <div
            className={clsx(styles.sidebarItemTitle, 'margin-bottom--md', styles.titleWithToggle)}
          >
            <span>{sidebar.title}</span>
            <button
              className={styles.toggleButton}
              onClick={toggleCollapsed}
              aria-label="折叠侧边栏"
              aria-expanded="true"
              type="button"
            >
              <ChevronIcon rotated={false} />
            </button>
          </div>
          <BlogSidebarContent
            items={items}
            ListComponent={ListComponent}
            yearGroupHeadingClassName={styles.yearGroupHeading}
          />
        </nav>
      </aside>
    </>
  );
}

export default memo(BlogSidebarDesktop);
