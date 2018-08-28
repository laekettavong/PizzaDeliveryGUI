
/*
* FS CRUD operations to file
*/

// Dependencies
const path = require('path');
const fs = require('fs');
const Utils = require('./../../utils');
const Constants = require('./../../constants');

const FsHelper = {
    baseDir : path.join(__dirname, '/../../../.data'),
    create : (dir, file, data, callback) => {
        fs.open(`${FsHelper.baseDir}/${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
            if(!err && fileDescriptor){
                // Convert data to string
                let stringData = JSON.stringify(data);
                // Write to file and close it
                fs.writeFile(fileDescriptor, stringData, (err) => {
                    if(!err){
                        fs.close(fileDescriptor, (err) => {
                            if(!err){
                                callback(false); // false error is actually no error...a good thing
                            } else {
                                callback(Constants.ERROR_CLOSING_FILE);
                            }
                        });
                    } else {
                        callback(Constants.ERROR_WRITING_TO_FILE);
                    }
                });
            } else {
                callback(Constants.ERROR_CANNOT_CREATE_FILE);
            }
        });
     },
     read : (dir, file, callback) => {
        //console.log("PATH", `${FsHelper.baseDir}/${dir}/${file}.json`);
        fs.readFile(`${FsHelper.baseDir}/${dir}/${file}.json`, 'utf-8', (err, data) => {
            if(!err && data){
                callback(false, Utils.JSONHelper.convertToObject(data));
            } else {
                callback(err, data);
            }
        })
    },
    update : (dir, file, data, callback) => {
        // Open the file for writing
        fs.open(`${FsHelper.baseDir}/${dir}/${file}.json`, 'r+',(err, fileDescriptor) => {
            if(!err && fileDescriptor){
                // Convert data to string
                let stringData = JSON.stringify(data);
                // Truncate the file
                fs.truncate(fileDescriptor, (err) => {
                    if(!err){
                        // Write to fike and close it
                        fs.writeFile(fileDescriptor, stringData, (err) => {
                            if(!err){
                                fs.close(fileDescriptor, (err) => {
                                    if(!err){
                                        callback(false);
                                    } else {
                                        callback(Constants.ERROR_CLOSING_FILE);
                                    }
                                })
                            } else {
                                callback(Constants.ERROR_WRITING_TO_FILE);
                            }
                        })
                    } else {
                        callback(Constants.ERROR_TRUNCATING_FILE);
                    }
                })

            } else {
                callback(Constants.ERROR_CANNOT_UPDATE_FILE);
            }
        })
    },
    delete : (dir, file, callback) => {
        // Unlink/remove the file
        fs.unlink(`${FsHelper.baseDir}/${dir}/${file}.json`, (err) => {
            if(!err){
                callback(false);
            } else {
                callback(Constants.ERROR_DELETING_FILE);
            }
        });
    },
    // List all the files within the specified dir minus the file extension
    list : (dir, callback) => {
        fs.readdir(`${FsHelper.baseDir}/${dir}`, (err, data) => {
            if(!err && data && data.length > 0){
                callback(false, Utils.ArrayHelper.spliceStringFromElements(data, '.json'));
            } else {
                callback(err, data)
            }
        });
    }
}
// Get the contents of a static (publiv]c) asset
const FsPublic = {
    baseDir : path.join(__dirname, '/../public/'),
    getStaticAsset : (fileName, callback) => {
        fileName = StringUtils.isValidString(fileName);
        if(fileName) {
            fs.readFile(`${FsPublic.baseDir}${fileName}`, (err, data) => {
                if(!err && data) {
                    callback(false, data);
                } else {
                    callback('No file could be found');
                }
             });
        } else {
            callback('A valid file was not specified');
        }
    }
}

module.exports = FsHelper;
module.exports.FsPublic = FsPublic;