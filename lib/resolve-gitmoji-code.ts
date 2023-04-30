import { gitmojis } from 'gitmojis';

export function resolveGitmojiCode(code: string) {
  const resolvedGitmoji = gitmojis.find(gitmoji => gitmoji.code === code);
  if (!resolvedGitmoji) return code;

  return resolvedGitmoji.emoji;
}

/**
 * Resolves recognised gitmojis codes to their emoji characters, to minimise Discord truncation.
 */
export function resolveGitmojiToEmoji(message: string) {
  // resolve gitmoji codes to the emoji itself (reduce characters)
  const gitmojiCode = message.match(/(:[\w_]+:)/)?.[1];
  if (!gitmojiCode) return message;

  return message.replace(gitmojiCode, resolveGitmojiCode(gitmojiCode));
}