import gitmojis from 'gitmojis';

export function resolveGitmojiCode(code: string) {
  const resolvedGitmoji = gitmojis.gitmojis.find(gitmoji => gitmoji.code === code);
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

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;
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

  describe('#resolveGitmojiCode', () => {
    it('resolves :technologist:', () => {
      expect(resolveGitmojiCode(':technologist:')).toBe('🧑‍💻');
    });
    it('resolves :art:', () => {
      expect(resolveGitmojiCode(':art:')).toBe('🎨');
    });
    it('resolves :fire:', () => {
      expect(resolveGitmojiCode(':fire:')).toBe('🔥');
    });
    it('doesn\'t resolve :shrug:', () => {
      expect(resolveGitmojiCode(':shrug:')).toBe(':shrug:');
    });
    it('doesn\'t resolve feat: :fire: remove file', () => {
      expect(resolveGitmojiCode('feat: :fire: remove file')).toBe('feat: :fire: remove file');
    });
  });
}