// targetDataReceived.test.js - Verify data received on the ‘Target’ nodes are correct.
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);
const { describe, expect, it } = require('@jest/globals');

describe('Verify output file content and data received on target nodes', () => {
  var data = fs.readFileSync("agent/inputs.json");
  var json = JSON.parse(data);
  const inputPath = 'agent/' + json.monitor;
  data = fs.readFileSync("target/outputs.json");
  json = JSON.parse(data);
  const outputPath = outputfile = json.file;
  data = fs.readFileSync("monitor/outputs.json");
  json = JSON.parse(data);
  const logPath1 = json.logs[0].file;
  const logPath2 = json.logs[1].file;

  beforeEach(() => {
    // Delete the output & log files before running tests.
    [outputPath, logPath1, logPath2].forEach(function (file) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });

  it('Output file (events.log) should match original input file (large_1M_events.log)', async () => {
    try {
      // Wait for 'node app.js agent' to complete, then use diff to verify files (~30MB) are equal.
      await execPromise('node app.js agent');
      const { stdout, stderr } = await execPromise(`diff -u ${inputPath} ${outputPath}`, { maxBuffer: 64 * 1024 * 1024 },)

    } catch (err) {
      throw new Error(`Error running appOutputFile.test: ${err.stderr || err.message}:\n. . .\n${err.stdout.slice(-2000)}`);
    }
  }, 30000); // Set 30 second timeout.

  it('Verify data received on target nodes has been split correctly', async () => {
    try {
      // Wait for 'node app.js agent' to complete, then verify target data received.
      await execPromise('node app.js agent');
      const { sameNumberChunks, allChunksTotal64K, goodChunksList } = await verifyTargetDataReceived(logPath1, logPath2);

      if (goodChunksList.length && !(sameNumberChunks && allChunksTotal64K)) {
        console.log('The targetDataReceived.test has these passing data:');
        goodChunksList.forEach(function (chunk) {
          console.log(`  Chunk #${chunk[0].chunk}: ${chunk[0].target} = ${chunk[0].bytes} bytes; ${chunk[1].target} = ${chunk[1].bytes} bytes`);
        });          
      }
      console.log('Verify target_1 & target_2 both have the same number of chunks written...');
      expect(sameNumberChunks).toBe(true);
      console.log('Verify all chunks total 64K between target_1 & target_2...');
      expect(allChunksTotal64K).toBe(true);

    } catch (err) {
      throw new Error(`Error running targetDataReceived.test: ${err.stderr || err.message}`);
    }
  });
});

async function verifyTargetDataReceived(logPath1, logPath2) {
  var sameNumberChunks = false;
  var allChunksTotal64K = true;
  var goodChunksList = [];

  var log1 = parse(fs.readFileSync(logPath1), { columns: true });
  var log2 = parse(fs.readFileSync(logPath2), { columns: true });
  
  // Logs files have same # lines, +/- 1 line.
  sameNumberChunks = Math.abs(log1.length - log2.length) < 2;

  // Iterate all rows looking for those totalling 64K across log1 & log2, and which follow the proper small/large, large/small pattern.
  for (let i = 0; i < Math.min(log1.length, log2.length); i++) {
    const log1chunk = log1[i];
    const log2chunk = log2[i];

    // Compare chunk #i if found in both logs.
    if (log1chunk && log2chunk) {
      const chunksTotal64K = (log1chunk.bytes + log2chunk.bytes === 64 * 1024);      
      const log1orderOK = (log1chunk.bytes % 2) ? (log1chunk.bytes < 30) : (log1chunk.bytes > 30);
      const log2orderOK = (log2chunk.bytes % 2) ? (log2chunk.bytes > 30) : (log2chunk.bytes < 30);

      // Save to goodChunksList if current chunks total 64K and match the expected split pattern (small/large).
      if (chunksTotal64K && log1orderOK && log2orderOK) {
        goodChunksList.push([{target: log1chunk.target, chunk: log1chunk.chunk, bytes: log1chunk.bytes}, {target: log2chunk.target, chunk: log2chunk.chunk, bytes: log2chunk.bytes}]);
      }
      // Set to false once we find a line that does NOT total 65536 between log1 & log2.
      allChunksTotal64K = allChunksTotal64K && chunksTotal64K;
    }
  }
  return { sameNumberChunks, allChunksTotal64K, goodChunksList };
}
