#!/usr/bin/env node
/**
 * Unit tests for helpers.mjs. Run with:
 *   node --test .agents/skills/agent-workflow-protocol/scripts/helpers.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  makeRunId,
  parseDuration,
  utcPlus,
  utcEpoch,
  leaseComment,
  failureComment,
  isTrusted,
  markersOf,
  leaseState,
  failures,
  openFindings,
  readySha,
  shepherdAttempts,
  LEGACY_STEP_NAMES,
} from './helpers.mjs';

describe('parseDuration', () => {
  it('parses long form', () => {
    assert.deepEqual(parseDuration('1 hour'), { sign: 1, parts: [{ n: 1, unit: 'hour' }] });
    assert.deepEqual(parseDuration('3 hours'), { sign: 1, parts: [{ n: 3, unit: 'hour' }] });
    assert.deepEqual(parseDuration('14 days'), { sign: 1, parts: [{ n: 14, unit: 'day' }] });
  });

  it('parses short form', () => {
    assert.deepEqual(parseDuration('1h'), { sign: 1, parts: [{ n: 1, unit: 'hour' }] });
    assert.deepEqual(parseDuration('30m'), { sign: 1, parts: [{ n: 30, unit: 'minute' }] });
    assert.deepEqual(parseDuration('2d'), { sign: 1, parts: [{ n: 2, unit: 'day' }] });
    assert.deepEqual(parseDuration('45s'), { sign: 1, parts: [{ n: 45, unit: 'second' }] });
  });

  it('parses ISO 8601', () => {
    assert.deepEqual(parseDuration('PT1H'), { sign: 1, parts: [{ n: 1, unit: 'hour' }] });
    assert.deepEqual(parseDuration('P1D'), { sign: 1, parts: [{ n: 1, unit: 'day' }] });
    assert.deepEqual(parseDuration('PT30M'), { sign: 1, parts: [{ n: 30, unit: 'minute' }] });
  });

  it('honours leading sign', () => {
    assert.equal(parseDuration('-1 hour').sign, -1);
    assert.equal(parseDuration('+30m').sign, 1);
  });

  it('rejects unsupported input', () => {
    assert.throws(() => parseDuration('forever'), /unsupported duration/);
  });
});

describe('utcPlus / utcEpoch', () => {
  const fixed = new Date('2026-10-15T12:00:00.000Z');

  it('adds hours and returns Z ISO', () => {
    assert.equal(utcPlus('1 hour', fixed), '2026-10-15T13:00:00Z');
    assert.equal(utcPlus('+2h', fixed), '2026-10-15T14:00:00Z');
  });

  it('subtracts durations', () => {
    assert.equal(utcPlus('-1 day', fixed), '2026-10-14T12:00:00Z');
  });

  it('utcEpoch parses Z and bare timestamps as UTC', () => {
    assert.equal(utcEpoch('2026-10-15T12:00:00Z'), Math.floor(fixed.getTime() / 1000));
    assert.equal(utcEpoch('2026-10-15T12:00:00'), Math.floor(fixed.getTime() / 1000));
  });

  it('rejects bad timestamps', () => {
    assert.throws(() => utcEpoch('not-a-date'), /bad timestamp/);
  });
});

describe('makeRunId', () => {
  it('formats stamp-runner', () => {
    const id = makeRunId('grok', new Date('2026-10-15T13:47:00.000Z'));
    assert.equal(id, '20261015T134700Z-grok');
  });

  it('sanitises runner names', () => {
    const id = makeRunId('My Runner!', new Date('2026-10-15T00:00:00.000Z'));
    assert.match(id, /Z-My-Runner$/);
  });
});

describe('comment shapes', () => {
  it('leaseComment claim and renew', () => {
    const claim = leaseComment('Triaging', 'run1', '2026-10-15T14:00:00Z');
    assert.match(claim.body, /^Claimed by Triaging run run1 until/);
    assert.match(claim.marker, /agent:lease step=Triaging run=run1 expires=2026-10-15T14:00:00Z/);

    const renew = leaseComment('Triaging', 'run1', '2026-10-15T15:00:00Z', 'renew');
    assert.match(renew.body, /^Lease renewed by Triaging/);
  });

  it('failureComment', () => {
    const f = failureComment('Triaging', 'run1', 'timeout');
    assert.match(f.body, /Triaging run run1 failed: timeout/);
    assert.match(f.marker, /agent:failure step=Triaging run=run1/);
  });
});

describe('isTrusted / markersOf / leaseState', () => {
  const owner = { author_association: 'OWNER', user: { login: 'alice' }, body: '<!-- agent:lease step=Triaging run=r1 expires=2099-01-01T00:00:00Z -->' };
  const outsider = { author_association: 'NONE', user: { login: 'bot' }, body: '<!-- agent:lease step=Triaging run=r2 expires=2099-01-01T00:00:00Z -->' };

  it('trusts OWNER/MEMBER/COLLABORATOR', () => {
    assert.equal(isTrusted(owner), true);
    assert.equal(isTrusted({ authorAssociation: 'MEMBER', author: { login: 'x' } }), true);
    assert.equal(isTrusted(outsider), false);
  });

  it('trusts selfLogin and trustedAuthors', () => {
    assert.equal(isTrusted(outsider, { selfLogin: 'bot' }), true);
    assert.equal(isTrusted(outsider, { trustedAuthors: ['bot'] }), true);
  });

  it('markersOf only from trusted comments', () => {
    const markers = markersOf([owner, outsider], {});
    assert.equal(markers.length, 1);
    assert.match(markers[0], /run=r1/);
  });

  it('leaseState reports live when not expired', () => {
    const state = leaseState([owner], {}, new Date('2026-10-15T00:00:00Z'));
    assert.equal(state.expires, '2099-01-01T00:00:00Z');
    assert.equal(state.live, true);
  });

  it('leaseState reports not live when expired', () => {
    const expired = {
      author_association: 'OWNER',
      user: { login: 'alice' },
      body: '<!-- agent:lease step=Triaging run=r1 expires=2020-01-01T00:00:00Z -->',
    };
    const state = leaseState([expired], {}, new Date('2026-10-15T00:00:00Z'));
    assert.equal(state.live, false);
  });
});

describe('failures / openFindings / readySha / shepherdAttempts', () => {
  it('failures counts step and legacy name, resets on escalate', () => {
    assert.equal(LEGACY_STEP_NAMES.Triaging, 'Grooming');
    const markers = [
      '<!-- agent:failure step=Grooming run=old -->',
      '<!-- agent:failure step=Triaging run=r1 -->',
      '<!-- agent:escalate -->',
      '<!-- agent:failure step=Triaging run=r2 -->',
    ];
    assert.equal(failures(markers, 'Triaging'), 1);
  });

  it('openFindings tracks review handoffs', () => {
    const markers = [
      '<!-- agent:handoff kind=review open=3 -->',
      '<!-- agent:attempt step=shepherding -->',
    ];
    assert.equal(openFindings(markers), 0);
    assert.equal(openFindings(['<!-- agent:handoff kind=review open=2 -->']), 2);
  });

  it('readySha returns newest ready sha', () => {
    const markers = [
      '<!-- agent:handoff kind=ready sha=aaa -->',
      '<!-- agent:handoff kind=ready sha=bbbccc -->',
    ];
    assert.equal(readySha(markers), 'bbbccc');
  });

  it('shepherdAttempts resets on any handoff', () => {
    const markers = [
      '<!-- agent:attempt step=shepherding -->',
      '<!-- agent:attempt step=shepherding -->',
      '<!-- agent:handoff kind=review -->',
      '<!-- agent:attempt step=shepherding -->',
    ];
    assert.equal(shepherdAttempts(markers), 1);
  });
});
