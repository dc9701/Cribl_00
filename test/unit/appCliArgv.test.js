const { spawn } = require('child_process');
const assert = require('node:assert');
const test = require('node:test');

test('App should run successfully if VALID ARGV ("agent") is passed', (t, done) => {
  const child = spawn('node', ['app.js', 'agent']);
  let output = '';

  child.stdout.on('data', (data) => {
    output += data.toString();
  });

  child.on('close', (code) => {
    assert.strictEqual(code, 0);
    assert.match(output.trim(), /Working as agent/);
    done();
  });
});

test('App should exit w/ status = 1 and display USAGE message if NO ARGV is passed', (t, done) => {
  const child = spawn('node', ['app.js']);
  let output = '';

  child.stderr.on('data', (data) => {
    output += data.toString();
  });

  child.on('close', (code) => {
    assert.strictEqual(code, 1);
    assert.match(output.trim(), /Usage:/);
    done();
  });
});

test('App should exit w/ status = 1 and display USAGE message if MORE THAN ONE ARGV is passed', (t, done) => {
  const child = spawn('node', ['app.js', 'agent', 'agent']);
  let output = '';

  child.stderr.on('data', (data) => {
    output += data.toString();
  });

  child.on('close', (code) => {
    assert.strictEqual(code, 1);
    assert.match(output.trim(), /Usage:/);
    done();
  });
});

test('App should exit w/ status = 1 and display ERROR message if INVALID ARGV is passed', (t, done) => {
  const child = spawn('node', ['app.js', 'bad_argv']);
  let output = '';

  child.stderr.on('data', (data) => {
    output += data.toString();
  });

  child.on('close', (code) => {
    assert.strictEqual(code, 1);
    assert.match(output.trim(), /Make sure directory .* exists/);
    done();
  });
});
