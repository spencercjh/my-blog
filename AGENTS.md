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
- `npm run generate-places` - Generate places.ts data from places-source.yml

### Places Data Entry Workflow

**目的**: 简化地点数据录入，自动获取坐标。

**流程**:

1. 编辑 `src/data/places-source.yml` 添加新地点
2. 只需输入: 名称(name)、访问日期(visitedDate)、备注(description)
3. 运行 `npm run generate-places` 自动生成坐标和 places.ts

**数据格式** (places-source.yml):

```yaml
- name: 上海市
  firstVisitDate: 2024-05-01
  description: 2024年5月上海之行

- name: 北京市
  firstVisitDate: 2023-10-15
```

**说明**:

- 坐标通过 OpenStreetMap Nominatim API 自动获取（免费，无需 API Key）
- 常见城市名称会自动添加英文名称
- 生成的 places.ts 包含完整坐标数据，可直接使用
- 避免手动查找坐标，减少错误

**依赖**: js-yaml, @types/js-yaml, ts-node

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
- **DCO (Developer Certificate of Origin)**: This project requires DCO compliance for all commits
  - **ALWAYS use `-s` flag when committing**: `git commit -m "message" -s`
  - This automatically adds the `Signed-off-by: Author Name <author@email>` line
  - Example:
    ```bash
    git commit -m "feat: add new feature" -s
    ```
  - This results in commit message:

    ```
    feat: add new feature

    Signed-off-by: Author Name <author@email>
    ```

  - **DO NOT manually add Signed-off-by lines** - let git handle it with `-s` flag
  - This requirement applies to all commits, including those made by agents

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
