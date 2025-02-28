# PR Comments CLI

A command-line tool to fetch and display unresolved GitHub PR comments for the current branch.  Super usefule for LLM software development workflows.  Or just to see a nice command line view of whats going on.

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

Simply ask Windsurf or Cursor to run `pr-comments` to get a list of all unresolved PR comments. and to organize and work through them


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
