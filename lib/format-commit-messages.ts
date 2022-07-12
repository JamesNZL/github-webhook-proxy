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

const ZWSP = '​';

/**
 * Fixes unclosed inline code backticks after Discord message truncation.
 */
function fixTruncatedInlineCode(message: string) {
  const MAX_DISCORD_COMMIT_MESSAGE_LENGTH = 50;

  const truncatedMessageLength = (message.length > MAX_DISCORD_COMMIT_MESSAGE_LENGTH)
    ? MAX_DISCORD_COMMIT_MESSAGE_LENGTH - '...'.length
    : MAX_DISCORD_COMMIT_MESSAGE_LENGTH;

  // use Array.from() to 'properly' count emojis
  // Discord doesn't address grapheme groups, so we won't
  const discordTruncatedMessage = Array.from(message).slice(0, truncatedMessageLength).join('');
  // missing opening backtick if uneven count
  const isMissingClosingBacktick = Boolean(((discordTruncatedMessage.match(/`/g) ?? []).length) % 2);

  if (!isMissingClosingBacktick) return message;

  const fixedTruncatedMessage = (/`.?$/.test(discordTruncatedMessage))
    // if the unclosed backtick is the very last character or the second to last character, push it back with space(s)
    // Discord doesn't render `` nicely, so we also need to account for the opening backtick being the second-to-last character too
    ? discordTruncatedMessage.replace(/(`.?)$/, match => {
      return `${' '.repeat(match.length)}${match}`;
    })
    // add ZWSP between inserted closing/reopening backticks
    : discordTruncatedMessage.replace(/(.)$/, '`' + ZWSP + '`$1');

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

  body.commits = body.commits.map(commit => {
    commit.message = resolveGitmojiToEmoji(commit.message);
    commit.message = fixTruncatedInlineCode(commit.message);
    return commit;
  });

  return body;
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;
  describe('#fixTruncatedInlineCode', () => {
    it('ignores short commits', () => {
      expect(fixTruncatedInlineCode('feat: short commit')).toBe('feat: short commit');
      expect(fixTruncatedInlineCode('feat: :technologist: `short inline`')).toBe('feat: :technologist: `short inline`');
    });

    it('ignores long commits with no inline code', () => {
      expect(fixTruncatedInlineCode('feat: long commit'.repeat(20))).toBe('feat: long commit'.repeat(20));
    });

    function addBackticks(string: string) {
      return '`' + string + '`';
    }

    it.each(
      [
        // total length 46, not truncated by Discord
        [addBackticks('X'.repeat(44)), addBackticks('X'.repeat(44))],
        // total length 47, not truncated by Discord
        [addBackticks('X'.repeat(45)), addBackticks('X'.repeat(45))],
        // total length 48, not truncated by Discord
        [addBackticks('X'.repeat(46)), addBackticks('X'.repeat(46))],
        // total length 49, not truncated by Discord
        [addBackticks('X'.repeat(47)), addBackticks('X'.repeat(47))],
        // total length 50, not truncated by Discord
        [addBackticks('X'.repeat(48)), addBackticks('X'.repeat(48))],
        // total length 51, truncated by Discord
        [addBackticks('X'.repeat(49)), addBackticks('X'.repeat(45)) + ZWSP + addBackticks('X'.repeat(4))],
        // total length 52, truncated by Discord
        [addBackticks('X'.repeat(50)), addBackticks('X'.repeat(45)) + ZWSP + addBackticks('X'.repeat(5))],
        // total length 53, truncated by Discord
        [addBackticks('X'.repeat(51)), addBackticks('X'.repeat(45)) + ZWSP + addBackticks('X'.repeat(6))],
        // total length 54, truncated by Discord
        [addBackticks('X'.repeat(52)), addBackticks('X'.repeat(45)) + ZWSP + addBackticks('X'.repeat(7))],
      ],
    )('correctly appends truncated backticks', (message, expected) => {
      const fixed = fixTruncatedInlineCode(message);

      expect(fixed).toBe(expected);

      // must not contain ``
      expect(fixed).not.toContain('``');

      // must have an even number of backticks in the first 50 characters
      const isMissingClosingBacktick = Boolean(((fixed.match(/`/g) ?? []).length) % 2);
      expect(isMissingClosingBacktick).toBe(false);
    });

    it.each(
      [
        // <42>`<2>` = total length 46, not truncated
        ['X'.repeat(42) + addBackticks('X'.repeat(2)), 'X'.repeat(42) + addBackticks('X'.repeat(2))],
        // <43>`<2>` = total length 47 not truncated
        ['X'.repeat(43) + addBackticks('X'.repeat(2)), 'X'.repeat(43) + addBackticks('X'.repeat(2))],
        // <44>`<2>` = total length 48, not truncated
        ['X'.repeat(44) + addBackticks('X'.repeat(2)), 'X'.repeat(44) + addBackticks('X'.repeat(2))],
        // <45>`<2>` = total length 49, not truncated
        ['X'.repeat(45) + addBackticks('X'.repeat(2)), 'X'.repeat(45) + addBackticks('X'.repeat(2))],
        // <46>`<2>` = total length 50, not truncated
        ['X'.repeat(46) + addBackticks('X'.repeat(2)), 'X'.repeat(46) + addBackticks('X'.repeat(2))],
        // <47>`<2>` = total length 51, truncated <47>`XX|` => <47>`X`|`X`
        ['X'.repeat(47) + addBackticks('X'.repeat(2)), 'X'.repeat(47) + addBackticks('X') + ZWSP + addBackticks('X')],
        // <48>`<2>` = total length 52, truncated <48>`X|X` => <48>  |`XX`
        ['X'.repeat(48) + addBackticks('X'.repeat(2)), 'X'.repeat(48) + '  ' + addBackticks('XX')],
        // <49>`<2>` = total length 53, truncated <49>`|XX` => <49> |`XX`
        ['X'.repeat(49) + addBackticks('X'.repeat(2)), 'X'.repeat(49) + ' ' + addBackticks('XX')],
        // <50>`<2>` = total length 54, truncated <50>|`XX` => <50>|`XX`
        ['X'.repeat(50) + addBackticks('X'.repeat(2)), 'X'.repeat(50) + addBackticks('XX')],
      ],
    )('correctly truncates opening backticks', (message, expected) => {
      const fixed = fixTruncatedInlineCode(message);

      expect(fixed).toBe(expected);

      // must not contain ``
      expect(fixed).not.toContain('``');

      // must have an even number of backticks in the first 50 characters
      const isMissingClosingBacktick = Boolean(((fixed.match(/`/g) ?? []).length) % 2);
      expect(isMissingClosingBacktick).toBe(false);
    });
  });

  describe('#resolveGitmojiToEmoji', () => {
    it('resolves :technologist:', () => {
      expect(resolveGitmojiToEmoji('feat: :technologist: remove file')).toContain('🧑‍💻');
      expect(resolveGitmojiToEmoji('feat: :technologist: remove file')).not.toContain(':technologist:');
    });

    it('resolves :art:', () => {
      expect(resolveGitmojiToEmoji('feat: :art: remove file')).toContain('🎨');
      expect(resolveGitmojiToEmoji('feat: :art: remove file')).not.toContain(':art:');
    });

    it('resolves :fire:', () => {
      expect(resolveGitmojiToEmoji('feat: :fire: remove file')).toContain('🔥');
      expect(resolveGitmojiToEmoji('feat: :fire: remove file')).not.toContain(':fire:');
    });

    it('doesn\'t resolve :shrug:', () => {
      expect(resolveGitmojiToEmoji('feat: :shrug: remove file')).toContain(':shrug:');
    });
  });
}