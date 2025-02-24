# PR Comments CLI

A command-line tool to fetch and display unresolved GitHub PR comments for the current branch.

## Installation

```bash
npm install -g pr-comments-cli
```

## Setup

1. Create a GitHub Personal Access Token with `repo` scope at https://github.com/settings/tokens
2. Set the token in your environment:
   ```bash
   export GITHUB_TOKEN=your_token_here
   ```
   Or create a `.env` file in your project root:
   ```
   GITHUB_TOKEN=your_token_here
   ```

## Usage

Navigate to your git repository and run:

```bash
pr-comments
```

The tool will:
1. Detect your current branch
2. Find the associated pull request
3. Display all unresolved comments with their context

## Features

- Shows unresolved PR comments only
- Displays comment author and timestamp
- Shows file path and line numbers when available
- Includes diff context when available
- Works with GitHub repositories

## Requirements

- Node.js >= 14
- A GitHub repository with pull requests
- A GitHub Personal Access Token

## License

MIT
