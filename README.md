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

### Command Line Options

```
Options:
  -d, --dir <path>    Specify the git repository directory (default: current directory)
  -h, --help          Show this help message
```

Examples:

```bash
# Show help
pr-comments --help

# Check PR comments in a specific directory
pr-comments --dir /path/to/repo
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

## Using with LLM Tools

PR Comments CLI works great with AI coding assistants like Windsurf and Cursor. Here's how you can integrate it into your workflow:

### Windsurf Integration

When working with Windsurf, you can run PR Comments CLI to quickly see what feedback you need to address in your current PR. This allows you to:

1. View all unresolved comments in one place without switching context
2. Ask Windsurf to help you implement changes based on the PR feedback
3. Iterate on your code with AI assistance while addressing reviewer comments

### Cursor Integration

In Cursor, you can:

1. Run PR Comments CLI in the terminal to see all unresolved comments
2. Use Cursor's AI capabilities to help implement the suggested changes
3. Resolve comments directly from your editor after making the necessary changes

### General LLM Workflow

A typical workflow might look like:

1. Run `pr-comments` to see all unresolved feedback
2. Ask your AI assistant to help you understand and implement the suggested changes
3. Make the necessary code modifications with AI assistance
4. Run tests to ensure your changes work as expected
5. Push your changes and mark the comments as resolved

This workflow helps you leverage AI tools to more efficiently address code review feedback, improving both productivity and code quality.

## Requirements

- Node.js >= 14
- A GitHub repository with pull requests
- A GitHub Personal Access Token

## License

MIT
