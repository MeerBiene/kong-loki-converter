const http = require("http");
const https = require("https");

const port = process.env.PORT || 8000;
const loki_hostname = process.env.LOKI_HOSTNAME || "";
const loki_path = process.env.LOKI_PATH || "/loki/api/v1/push";
// key value seperator in the log line
const seperator = process.env.SEPERATOR || "=";
const flattenedObjectSeperator = process.env.FLATTENED_OBJECT_SEPERATOR || "_";

let propertyToUseAsLabel = process.env.LABEL_PROPERTY || "workspace";
let propertyToRedact = process.env.REDACT_PROPERTY || "api_key";

// making sure properties that we want to label
// are in an array so our logic works without
// 1600 typeof() calls
if (
  typeof propertyToUseAsLabel === "string" &&
  propertyToUseAsLabel.includes(",")
) {
  // https://stackoverflow.com/a/34904446/18079883
  propertyToUseAsLabel = propertyToUseAsLabel.split(/\s*,\s*/);
  console.log("Labeling after these properties:");
  console.log(propertyToUseAsLabel);
} else {
  propertyToUseAsLabel = [propertyToUseAsLabel];
}

// and again for the properties we want to exclude
if (typeof propertyToRedact === "string" && propertyToRedact.includes(",")) {
  // https://stackoverflow.com/a/34904446/18079883
  propertyToRedact = propertyToRedact.split(/\s*,\s*/);
  console.log("Censoring these properties:");
  console.log(propertyToRedact);
} else {
  propertyToRedact = [propertyToRedact];
}

if (loki_hostname === "") {
  console.log("Loki Hostname not provided, exiting ...");
  process.exit(1);
}

// kindly stolen from https://www.geeksforgeeks.org/flatten-javascript-objects-into-a-single-depth-object/
const flattenObj = (ob) => {
  // The object which contains the
  // final result
  let result = {};

  // loop through the object "ob"
  for (const i in ob) {
    // We check the type of the i using
    // typeof() function and recursively
    // call the function again
    if (
      typeof ob[i] === "object" &&
      !Array.isArray(ob[i]) &&
      !propertyToRedact.includes(ob[i])
    ) {
      const temp = flattenObj(ob[i]);
      for (const j in temp) {
        // Store temp in result
        result[i + flattenedObjectSeperator + j] = temp[j];
      }
    }

    // Else store ob[i] in result directly
    else if (!Array.isArray(ob[i]) && !propertyToRedact.includes(ob[i])) {
      result[i] = ob[i];
    }
  }
  return result;
};

// kindly stolen from https://stackoverflow.com/a/5612876/18079883
const objToString = (obj) =>
  Object.entries(obj).reduce((str, [p, val]) => {
    return `${str}${p}${seperator}${val} `;
  }, "");

const requestHandler = (req, res) => {
  let data = "";
  req.on("data", (chunk) => {
    data += chunk;
  });
  req.on("end", () => {
    const flattened = flattenObj(JSON.parse(data));
    const streamObject = {};

    propertyToUseAsLabel.forEach((prop) => {
      if (flattened.hasOwnProperty(prop)) {
        streamObject[prop] = flattened[prop];
      }
    });
    const payload = {
      streams: [
        {
          stream: streamObject,
          values: [
            [`${Date.now() * 1000 * 1000}`, `${objToString(flattened)}`],
          ],
        },
      ],
    };

    const JSONPayload = JSON.stringify(payload);

    const options = {
      hostname: loki_hostname,
      port: 443,
      path: loki_path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": JSONPayload.length,
      },
    };

    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`);

      res.on("data", (d) => {
        process.stdout.write(d);
      });
    });

    req.on("error", (error) => {
      console.error(error);
    });

    req.write(JSONPayload);
    req.end();
  });

  // https://http.cat/204
  // 204 = no content
  res.writeHead(204);
  res.end();
};

const server = http.createServer(requestHandler);
server.listen(port, () => {
  console.log("Server is listening on port " + port);
});
