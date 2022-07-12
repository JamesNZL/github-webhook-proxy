import { describe, it, expect } from 'vitest';

import { isMissingClosingBacktick, fixTruncatedInlineCode } from './fix-truncated-inline-code';

const ZWSP = '​';

describe('#isMissingClosingBacktick', () => {
  it.each(
    [
      ['awdhuiawdh', false],
      ['`', true],
      ['awdiajwidi`awdiawidajwd', true],
      ['im missing a backti`ck', true],
      ['`im closed!`', false],
      ['', false],
      ['true`', true],
      ['``', false],
      ['string`2`false', false],
      ['string`open`closed`open`closed`open', true],
      ['string`open`closed`open`closed`open`', false],
      ['string`open`closed`open', true],
      ['string`open`closed`open`closed', false],
    ],
  )('returns whether a string has an even number of backticks', (string, expected) => {
    expect(isMissingClosingBacktick(string)).toBe(expected);
  });
});

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
    expect(isMissingClosingBacktick(fixed)).toBe(false);
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
      // <47>`<2>` = total length 51, truncated <47>|`XX` => <47>|`XX`
      ['X'.repeat(47) + addBackticks('X'.repeat(2)), 'X'.repeat(47) + addBackticks('XX')],
      // <48>`<2>` = total length 52, truncated <48>`X|X` => <47>|X`XX`
      ['X'.repeat(48) + addBackticks('X'.repeat(2)), 'X'.repeat(47) + 'X' + addBackticks('XX')],
      // <49>`<2>` = total length 53, truncated <49>`|XX` => <47>|XX`XX`
      ['X'.repeat(49) + addBackticks('X'.repeat(2)), 'X'.repeat(47) + 'XX' + addBackticks('XX')],
      // <50>`<2>` = total length 54, truncated <50>|`XX` => <47>|XXX`XX`
      ['X'.repeat(50) + addBackticks('X'.repeat(2)), 'X'.repeat(47) + 'XXX' + addBackticks('XX')],
    ],
  )('correctly truncates opening backticks', (message, expected) => {
    const fixed = fixTruncatedInlineCode(message);

    expect(fixed).toBe(expected);

    // must not contain ``
    expect(fixed).not.toContain('``');

    // must have an even number of backticks in the first 50 characters
    expect(isMissingClosingBacktick(fixed)).toBe(false);
  });

  it.each(
    [
      // <38>`<6>` = total length 46, not truncated
      ['X'.repeat(38) + addBackticks('X'.repeat(6)), 'X'.repeat(38) + addBackticks('X'.repeat(6))],
      // <39>`<6>` = total length 47 not truncated
      ['X'.repeat(39) + addBackticks('X'.repeat(6)), 'X'.repeat(39) + addBackticks('X'.repeat(6))],
      // <40>`<6>` = total length 48, not truncated
      ['X'.repeat(40) + addBackticks('X'.repeat(6)), 'X'.repeat(40) + addBackticks('X'.repeat(6))],
      // <41>`<6>` = total length 49, not truncated
      ['X'.repeat(41) + addBackticks('X'.repeat(6)), 'X'.repeat(41) + addBackticks('X'.repeat(6))],
      // <42>`<6>` = total length 50, not truncated
      ['X'.repeat(42) + addBackticks('X'.repeat(6)), 'X'.repeat(42) + addBackticks('X'.repeat(6))],
      // <43>`<6>` = total length 51, truncated <43>`XXX|XXX` => <43>`XX`|`XXXX`
      ['X'.repeat(43) + addBackticks('X'.repeat(6)), 'X'.repeat(43) + addBackticks('XX') + ZWSP + addBackticks('XXXX')],
      // <44>`<6>` = total length 52, truncated <44>`XX|XXXX` => <44>`X`|`XXXXX`
      ['X'.repeat(44) + addBackticks('X'.repeat(6)), 'X'.repeat(44) + addBackticks('X') + ZWSP + addBackticks('XXXXX')],
      // <45>`<6>` = total length 53, truncated <45>`X|XXXXX` => <45>  |`XXXXXX`
      ['X'.repeat(45) + addBackticks('X'.repeat(6)), 'X'.repeat(45) + '  ' + addBackticks('XXXXXX')],
      // <46>`<6>` = total length 54, truncated <46>`|XXXXXX` => <46> |`XXXXXX`
      ['X'.repeat(46) + addBackticks('X'.repeat(6)), 'X'.repeat(46) + ' ' + addBackticks('XXXXXX')],
      // <47>`<6>` = total length 55, truncated <47>|`XXXXXX` => <47>|`XXXXXX`
      ['X'.repeat(47) + addBackticks('X'.repeat(6)), 'X'.repeat(47) + addBackticks('XXXXXX')],
      // <48>`<6>` = total length 56, truncated <47>|X`XXXXXX` => <47>|X`XXXXXX`
      ['X'.repeat(48) + addBackticks('X'.repeat(6)), 'X'.repeat(47) + 'X' + addBackticks('XXXXXX')],
    ],
  )('correctly truncates opening backticks', (message, expected) => {
    const fixed = fixTruncatedInlineCode(message);

    expect(fixed).toBe(expected);

    // must not contain ``
    expect(fixed).not.toContain('``');

    // must have an even number of backticks in the first 50 characters
    expect(isMissingClosingBacktick(fixed)).toBe(false);
  });

  it.each(
    [
      ['whoops, `i forgot to close this', 'whoops, `i forgot to close this`'],
      // <9>`<36> = total length 46, not truncated
      ['X'.repeat(9) + '`' + 'X'.repeat(36), 'X'.repeat(9) + addBackticks('X'.repeat(36))],
      // <10>`<36> = total length 47, not truncated
      ['X'.repeat(10) + '`' + 'X'.repeat(36), 'X'.repeat(10) + addBackticks('X'.repeat(36))],
      // <11>`<36> = total length 48, not truncated
      ['X'.repeat(11) + '`' + 'X'.repeat(36), 'X'.repeat(11) + addBackticks('X'.repeat(36))],
      // <12>`<36> = total length 49, not truncated
      ['X'.repeat(12) + '`' + 'X'.repeat(36), 'X'.repeat(12) + addBackticks('X'.repeat(36))],
      // <13>`<36> = total length 50, not truncated, but added backtick will make total 51
      // therefore truncated <13>`<32>`|`<4>`
      ['X'.repeat(13) + '`' + 'X'.repeat(36), 'X'.repeat(13) + addBackticks('X'.repeat(32)) + ZWSP + addBackticks('X'.repeat(4))],
      // <14>`<36> = total length 51, truncated <14>`<31>`|`<5>`
      ['X'.repeat(14) + '`' + 'X'.repeat(36), 'X'.repeat(14) + addBackticks('X'.repeat(31)) + ZWSP + addBackticks('X'.repeat(5))],
      // <15>`<36> = total length 52, truncated <15>`<30>`|`<6>`
      ['X'.repeat(15) + '`' + 'X'.repeat(36), 'X'.repeat(15) + addBackticks('X'.repeat(30)) + ZWSP + addBackticks('X'.repeat(6))],
      // <16>`<36> = total length 53, truncated <16>`<29>`|`<7>`
      ['X'.repeat(16) + '`' + 'X'.repeat(36), 'X'.repeat(16) + addBackticks('X'.repeat(29)) + ZWSP + addBackticks('X'.repeat(7))],
      // <20>`<36> = total length 57, truncated <20>`<25>`|`<11>`
      ['X'.repeat(20) + '`' + 'X'.repeat(36), 'X'.repeat(20) + addBackticks('X'.repeat(25)) + ZWSP + addBackticks('X'.repeat(11))],
      // correctly closed backticks in the first 50 characters, but unclosed after that
      ['X'.repeat(51) + '`' + 'X'.repeat(36), 'X'.repeat(51) + addBackticks('X'.repeat(36))],
    ],
  )('closes unclosed code blocks', (message, expected) => {
    const fixed = fixTruncatedInlineCode(message);

    expect(fixed).toBe(expected);

    // must not contain ``
    expect(fixed).not.toContain('``');

    // must have an even number of backticks in the first 50 characters
    expect(isMissingClosingBacktick(fixed)).toBe(false);
  });
});