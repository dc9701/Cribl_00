// targetDataReceived.test.js - Verify data received on the ‘Target’ nodes are correct.
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

describe('Verify Output File Content', () => {
  const inputPath = 'agent/inputs/large_1M_events.log';
  const outputPath0 = 'events.log';
  const outputPath1 = 'target_1.log';
  const outputPath2 = 'target_2.log';

  beforeAll(() => {
    // Delete the output & log files before running tests.
    [inputPath, outputPath0, outputPath1, outputPath2].forEach(function (file) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });

  it('Output file (events.log) should match original input file (large_1M_events.log)', async () => {
    try {
      // Wait for 'node app.js agent' to complete, then use diff to verify files (~30MB) are equal.
      await execPromise('node app.js agent');
      const { stdout, stderr } = await execPromise(`diff -u ${inputPath} ${outputPath0}`, { maxBuffer: 50 * 1024 * 1024 },)

    } catch (err) {
      throw new Error(`Error running appOutputFile.test: ${err.stderr || err.message}:\n. . .\n${err.stdout.slice(-5000)}`);
    }
  }, 30000); // Set 30 second timeout.
})
