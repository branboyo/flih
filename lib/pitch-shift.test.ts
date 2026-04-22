import { describe, it, expect } from 'vitest';
import { computePitchScale } from './pitch-shift';

describe('computePitchScale', () => {
  it('returns 1.0 for 0 semitones, 0 cents', () => {
    expect(computePitchScale(0, 0)).toBeCloseTo(1.0, 6);
  });

  it('returns 2.0 for +12 semitones (one octave up)', () => {
    expect(computePitchScale(12, 0)).toBeCloseTo(2.0, 4);
  });

  it('returns 0.5 for -12 semitones (one octave down)', () => {
    expect(computePitchScale(-12, 0)).toBeCloseTo(0.5, 4);
  });

  it('+100 cents equals +1 semitone', () => {
    expect(computePitchScale(0, 100)).toBeCloseTo(computePitchScale(1, 0), 6);
  });

  it('-100 cents equals -1 semitone', () => {
    expect(computePitchScale(0, -100)).toBeCloseTo(computePitchScale(-1, 0), 6);
  });

  it('combines semitones and cents additively', () => {
    // +3 semitones +50 cents = +3.5 semitones
    expect(computePitchScale(3, 50)).toBeCloseTo(
      Math.pow(2, 3.5 / 12),
      6,
    );
  });
});
