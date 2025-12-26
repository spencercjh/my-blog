import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

let copyright = `Copyright © ${new Date().getFullYear()} by <a href="https://github.com/spencercjh" target="_blank">@spencercjh</a> is licensed under <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_black">CC BY-NC 4.0</a>. Built with Docusaurus.`;
const config: Config = {
  title: "spencercjh's blog",
  tagline: 'Dinosaurs are cool',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://spencercjh.me',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'spencercjh', // Usually your GitHub org/user name.
  projectName: 'my-blog', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: false,
        blog: {
          blogSidebarCount: 'ALL',
          showReadingTime: true,
          readingTime: ({ content, frontMatter, defaultReadingTime }) =>
            defaultReadingTime({
              locale: 'zh-Hans',
              content,
              frontMatter,
              options: { wordsPerMinute: 1000 },
            }),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/spencercjh/my-blog/tree/main',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
          feedOptions: {
            type: 'all',
            title: "spencercjh's blog",
            description: 'feedId:190258116822410240+userId:163433656836464640',
            copyright: copyright,
          },
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownImages: 'throw',
    },
  },

  plugins: ['docusaurus-plugin-zooming'],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      hideOnScroll: true,
      title: 'spencercjh',
      logo: {
        alt: "spencercjh's blog logo",
        src: 'img/logo.svg',
      },
      items: [
        { to: '/blog', label: 'Blog', position: 'left' },
        { to: '/blog/tags', label: 'Tags', position: 'left' },
      ],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 5,
    },
    footer: {
      style: 'dark',
      copyright: copyright,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    zooming: {
      selector: '.markdown img',
      delay: 500,
      background: {
        light: 'rgba(101,108,133,0.8)',
        dark: 'rgba(9,10,17,0.8)',
      },
      options: {
        // See the docs of zooming for all available options: https://github.com/francoischalifour/medium-zoom#usage
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
