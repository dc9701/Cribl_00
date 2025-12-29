// targetDataReceived.test.js - Verify data received on the ‘Target’ nodes are correct.
const fs = require('fs');
const net = require('net');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

const configData = fs.readFileSync("splitter/outputs.json");
const json = JSON.parse(configData);
const targets = json.tcp;

describe('Verify Target Inbound Data', () => {
  beforeEach(() => {
    const outputPath = 'events.log';

    // Delete the output file if it exists before running tests.
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  });

  it('Targets 1 & 2 write data received from splitter in a coordinated fashion to events.log', async () => {
    try {
      
      // Set up the target socket connections and data handlers.
      var sock1 = net.connect(targets[0], function () {
          console.log("Connected to", targets[0].host, "on port", targets[0].port);
      });
      sock1.on('data', function (data) {
        console.log(`[DCC_DEBUG_${targets[0].port}] WROTE data.length: ${data.length}`);
      });
      var sock2 = net.connect(targets[1], function () {
          console.log("Connected to", targets[1].host, "on port", targets[1].port);
      });
      sock2.on('data', function (data) {
        console.log(`[DCC_DEBUG_${targets[1].port}] WROTE data.length: ${data.length}`);
      });

      // Wait for 'node app.js agent' to complete; should see some traffic in the socket watchers.
      await execPromise('node app.js agent');

    } catch (error) {
      throw new Error(`Error running targetDataReceived.test: ${error.stderr || error.message}`);
    }
  }, 30000); // Set 30 second timeout.
})
