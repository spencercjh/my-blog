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

**目的**: 简化地点数据录入，复用已有坐标，并为新地点自动获取坐标。

**流程**:

1. 编辑 `src/data/places-source.yml` 添加新地点。
2. 填写必填字段 `name`、`firstVisitDate`，按需填写可选字段 `country`、`description`。
3. 运行 `npm run generate-places` 生成 `src/data/places.ts`。

**源记录字段**:

| 字段             | 类型   | 是否必填 | 说明                                                                                          |
| ---------------- | ------ | -------- | --------------------------------------------------------------------------------------------- |
| `name`           | string | 是       | 地点的显示名称。                                                                              |
| `firstVisitDate` | string | 是       | 初次访问日期，推荐使用 `YYYY-MM` 或 `YYYY-MM-DD`。                                            |
| `country`        | string | 否       | 有效的国家字段，例如 `中国`、`马来西亚`；优先用于生成结果，查询新坐标时也会传给地理编码函数。 |
| `description`    | string | 否       | 地点备注。                                                                                    |

**数据格式** (`places-source.yml`):

```yaml
- name: 上海市
  country: 中国
  firstVisitDate: '2024-05-01' # 或 '2024-05'（精确到月）
  description: 2024年5月上海之行

- name: 北京市
  firstVisitDate: '2023-10'
```

**生成规则**:

- 生成器按 `name` 与规范化后的 `firstVisitDate` 匹配已有 `places.ts` 记录，优先复用坐标，仅为未缓存的地点调用 OpenStreetMap Nominatim API。
- 国家按源记录的 `country`、已有记录的 `country`、地理编码结果的 `country` 的顺序取值。有效的 `country` 字段应保留。
- 查询新坐标时，若 `country` 在生成器的国家代码映射中有对应项，则使用 `countrycodes` 限定查询国家。
- `lat`、`lng` 属于 `places.ts` 的地图数据，不在源记录中配置。显示名称与实际定位点不同时，在源文件注释中记录定位点，并将确认后的坐标保存在 `places.ts` 中供后续生成复用。
- 常见城市名称会自动添加英文名称。

**Agent 审阅要求**:

- 审阅源记录字段时，核对 `src/scripts/generate-places.ts` 中的 `PlaceSource` 类型和 `resolvePlace` 实际读取逻辑。示例省略可选字段，不表示这些字段无效。
- `country` 是受支持的可选字段，不得仅因示例未包含该字段或坐标由生成器处理而要求删除。

**依赖**: js-yaml、tsx、prettier。

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

## Skills

> **注意**：Skills 需要手动安装到 `skills/` 目录。该目录已加入 `.gitignore`，不会被提交到 git。安装方式见各 skill 的说明。

### shuorenhua (说人话)

**安装方式**：

```bash
git clone https://github.com/MrGeDiao/shuorenhua.git skills/shuorenhua
```

用于检查和清理中文文本里的 AI 套路，让文本更自然、减少模板感。

**触发条件**：当用户说 "去 AI 味"、"说人话"、"自然一点"、"别像模板" 等类似需求时。

**Skill 文件位置**：`skills/shuorenhua/SKILL.md`

**使用方式**：

- 当涉及博客文章、文案、说明文本的改写时，参考 `skills/shuorenhua/SKILL.md` 中的指导原则
- 该 skill 包含详细的场景判断、问题分级（Tier 1/2/3）和改写档位（minimal/standard/aggressive）
- 参考文件位于 `skills/shuorenhua/references/` 目录，包含短语表、结构反模式、保护范围等内容
