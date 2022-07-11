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

  const truncatedMessageLength = (message.length > MAX_DISCORD_COMMIT_MESSAGE_LENGTH)
    ? MAX_DISCORD_COMMIT_MESSAGE_LENGTH - '...'.length
    : MAX_DISCORD_COMMIT_MESSAGE_LENGTH;

  // use use Array.from() to 'properly' count emojis
  // Discord doesn't address grapheme groups, so we won't
  const discordTruncatedMessage = Array.from(message).slice(0, truncatedMessageLength).join('');
  // missing opening backtick if uneven count
  const isMissingClosingBacktick = Boolean(((discordTruncatedMessage.match(/`/g) ?? []).length) % 2);

  if (!isMissingClosingBacktick) return message;

  const fixedTruncatedMessage = (/`$/.test(discordTruncatedMessage))
    // if the unclosed backtick is the very last character, push it back with a space
    ? discordTruncatedMessage.replace(/(.)$/, ' $1')
    : discordTruncatedMessage.replace(/(.)$/, '``$1');

  // close the last backtick
  return message.replace(discordTruncatedMessage, fixedTruncatedMessage);
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