import type { NextApiRequest } from 'next';

import { resolveGitmojiCode } from './resolve-gitmoji-code';

interface HasCommits {
  commits: Commit[];
}

interface Commit {
  id: string;
  tree_id: string;
  distinct: boolean;
  message: string;
  timestamp: string;
  url: string;
  author: Author;
  committer: Committer;
  added: string[];
  removed: string[];
  modified: string[];
}

interface Author {
  name: string;
  email: string;
  username: string;
}

interface Committer {
  name: string;
  email: string;
  username: string;
}

function hasCommits(body: NextApiRequest['body']): body is HasCommits {
  return (body && 'commits' in body);
}

export function formatCommitMessages(body: NextApiRequest['body']) {
  if (!hasCommits(body)) return body;

  body.commits.map(commit => {
    // remove inline code backticks
    commit.message = commit.message.replace(/`/g, '');

    // resolve gitmoji codes to the emoji itself (reduce characters)
    const gitmojiCode = commit.message.match(/(:[\w_]+:)/)?.[1];
    if (!gitmojiCode) return commit;

    commit.message = commit.message.replace(gitmojiCode, resolveGitmojiCode(gitmojiCode));

    return commit;
  });

  return body;
}