// appCliArgv.test.js - Verify command-line argument processing, valid and invalid.
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { describe, it } = require('@jest/globals');
const allure = require('allure-js-commons');

/**
 * Unit Test Suite to verify command-line arguments.
 */
describe('Unit Tests', () => {
  allure.suite('Unit Tests');
  allure.label('testType', 'unit');
  /**
   * Test valid ARGVs (node app.js agent).
   * NOTE: To pass, splitter and target node(s) must be up.
   */
  it('Agent should run successfully if VALID ARGV ("agent") is passed', async () => {    
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

  /**
   * Test invalid ARGs (no args provided).
   */
  it('Agent should exit w/ status = 1 and display USAGE message if NO ARGV is passed', async () => {
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

  /**
   * Test invalid ARGs - Too many args (> 1).
   */
  it('Agent should exit w/ status = 1 and display USAGE message if MORE THAN ONE ARGV is passed', async () => {
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

  /**
   * Test invalid ARGs - Bad arg specified (bad_argv vs. agent|splitter|target).
   */
  it('Agent should exit w/ status = 1 and display ERROR message if INVALID ARGV is passed', async () => {
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

  /**
   * Delete the large output file spec'd in outputs.json (or 'events.log', by default), if it exists.
   */
  afterAll(() => {
    var data = fs.readFileSync('target/outputs.json');
    var json = JSON.parse(data);
    var filename = json.file || 'events.log';
    const outputFile = path.join(process.cwd(), filename);
    fs.unlink(outputFile, (err) => {
      if (err) {
        console.log(`No output file (${outputFile}) to delete; continuing...`);
      }
    });
  });

});
