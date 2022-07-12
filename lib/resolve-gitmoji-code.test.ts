import { describe, it, expect } from 'vitest';

import { resolveGitmojiCode, resolveGitmojiToEmoji } from './resolve-gitmoji-code';

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
