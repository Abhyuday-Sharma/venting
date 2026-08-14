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

  // Documents current behaviour, which looks unintended: the medium-severity
  // `self_harm_risk` intent defines publish:true + safetyFlag + support message,
  // but the severity short-circuit in checkVent discards that action.
  // See the note in README.md; change this test if the short-circuit is fixed.
  it('currently drops the safety action for medium-severity self-harm risk', () => {
    expect(checkVent('I want to die.')).toEqual({ publish: false });
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
