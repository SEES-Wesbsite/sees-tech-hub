import test from 'node:test';
import assert from 'node:assert/strict';
import { DEADLINE_ISO, DEADLINE_MS, recruitmentState } from '../app/volunteer/recruitment.ts';

test('recruitment closes at 11:59 PM Lagos time, equivalent to 22:59 UTC', () => {
  assert.equal(new Date(DEADLINE_MS).toISOString(), '2026-10-18T22:59:00.000Z');
  assert.equal(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(DEADLINE_ISO)), 'Sunday 23:59');
});

test('countdown carries correctly through days, hours, minutes and seconds', () => {
  assert.deepEqual(recruitmentState(DEADLINE_MS - (86400 + 2 * 3600 + 3 * 60 + 4) * 1000), {
    closed: false, days: 1, hours: 2, minutes: 3, seconds: 4,
  });
  assert.deepEqual(recruitmentState(DEADLINE_MS - 86400000), {
    closed: false, days: 1, hours: 0, minutes: 0, seconds: 0,
  });
});

test('one millisecond before closing remains open; exact deadline and later close', () => {
  assert.deepEqual(recruitmentState(DEADLINE_MS - 1), {
    closed: false, days: 0, hours: 0, minutes: 0, seconds: 1,
  });
  for (const now of [DEADLINE_MS, DEADLINE_MS + 1, DEADLINE_MS + 86400000]) {
    assert.deepEqual(recruitmentState(now), { closed: true, days: 0, hours: 0, minutes: 0, seconds: 0 });
  }
});


test('both application CTAs and the timer render the correct open and closed states', async () => {
  const { readFileSync } = await import('node:fs');
  const { createRequire } = await import('node:module');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const ts = await import('typescript');
  const recruitment = await import('../app/volunteer/recruitment.ts');
  const require = createRequire(import.meta.url);
  // Compile the real client controls for server rendering; only CSS is replaced.
  const source = readFileSync(new URL('../app/volunteer/application-window.tsx', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const controls = {};
  const localRequire = (name) => name === './recruitment' ? recruitment
    : name.endsWith('.module.css') ? {} : require(name);
  new Function('require', 'exports', outputText)(localRequire, controls);
  const render = (now) => renderToStaticMarkup(createElement(controls.ApplicationWindow, { initialNow: now },
    createElement(controls.ApplicationStatus), createElement(controls.ApplyButton),
    createElement(controls.Countdown), createElement(controls.ApplyButton), createElement(controls.ClosingCopy)));

  const open = render(DEADLINE_MS - 1000);
  assert.equal(open.split('href="' + recruitment.APPLICATION_URL + '"').length - 1, 2);
  assert.match(open, /role="timer"/);
  for (const now of [DEADLINE_MS, DEADLINE_MS + 86400000]) {
    const closed = render(now);
    assert.equal((closed.match(/disabled=""/g) ?? []).length, 2);
    assert.doesNotMatch(closed, /role="timer"|href=/);
    assert.match(closed, /Applications Closed/);
  }
});
