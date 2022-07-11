import gitmojis from 'gitmojis';

export function resolveGitmojiCode(code: string) {
  const resolvedGitmoji = gitmojis.gitmojis.find(gitmoji => gitmoji.code === code);
  if (!resolvedGitmoji) return code;

  return resolvedGitmoji.emoji;
}