const ZWSP = '​';
const MAX_DISCORD_COMMIT_MESSAGE_LENGTH = 50;

export function isMissingClosingBacktick(message: string) {
  // missing opening backtick if uneven count
  return Boolean(((message.match(/`/g) ?? []).length) % 2);
}

export function truncateMessage(message: string) {
  const truncatedMessageLength = (Array.from(message).length > MAX_DISCORD_COMMIT_MESSAGE_LENGTH)
    ? MAX_DISCORD_COMMIT_MESSAGE_LENGTH - '...'.length
    : MAX_DISCORD_COMMIT_MESSAGE_LENGTH;

  // use Array.from() to 'properly' count emojis
  // Discord doesn't address grapheme groups, so we won't
  return Array.from(message).slice(0, truncatedMessageLength).join('');
}

/**
 * Fixes unclosed inline code backticks after Discord message truncation.
 */
export function fixTruncatedInlineCode(message: string) {
  if (isMissingClosingBacktick(message)) message += '`';

  const discordTruncatedMessage = truncateMessage(message);

  if (!isMissingClosingBacktick(discordTruncatedMessage)) return message;

  const fixedTruncatedMessage = (/`.?$/.test(discordTruncatedMessage))
    // if the unclosed backtick is the very last character or the second to last character, push it back with space(s)
    // Discord doesn't render `` nicely, so we also need to account for the opening backtick being the second-to-last character too
    ? discordTruncatedMessage.replace(/(`.?)$/, match => {
      return `${' '.repeat(match.length)}${match}`;
    })
    // add ZWSP between inserted closing/reopening backticks
    : discordTruncatedMessage.replace(/(.)$/, '`' + ZWSP + '`$1');

  // apply fix
  return message.replace(discordTruncatedMessage, fixedTruncatedMessage);
}