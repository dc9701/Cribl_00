// appOutputFile.test.js - Verify resultant output file (events.log) matches the original input file (large_1M_events.log).
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

describe('Verify Output File Content', () => {
  const inputPath = 'agent/inputs/large_1M_events.log';
  const outputPath = 'events.log';

  beforeEach(() => {
    // Delete the output file if it exists before running tests.
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  });

  it('Output file (events.log) should match original input file (large_1M_events.log)', async () => {
    try {
      // Wait for 'node app.js agent' to complete, then use diff to verify files (~30MB) are equal.
      await execPromise('node app.js agent');
      const { stdout, stderr } = await execPromise(`diff -u ${inputPath} ${outputPath}`, { maxBuffer: 50 * 1024 * 1024 },)

    } catch (err) {
      throw new Error(`Error running appOutputFile.test: ${err.stderr || err.message}:\n. . .\n${err.stdout.slice(-2000)}`);
    }
  }, 30000); // Set 30 second timeout.
})
