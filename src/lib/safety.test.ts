import { describe, it, expect } from 'vitest';
import { checkVent, checkComment } from './safety';

describe('checkVent', () => {
  it('publishes ordinary vents untouched', () => {
    expect(checkVent('Work was exhausting today and my manager ignored me.')).toEqual({
      publish: true,
      safetyFlag: false,
      commentsEnabled: true,
      showSupportMessage: false,
    });
  });

  it('publishes low-severity distress without flagging it', () => {
    const result = checkVent('I feel hopeless and nothing feels right.');
    expect(result.publish).toBe(true);
    expect(result.safetyFlag).toBe(false);
    expect(result.showSupportMessage).toBe(false);
  });

  it('is case- and punctuation-insensitive when matching', () => {
    expect(checkVent('I FEEL HOPELESS!!!').publish).toBe(true);
    expect(checkVent("I feel hopeless...").safetyFlag).toBe(false);
  });

  it('withholds harassment from the feed rather than blocking the author', () => {
    const result = checkVent('you are pathetic and no one cares about you');
    expect(result.publish).toBe(false);
    expect(result.blockImmediately).toBeUndefined();
  });

  it('prefers the highest-severity intent when a vent matches several', () => {
    // "i feel hopeless" (low) and "you deserve this" (high) both match.
    expect(checkVent('i feel hopeless, you deserve this').publish).toBe(false);
  });

  it('does not match a pattern embedded in a longer word', () => {
    expect(checkVent('The buy nowhere campaign flopped.').publish).toBe(true);
  });

  it('treats empty input as publishable', () => {
    expect(checkVent('').publish).toBe(true);
  });

  // Owner's decision: self-harm risk vents stay private rather than publishing,
  // but keep the safety flag and the support message (see README.md).
  it('keeps self-harm risk private but flags it and shows support', () => {
    expect(checkVent('I want to die.')).toEqual({
      publish: false,
      safetyFlag: true,
      showSupportMessage: true,
    });
    expect(checkVent('i actually wanna kill myself ffs. anyone please tell how to die without pain')).toEqual({
      publish: false,
      safetyFlag: true,
      showSupportMessage: true,
    });
  });

  it('catches method-seeking and indirect self-harm language', () => {
    const support = { publish: false, safetyFlag: true, showSupportMessage: true };
    for (const text of [
      'suggest painless death methods please, cant take it no more', // reached the public feed before
      'How to die without it hurting?',
      "I can't take it anymore.",
      'Been feeling suicidal all week',
      "I want to end it all tonight",
      'Thinking about self-harm again',
      'Bas ab marna chahta hu yaar',
    ]) {
      expect(checkVent(text), text).toEqual(support);
    }
  });

  it('leaves everyday hyperbole alone', () => {
    for (const text of [
      'This exam is going to kill me lol, three chapters left.',
      "I'm dying to see that movie.",
      "I can't take my roommate's music much longer.",
      'I hurt my back at the gym.',
    ]) {
      expect(checkVent(text).publish, text).toBe(true);
    }
  });

  it('withholds harassment in a vent without the support message', () => {
    expect(checkVent('Honestly you are pathetic.')).toEqual({ publish: false });
  });
});

describe('checkComment', () => {
  it('publishes ordinary comments', () => {
    expect(checkComment('That sounds really hard, I hope tomorrow is lighter.')).toEqual({
      publish: true,
    });
  });

  it('publishes supportive comments', () => {
    expect(checkComment('you are not alone, i hear you').publish).toBe(true);
  });

  it('blocks self-harm encouragement and escalates toward a ban', () => {
    const result = checkComment('you should die');
    expect(result.publish).toBe(false);
    expect(result.blockImmediately).toBe(true);
    expect(result.incrementWarning).toBe(true);
    expect(result.autoBanAfterWarnings).toBe(2);
  });

  it('bans faster for self-harm instructions than for encouragement', () => {
    const instruction = checkComment('you should try this method');
    const encouragement = checkComment('go die');
    expect(instruction.autoBanAfterWarnings).toBe(1);
    expect(encouragement.autoBanAfterWarnings).toBe(2);
  });

  it('hides harassment and warns the author', () => {
    const result = checkComment('stop whining');
    expect(result.publish).toBe(false);
    expect(result.autoHide).toBe(true);
    expect(result.incrementWarning).toBe(true);
  });

  it('only applies vent-scoped intents to vents', () => {
    // `self_harm_expression` is vent-only, so the same text is inert as a comment.
    expect(checkComment('i feel numb')).toEqual({ publish: true });
  });
});
