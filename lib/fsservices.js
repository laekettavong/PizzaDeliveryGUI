/*
* FS-related tasks
*/

// Dependencies
const fs = require('fs');
const path = require('path');
const url = require('url');
const config = require('./config');
const Constants = require('./constants');
const DataModel = require('./datamodel');
const Utils = require('./utils');
const Person = DataModel.Person;
const JSONHelper = Utils.JSONHelper;
const ArrayHelper = Utils.ArrayHelper;
const StringHelper = Utils.StringHelper;
const AuthHelper = Utils.AuthHelper;


const service = {
    post : (reqData, callback) => {
        // Check that all the required fields are fill out
        // firstName, lastName, email, streetAddress, city, state, zip
        let firstName = StringHelper.isValidString(reqData.payload.firstName);
        let lastName = StringHelper.isValidString(reqData.payload.lastName);
        let password = StringHelper.isValidString(reqData.payload.password);
        let email = StringHelper.isValidEmail(reqData.payload.email);
        let address = StringHelper.isValidString(reqData.payload.address);
        let city = StringHelper.isValidString(reqData.payload.city);
        let state = StringHelper.isValidString(reqData.payload.state);
        let zip = StringHelper.isValidString(reqData.payload.zip);

        if(firstName || lastName || email || address || city || state || zip) {
            fsHelper.read(Constants.USERS, email, (err, data) => {
                if(err){
                    let hashedPassword = AuthHelper.hash(password);
                    if(hashedPassword) {
                        let personObj = new Person(firstName, lastName, email, address, city, state, zip);
                        personObj.password = hashedPassword;
                        // Store the user
                        fsHelper.create(Constants.USERS, email, personObj, (err) => {
                            if(!err){
                                callback(200);
                            } else {
    
                                callback(500, {Error : 'Cannot create the user'});
                            }
                        })
                    } else {
                        callback(500, {Error : 'Could has the user\'s password'});
                    }
                } else {
                    callback(400, {Error : 'User alreay exists'});
                }
            });
        } else {
            callback(400, {Error : 'Missing required user fields'})
        }
    }
}

const fsHelper = {
    baseDir : path.join(__dirname, '/../.data'),
    create : (dir, file, data, callback) => {
        fs.open(`${fsHelper.baseDir}/${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
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
                                callback('Error while closing file');
                            }
                        });
                    } else {
                        callback('Error writing to new file');
                    }
                });
            } else {
                callback('Could not create new file, it may already exist');
            }
        });
     },
     read : (dir, file, callback) => {
        fs.readFile(`${fsHelper.baseDir}/${dir}/${file}.json`, 'utf-8', (err, data) => {
            if(!err && data){
                callback(false, JSONHelper.convertToObject(data));
            } else {
                callback(err, data);
            }
        })
    },
    update : (dir, file, data, callback) => {
        // Open the file for writing
        fs.open(`${fsHelper.baseDir}/${dir}/${file}.json`, 'r+',(err, fileDescriptor) => {
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
                                        callback('Error while closing file');
                                    }
                                })
                            } else {
                                callback('Error writing to existing file')
                            }
                        })
                    } else {
                        callback('Error truncating file')
                    }
                })

            } else {
                callback('Could not open the file for updating, it may not exist yet');
            }
        })
    },
    delete : (dir, file, callback) => {
        // Unlink/remove the file
        fs.unlink(`${fsHelper.baseDir}/${dir}/${file}.json`, (err) => {
            if(!err){
                callback(false);
            } else {
                callback('Error deleting file')
            }
        });
    },
    // List all the files within the specified dir minus the file extension
    list : (dir, callback) => {
        fs.readdir(`${fsHelper.baseDir}/${dir}`, (err, data) => {
            if(!err && data && data.length > 0){
                callback(false, ArrayHelper.spliceStringFromElements(data, '.json'));
            } else {
                callback(err, data)
            }
        });
    }
}

module.exports = service;