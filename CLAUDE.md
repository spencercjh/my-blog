# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with Docusaurus 3.7.0, configured for Chinese content (zh-Hans). The blog focuses on technical content, particularly chaos engineering, Kubernetes, and open-source development experiences.

## Development Commands

### Core Development

- `yarn start` - Start local development server with hot reload
- `yarn build` - Build static content for production
- `yarn serve` - Serve the built site locally
- `yarn clear` - Clear Docusaurus cache

### Content Management

- `yarn typecheck` - Run TypeScript type checking
- `yarn write-translations` - Generate translation files
- `yarn write-heading-ids` - Generate heading IDs for anchors

### Deployment

- `USE_SSH=true yarn deploy` - Deploy using SSH to GitHub Pages
- `GIT_USER=<username> yarn deploy` - Deploy without SSH to GitHub Pages

### Code Quality

- Linting and formatting handled by Husky with lint-staged
- Prettier formats all files on commit
- Markdown files are processed with `md-padding` package

## Architecture

### Docusaurus Configuration

- Main config: `docusaurus.config.ts`
- Blog-only configuration (docs disabled)
- Mermaid diagrams enabled via `@docusaurus/theme-mermaid`
- Chinese localization with `zh-Hans` locale
- Custom CSS theme in `src/css/custom.css`

### Content Structure

- **Blog posts**: `blog/` directory with date-based folders
- **Assets**: Static images and media in `blog/*/assets/` subdirectories
- **Multi-part series**: Blog posts can reference related posts via links
- **Tags and authors**: Managed via `blog/tags.yml` and `blog/authors.yml`
- **Blog frontmatter** includes title, description, slug, tags, and authors

### Key Features

- Reading time calculation (custom 1000 words/minute)
- GitHub edit links pointing to main branch
- Mermaid diagram support in markdown
- Prism syntax highlighting with GitHub/Dracula themes
- Table of contents with configurable heading levels

### Customization

- Homepage: Custom React component in `src/pages/index.tsx`
- Styling: CSS modules and custom CSS in `src/`
- Components: Reusable components in `src/components/`

## Development Notes

### Blog Post Organization

- Each blog post is in its own directory named with date prefix
- Multi-article series should be organized with clear cross-references
- Assets should be organized within each article's `assets/` folder

### Build Process

- TypeScript compilation for type safety
- Static site generation optimized for GitHub Pages
- Production ready with proper meta tags and SEO configuration

### Git Workflow

- Main branch: `main`
- Production deployment from `main` to `gh-pages`
- Edit URLs point to `main` branch for easy content updates
