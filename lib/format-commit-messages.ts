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

const MAX_DISCORD_COMMIT_MESSAGE_LENGTH = 50;

export function formatCommitMessages(body: NextApiRequest['body']) {
  if (!hasCommits(body)) return body;

  body.commits.map(commit => {
    // remove inline code backticks only if cutoff
    const discordTruncatedMessage = commit.message.slice(0, MAX_DISCORD_COMMIT_MESSAGE_LENGTH);
    // missing opening backtick if uneven count
    const isMissingClosingBacktick = Boolean(((discordTruncatedMessage.match(/`/g) ?? []).length) % 2);

    if (isMissingClosingBacktick) {
      // add ellipsis and close the last backtick
      commit.message = commit.message.replace(/(.{4})$/, '...``$1');
    }

    // resolve gitmoji codes to the emoji itself (reduce characters)
    const gitmojiCode = commit.message.match(/(:[\w_]+:)/)?.[1];
    if (!gitmojiCode) return commit;

    commit.message = commit.message.replace(gitmojiCode, resolveGitmojiCode(gitmojiCode));

    return commit;
  });

  return body;
}