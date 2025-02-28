#!/usr/bin/env node

import { exec } from 'child_process'
import { fileURLToPath } from 'url'
import { promisify } from 'util'
import { highlight } from 'cli-highlight'
import { existsSync } from 'fs'
import path from 'path'
import arg from 'arg'

import { config } from 'dotenv'

// Load environment variables from .env file
config()

const execAsync = promisify(exec)

interface PRComment {
  id: number
  body: string
  user: {
    login: string
  }
  created_at: string
  updated_at: string
  path?: string // File path
  line?: number // Line number
  start_line?: number // Start line for multi-line comments
  end_line?: number // End line for multi-line comments
  commit_id: string // Commit SHA
  diff_hunk?: string // The diff context
  isResolved?: boolean // Whether the comment is resolved
}

interface ReviewThread {
  isResolved: boolean
  comments: {
    nodes: {
      id: string
      body: string
      createdAt: string
      updatedAt: string
      path?: string
      position?: number
      originalPosition?: number
      commit: {
        oid: string
      }
      author: {
        login: string
      }
      diffHunk?: string
    }[]
  }
}

// Parse command line arguments
function parseArgs() {
  try {
    const args = arg({
      // Types
      '--dir': String,
      '--help': Boolean,
      
      // Aliases
      '-d': '--dir',
      '-h': '--help',
    })
    
    if (args['--help']) {
      console.log(`
PR Comments CLI

Usage:
  pr-comments [options]

Options:
  -d, --dir <path>    Specify the git repository directory (default: current directory)
  -h, --help          Show this help message
      `)
      process.exit(0)
    }
    
    let directory = process.cwd()
    
    if (args['--dir']) {
      const dirPath = path.resolve(args['--dir'])
      if (existsSync(dirPath)) {
        directory = dirPath
      } else {
        console.error(`Error: Directory not found: ${dirPath}`)
        process.exit(1)
      }
    }
    
    return { directory }
  } catch (err: any) {
    // arg library throws errors with specific properties
    if (err.code === 'ARG_UNKNOWN_OPTION' && err.unknown) {
      console.error(`Error: Unknown option: ${err.unknown}`)
    } else {
      console.error(`Error: ${err.message || 'Unknown error'}`)
    }
    process.exit(1)
  }
}

async function getCurrentBranch(directory: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`git -C "${directory}" rev-parse --abbrev-ref HEAD`)
    return stdout.trim()
  } catch {
    throw new Error('Failed to get current branch name')
  }
}

async function getPRComments(directory: string): Promise<PRComment[]> {
  try {
    // Get current branch
    const branch = await getCurrentBranch(directory)

    // Get repository info from git remote
    const { stdout: remoteUrl } = await execAsync(`git -C "${directory}" config --get remote.origin.url`)
    const repoPath = remoteUrl
      .trim()
      .replace('git@github.com:', '')
      .replace('.git', '')
      .replace('https://github.com/', '')

    const [owner, repo] = repoPath.split('/')

    if (!process.env.GITHUB_TOKEN) {
      throw new Error(
        'Authentication required. Please set GITHUB_TOKEN environment variable.\n' +
          'You can create one at https://github.com/settings/tokens\n' +
          'The token needs "repo" scope to access repository data.'
      )
    }

    // GraphQL query to get PR comments with resolution status
    const query = `
      query($owner: String!, $repo: String!, $branch: String!) {
        repository(owner: $owner, name: $repo) {
          pullRequests(first: 1, headRefName: $branch) {
            nodes {
              reviewThreads(first: 100) {
                nodes {
                  isResolved
                  comments(first: 100) {
                    nodes {
                      id
                      body
                      createdAt
                      updatedAt
                      path
                      position
                      originalPosition
                      commit {
                        oid
                      }
                      author {
                        login
                      }
                      diffHunk
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const graphqlResponse = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { owner, repo, branch },
      }),
    })

    if (!graphqlResponse.ok) {
      throw new Error(`GitHub GraphQL API request failed: ${graphqlResponse.statusText}`)
    }

    const data = await graphqlResponse.json()

    if (data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`)
    }

    const pr = data.data?.repository?.pullRequests?.nodes?.[0]
    if (!pr) {
      return []
    }

    // Transform and filter comments
    const comments: PRComment[] = pr.reviewThreads.nodes
      .filter((thread: ReviewThread) => !thread.isResolved)
      .flatMap((thread: ReviewThread) =>
        thread.comments.nodes.map((comment) => ({
          id: parseInt(comment.id),
          body: comment.body,
          user: {
            login: comment.author.login,
          },
          created_at: comment.createdAt,
          updated_at: comment.updatedAt,
          path: comment.path,
          line: comment.position || comment.originalPosition,
          commit_id: comment.commit.oid,
          diff_hunk: comment.diffHunk,
          isResolved: false,
        }))
      )

    return comments
  } catch {
    throw new Error('An unknown error occurred while fetching PR comments')
  }
}

// Main function for CLI usage
async function main() {
  try {
    const { directory } = parseArgs()
    const comments = await getPRComments(directory)

    if (comments.length === 0) {
      console.log("No comments found for the current branch's PR.")
      process.exit(0)
    }

    // Print comments in a formatted way
    console.log('\nPR Comments:\n')
    comments.forEach((comment, index) => {
      console.log(`Comment #${index + 1}`)
      console.log(`Author: ${comment.user.login}`)
      console.log(`Date: ${new Date(comment.created_at).toLocaleString()}`)

      // Add file and line context if available
      if (comment.path) {
        console.log(`File: ${comment.path}`)
        if (comment.start_line && comment.end_line) {
          console.log(`Lines: ${comment.start_line}-${comment.end_line}`)
        } else if (comment.line) {
          console.log(`Line: ${comment.line}`)
        }

        // Show diff context if available
        if (comment.diff_hunk) {
          console.log('Context:')
          
          // Determine language from file extension
          const fileExt = comment.path.split('.').pop() || ''
          const language = fileExt || 'diff'
          
          // Apply syntax highlighting
          const highlightedCode = highlight(comment.diff_hunk, { language })
          console.log(highlightedCode)
        }
      }

      console.log('─'.repeat(50))
      console.log(comment.body)
      console.log('─'.repeat(50))
      console.log() // Empty line between comments
    })
  } catch (err: any) {
    console.error('Error:', err.message || 'Unknown error')
    process.exit(1)
  }
}

// Only run the main function if this is the main module
const isMainModule = import.meta.url === `file://${fileURLToPath(import.meta.url)}`

if (isMainModule) {
  main()
}

// Export functions for programmatic use if needed
export { getCurrentBranch, getPRComments, type PRComment }
