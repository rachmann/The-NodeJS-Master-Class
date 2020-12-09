// library for storing and editing data

const fs = require("fs");
const path = require("path");

//////////////////////////////////////////////////////////
// Container for the module (to be exported)
var lib = {};

// base dir of the data folder (currently in lib folder, so go up one)
lib.baseDir = path.join(__dirname, "/../.data/");

//////////////////////////////////////////////////////////
// CREATE
//   write data to a file
//   directory = table name
lib.create = function (dir, fileName, payload, callback) {
  // need to kno exactly where path is

  // open the file for writing
  fs.open(
    lib.baseDir + dir + "/" + fileName + ".json",
    "wx",
    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        var JSONData = {};
        // convert data to a JSON formatted string
        try {
          JSONData =
            typeof payload == "object"
              ? payload
              : JSON.parse(JSON.stringify(payload));
        } catch (err) {
          JSONData = JSON.stringify(payload);
          console.log(
            "data.js lib.create payload not in JSON format error:",
            err
          );
        }

        // write string to file and close it
        fs.writeFile(fileDescriptor, JSONData, function (err) {
          if (!err) {
            // if written ok, close the file
            fs.close(fileDescriptor, function (err) {
              if (!err) {
                // callback expects an error returned, but here the err is false (good)
                callback(false);
              } else {
                console.log("data.js lib.create file close error:", err);
                callback("Error closing new file");
              }
            });
          } else {
            console.log("data.js lib.create file write error:", err);
            callback("Error writing to new file");
          }
        });
      } else {
        console.log("data.js lib.create file create error:", err);
        callback("Could not create file; may already exist...");
      }
    }
  );
};
// End of Create
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
// Read
lib.read = function (dir, file, callback) {
  fs.readFile(
    lib.baseDir + dir + "/" + file + ".json",
    "utf8",
    function (err, data) {
      if (err) {
        console.log("data.js lib.read file read error:", err);
      }
      callback(err, data);
    }
  );
};
// End of Read
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
// Update
//    this is a force overwrite so no data comparison
//    could add a flag to append data
//      - read into object and
//      - only write out additional new data or updated original
lib.update = function (dir, fileName, payload, callback) {
  fs.open(
    lib.baseDir + dir + "/" + fileName + ".json",
    "r+",
    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        var JSONData = {};
        // convert data to a JSON formatted string
        try {
          JSONData =
            typeof payload == "object"
              ? payload
              : JSON.parse(JSON.stringify(payload));
        } catch (err) {
          JSONData = JSON.stringify(payload);
          console.log(
            "data.js lib.create payload not in JSON format error:",
            err
          );
        }
        // truncate the file just read
        fs.ftruncate(fileDescriptor, function (err) {
          if (!err) {
            fs.writeFile(fileDescriptor, JSONData, function (err) {
              if (!err) {
                fs.close(fileDescriptor, function (err) {
                  if (!err) {
                    callback(false);
                  } else {
                    console.log("data.js lib.update file close error:", err);
                    callback("Error closing updated file");
                  }
                });
              }
            });
          } else {
            if (err) {
              console.log("data.js lib.update file truncate error:", err);
            }
            callback(err);
          }
        });
      } else {
        console.log("data.js lib.read payload not in JSON format error:", err);
        callback("Could not open the file for updating, it may not exist yet");
      }
    }
  );
};

// End of Update
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
// Delete
lib.delete = function (dir, fileName, callback) {
  // unlink the file
  fs.unlink(lib.baseDir + dir + "/" + fileName + ".json", function (err) {
    if (!err) {
      callback(false);
    } else {
      console.log("data.js lib.delete file can't be deleted error:", err);
      callback("Could not delete the file.");
    }
  });
};
// End of Delete
//////////////////////////////////////////////////////////

// export the module
module.exports = lib;
