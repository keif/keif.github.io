# Keith's Blog 📝

[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
[![MIT License](https://img.shields.io/github/license/satnaing/astro-paper?color=%232F3741&style=for-the-badge)](LICENSE)

A developer's blog built on the AstroPaper theme, featuring automatic date management, modern tooling, and a focus on developer experience.

## 🔥 Features

### Blog Features

- [x] Type-safe markdown with frontmatter validation
- [x] **Automatic date management** with Git hooks
- [x] Interactive post creation with CLI tools
- [x] Draft posts & pagination support
- [x] Fuzzy search functionality
- [x] Dynamic OG image generation
- [x] RSS feed & sitemap generation

### Developer Experience

- [x] **Pre-commit hooks** for automatic date updates
- [x] Modern tooling (ESLint, Prettier, Husky, lint-staged)
- [x] Cross-platform compatibility (macOS/Linux/Windows)
- [x] CLI tools for post management
- [x] TypeScript support throughout

### Performance & Accessibility

- [x] Super fast performance (Lighthouse 100)
- [x] Responsive design (mobile to desktop)
- [x] Accessible (Keyboard/VoiceOver tested)
- [x] SEO-friendly with meta tags
- [x] Light & dark mode support

## 🚀 Quick Start

### Creating New Posts

```bash
# Interactive mode - prompts for all details
pnpm new-post

# Command line mode
pnpm new-post "My Post Title" --tags "javascript,tutorial" --featured --published
```

### Managing Post Dates

Dates are automatically managed via Git hooks, but you can also run manually:

```bash
# Update dates for changed files
pnpm update-dates

# Force update all posts
pnpm update-dates:force

# Preview changes without writing
pnpm update-dates --dry-run
```

For more details, see [Date Management Documentation](docs/DATE_MANAGEMENT.md).

## 🚀 Project Structure

```bash
/
├── .husky/                  # Git hooks for automation
│   └── pre-commit          # Automatic date management
├── docs/                   # Documentation
│   └── DATE_MANAGEMENT.md  # Date system docs
├── public/                 # Static assets
│   ├── assets/
│   └── pagefind/           # Generated search index
├── scripts/                # Automation scripts
│   ├── new-post.js         # Post creation CLI
│   └── update-post-dates.js # Date management
├── src/
│   ├── components/         # Reusable UI components
│   ├── data/
│   │   └── blog/           # Blog posts (markdown)
│   ├── layouts/            # Page layouts
│   ├── pages/              # Astro pages/routes
│   ├── styles/             # Global styles
│   └── utils/              # Helper functions
├── date-manager.config.json # Optional config
├── .lintstagedrc           # Lint-staged config
└── package.json            # Dependencies & scripts
```

### Key Directories:

- **Blog posts**: `src/data/blog/` - All markdown blog posts
- **Scripts**: `scripts/` - CLI tools for post management
- **Documentation**: `docs/` - Project documentation

## 📖 Documentation

### Blog Management

- **[Date Management System](docs/DATE_MANAGEMENT.md)** - Automatic date management with Git hooks
- **[Theme Configuration](src/data/blog/how-to-configure-astropaper-theme.md)** - Customize the blog theme
- **[Adding Posts](src/data/blog/adding-new-post.md)** - Manual post creation guide
- **[Color Schemes](src/data/blog/customizing-astropaper-theme-color-schemes.md)** - Customize colors and themes

## 💻 Tech Stack

### Core

**Framework** - [Astro](https://astro.build/) - Static site generation  
**Language** - [TypeScript](https://www.typescriptlang.org/) - Type safety  
**Styling** - [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS  
**Package Manager** - [pnpm](https://pnpm.io/) - Fast, efficient package management

### Developer Tools

**Linting** - [ESLint](https://eslint.org) - Code quality  
**Formatting** - [Prettier](https://prettier.io/) - Code formatting  
**Git Hooks** - [Husky](https://typicode.github.io/husky/) - Pre-commit automation  
**Staged Files** - [lint-staged](https://github.com/okonet/lint-staged) - Run linters on staged files

### Content & Search

**Frontmatter** - [gray-matter](https://github.com/jonschlinkert/gray-matter) - Parse markdown frontmatter  
**YAML Processing** - [yaml](https://www.npmjs.com/package/yaml) - YAML parsing and generation  
**Search** - [Pagefind](https://pagefind.app/) - Static search  
**Icons** - [Tabler Icons](https://tabler-icons.io/) - Clean SVG icons

### CLI & Automation

**Interactive Prompts** - [prompts](https://github.com/terkelg/prompts) - CLI user input  
**Date Management** - Custom scripts with Git integration  
**Post Creation** - Interactive and command-line post generation

## 👨🏻‍💻 Development Setup

Clone and set up the project:

```bash
# Clone the repository
git clone https://github.com/your-username/keif.github.io.git
cd keif.github.io

# Install dependencies
pnpm install

# Set up Git hooks
npx husky init

# Start development server
pnpm dev
```

The blog will be available at `http://localhost:4321`.

## 🔧 Configuration

### Environment Variables

```bash
# .env (optional)
PUBLIC_GOOGLE_SITE_VERIFICATION=your-google-site-verification-value
```

### Date Manager Configuration

Customize the date management system by creating `date-manager.config.json`:

```json
{
    "contentGlob": "src/data/blog/**/*.{md,mdx}",
    "defaultAuthor": "Your Name",
    "blogDir": "src/data/blog"
}
```

## 🧞 Available Commands

### Development

| Command        | Action                               |
| -------------- | ------------------------------------ |
| `pnpm install` | Install dependencies                 |
| `pnpm dev`     | Start dev server at `localhost:4321` |
| `pnpm build`   | Build for production to `./dist/`    |
| `pnpm preview` | Preview production build locally     |

### Blog Management

| Command                                                | Action                               |
| ------------------------------------------------------ | ------------------------------------ |
| `pnpm new-post`                                        | Create a new blog post (interactive) |
| `pnpm new-post "Title" --published --tags "tag1,tag2"` | Create post with CLI args            |
| `pnpm update-dates`                                    | Update dates for changed files       |
| `pnpm update-dates:force`                              | Update dates for all posts           |
| `pnpm update-dates --dry-run`                          | Preview date changes                 |

### Code Quality

| Command             | Action                              |
| ------------------- | ----------------------------------- |
| `pnpm format:check` | Check code format with Prettier     |
| `pnpm format`       | Format code with Prettier           |
| `pnpm lint`         | Lint code with ESLint               |
| `pnpm sync`         | Generate TypeScript types for Astro |

## 🎯 Key Enhancements

This blog setup includes several enhancements over the standard AstroPaper theme:

### Automatic Date Management

- **Pre-commit hooks** automatically update `modDatetime` when posts are modified
- **New posts** automatically get `pubDatetime` set during creation
- **ISO 8601 format** with milliseconds for precise timestamps
- **Cross-platform** support (Windows, macOS, Linux)

### Developer Experience

- **Interactive CLI** for creating posts with prompts
- **Command-line flags** for automated post creation
- **Dry-run mode** to preview changes before applying
- **Modern tooling** with ESLint, Prettier, Husky, and lint-staged

### Workflow Integration

- **Git hooks** ensure dates are always current
- **Lint-staged** keeps code clean on commit
- **Type safety** throughout with TypeScript
- **Comprehensive documentation** for all features

## 📜 License

Licensed under the MIT License, Copyright © 2025

---

Built on [AstroPaper](https://github.com/satnaing/astro-paper) by [Sat Naing](https://satnaing.dev) 👨🏻‍💻  
Enhanced with automatic date management and modern developer tooling.
