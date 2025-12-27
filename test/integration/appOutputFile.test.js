// appOutputFile.test.js - Verify resultant output file (events.log) matches the original input file (large_1M_events.log).
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execPromise = promisify(exec);
const inputPath = 'agent/inputs/large_1M_events.log';
const outputPath = 'events.log';

describe('Verify Output File Content', () => {
  // Delete the output file if it exists before running tests.
  beforeEach(() => {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  });

  it('Output file (events.log) should match original input file (large_1M_events.log)', async () => {
    try {
      // Wait for 'node app.js agent' to complete.
      await execPromise('node app.js agent');

      // Use diffstat to verify files are equal, or summarize their diffs, if not equal.
      const { stdout, stderr } = await execPromise(`diff -u ${inputPath} ${outputPath} | diffstat`);
      expect(stdout).toContain('0 files changed');
      expect(stderr).toBe('');

    } catch (error) {
      throw new Error(`Error running appOutputFile.test: ${error.stderr || error.message}`);
    }
  }, 30000); // Set 30 second timeout.
})