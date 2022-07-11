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

/**
 * Fixes unclosed inline code backticks after Discord message truncation.
 */
function fixTruncatedInlineCode(message: string) {
  const MAX_DISCORD_COMMIT_MESSAGE_LENGTH = 50;

  const discordTruncatedMessage = message.slice(0, MAX_DISCORD_COMMIT_MESSAGE_LENGTH);
  // missing opening backtick if uneven count
  const isMissingClosingBacktick = Boolean(((discordTruncatedMessage.match(/`/g) ?? []).length) % 2);

  if (!isMissingClosingBacktick) return message;

  // close the last backtick
  return message.replace(discordTruncatedMessage, discordTruncatedMessage.replace(/(.{1})$/, '``$1'));
}

/**
 * Resolves recognised gitmojis codes to their emoji characters, to minimise Discord truncation.
 */
function resolveGitmojiToEmoji(message: string) {
  // resolve gitmoji codes to the emoji itself (reduce characters)
  const gitmojiCode = message.match(/(:[\w_]+:)/)?.[1];
  if (!gitmojiCode) return message;

  return message.replace(gitmojiCode, resolveGitmojiCode(gitmojiCode));
}

export function formatCommitMessages(body: NextApiRequest['body']) {
  if (!hasCommits(body)) return body;

  body.commits.map(commit => {
    commit.message = resolveGitmojiToEmoji(commit.message);
    commit.message = fixTruncatedInlineCode(commit.message);
    return commit;
  });

  return body;
}