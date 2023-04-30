import type { NextApiRequest } from 'next';

import { fixTruncatedInlineCode } from './fix-truncated-inline-code';
import { resolveGitmojiToEmoji } from './resolve-gitmoji-code';

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

  const transformations = [resolveGitmojiToEmoji, fixTruncatedInlineCode];

  body.commits = body.commits.map(commit => {
    const res = transformations.reduce((commit, transformation) => {
      commit.message = transformation(commit.message);
      return commit;
    }, commit);

    return res;
  });

  return body;
}