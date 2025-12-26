// appOutputFile.test.js - Verify resultant output file (events.log) matches the original input file (large_1M_events.log).
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execFilePromise = promisify(execFile);
const inputPath = path.resolve('agent/inputs/large_1M_events.log');
const outputPath = path.resolve('events.log');

describe('Verify Output File Content', () => {
  // Delete the output file if it exists before running tests.
  beforeEach(() => {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  });

  test('Output file (events.log) should match original input file (large_1M_events.log)', async () => {
    try {
      // Wait for "node app.js agent" to complete.
      await execFilePromise('node', ['app.js', 'agent']);

      // Verify the output file content matches original input file.
      expect(fs.existsSync(inputPath)).toBe(true);
      const inputFileContent = fs.readFileSync(inputPath, 'utf-8');
      expect(fs.existsSync(outputPath)).toBe(true);
      const outputFileContent = fs.readFileSync(outputPath, 'utf-8');
      expect(outputFileContent.trim()).toBe(inputFileContent.trim());

    } catch (error) {
      throw new Error(`Error running appOutputFile.test: ${error.stderr || error.message}`);
    }
  });
})
