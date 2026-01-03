"use strict";
exports.__esModule = true;
var fs = require('fs');
var net = require('net');
function writeToSocket(data, remoteSocket, localSocket) {
    var flushed = remoteSocket.write(data);
    if (!flushed) {
        // We could not write to one of the targets
        localSocket.pause();
    }
}
/**
 * Intercept stream from splitter node to target node(s) and write chunk size to log file.
 * @param {*} monNum Monitor/target node # (1|2).
 */
function monitor(monNum) {
    console.log("working as monitor");
    var data = fs.readFileSync("monitor/outputs.json");
    var json = JSON.parse(data);
    var targets = json.tcp;
    var outputfile = json.logs[monNum - 1].file;
    console.log("targets", targets);
    console.log("outputfile", outputfile);
    var data = fs.readFileSync("monitor/inputs.json");
    var json = JSON.parse(data);
    var port = json.tcp;
    var chunks = 1;
    // Create new log file.
    if (fs.existsSync(outputfile)) {
        fs.unlinkSync(outputfile);
    }
    fs.appendFileSync(outputfile, `"target","chunk","bytes"\n`, function () {
        console.log("outputfile:", outputfile);
    });
    var server = net.createServer(function (localSocket) {
        console.log("client connected");
        var outSocks = [];
        console.log('processing ', targets[monNum - 1]);

        var sock = net.createConnection(targets[monNum - 1], function () {
            console.log("Connected to ", targets[monNum - 1]);
        });
        sock.on('end', function () {
            console.error('Disconnected', targets[monNum - 1]);
        });
        outSocks.push(sock);
        sock.on('drain', function () {
            localSocket.resume();
        });
        localSocket.on('data', function (data) {
            // Pass-thru data and log chunk size.
            writeToSocket(data, outSocks[0], localSocket);
            var log = `"target_${monNum}",${chunks++},${data.length}`
            fs.appendFile(outputfile, `${log}\n`, function () {
                // console.log(`[MONITOR] ${log}`);
            });
        });
    });
    server.listen(port, function () {
        console.log("App listening on port", port);
    });
}
// For debugging
var os = require('os');
console.log("My hostname is: " + os.hostname());
if (process.argv.length != 3) {
    console.error("Usage: " + process.argv0 + " " + process.argv[1] + " <config_dir>");
    process.exit(1);
}
var monitor_id = process.argv[2];
try {
    switch (monitor_id) {
        case '1':
        case '2':
            monitor(monitor_id);
            break;
        default:
            console.log("Usage: ", process.argv[0], process.argv[1], "1|2");
            console.warn("Cannot understand app argument", process.argv);
            process.exit(1);
    }
}
catch (err) {
    console.log("Usage: ", process.argv[0], process.argv[1], "1|2");
    console.error("Encountered error", err);
}
