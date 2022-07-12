import gitmojis from 'gitmojis';

export function resolveGitmojiCode(code: string) {
  const resolvedGitmoji = gitmojis.gitmojis.find(gitmoji => gitmoji.code === code);
  if (!resolvedGitmoji) return code;

  return resolvedGitmoji.emoji;
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;
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