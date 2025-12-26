# AGENTS.md

This file provides guidance to LLM agent when working with code in this repository.

## Project Overview

This is a personal blog built with Docusaurus 3.7.0, configured for Chinese language content (zh-Hans). The site is deployed automatically to Cloudflare for both feature branches and main branch.

## Common Commands

### Development

- `npm install` - Install dependencies (requires Node.js >= 18.0)
- `npm run start` - Start development server with hot reload
- `npm run serve` - Serve production build locally
- `npm run typecheck` - Run TypeScript type checking

### Building & Deployment

- `npm run build` - Build static site to `build/` directory
- `npm run clear` - Clear Docusaurus cache
- `npm run deploy` - Deploy to GitHub Pages (if configured)

### Content Management

- `make md-padding` - Format all Markdown files using md-padding tool
- `make list-md` - List all Markdown files that will be processed
- `npm run write-translations` - Generate translation files
- `npm run write-heading-ids` - Add heading IDs to markdown files

## Architecture & Structure

### Core Configuration

- **Main config**: `docusaurus.config.ts` - Primary Docusaurus configuration with site metadata, theme settings, and plugin configuration
- **TypeScript**: Uses `@docusaurus/tsconfig` with base URL set to project root
- **Localization**: Configured for Chinese (zh-Hans) as default and only locale

### Content Architecture

- **Blog-only site**: Documents feature disabled (`docs: false`), focuses solely on blog content
- **Blog structure**: Multi-part articles supported via subdirectories (e.g., `blog/2025-05-09-bcm-engine/`)
- **Authors**: Centrally managed in `blog/authors.yml` with social links and metadata
- **Tags**: Centrally defined in `blog/tags.yml` with descriptions and permalinks
- **Custom reading time**: Set to 1000 words per minute for Chinese content

### Theming & Features

- **Mermaid support**: Enabled via `@docusaurus/theme-mermaid` for diagram rendering
- **Dual themes**: GitHub (light) and Dracula (dark) Prism themes
- **Table of contents**: Configured for heading levels 2-5
- **Edit links**: Point to GitHub repository main branch

### Development Workflow

- **Pre-commit hooks**: Husky configured to run lint-staged
- **Linting pipeline**:
  1. `md-padding` for Markdown files
  2. `prettier --write --ignore-unknown` for all files
- **File exclusions**: `.docusaurus/` and `build/` directories excluded from TypeScript compilation

### Content Guidelines

- Blog posts support frontmatter with title, description, slug, tags, authors, and table of contents settings
- Multi-part series can be structured as subdirectories with cross-references
- Use `<!-- truncate -->` comment to define excerpt boundaries
- Images and static assets go in `static/` directory

### Deployment Notes

- Site URL: `https://spencercjh.me`
- Automatic deployment configured for Cloudflare
- GitHub organization: `spencercjh`
- Edit URLs point to GitHub repository for content collaboration
