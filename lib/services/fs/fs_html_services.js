
const fs = require('fs');
const path = require('path');
const Config = require('./../../config');
const Utils = require('./../../utils');
const StringHelper = Utils.StringHelper;

const FsTemplate = {
    baseDir : path.join(__dirname, './../../../templates/'),
    readFile : (templateName, callback) => {
        fs.readFile(`${FsTemplate.baseDir}${templateName}.html`, 'utf8', (err, str) => {
            if(!err && str && StringHelper.isValidString(str)) {
                callback(false, str);
            } else {
                callback('Template not found');
            }
        });
    }
}

// Get the contents of a static (publiv]c) asset
const FsPublic = {
    baseDir : path.join(__dirname, './../../../public/'),
    getStaticAsset : (fileName, callback) => {
        fileName = StringHelper.isValidString(fileName);
        if(fileName) {
            fs.readFile(`${FsPublic.baseDir}${fileName}`, (err, data) => {
                if(!err && data) {
                    callback(false, data);
                } else {
                    callback('No template could be found');
                }
             });
        } else {
            callback('A valid file was not specified');
        }
    }
}

const FsHtmlServices = class FsHtmlServices {
    static index(data, callback) {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Uncle Ralph\'s Pizzia',
                'head.description' : 'We offer free, simple uptime monitoring for HTTP/HTTPS sites of all kinds. When your site goes down, we\'ll send you a text to let you know',
                'body.class' : 'index',
                'body.title' : 'This is a test'
            };
            FsHtmlServices.constructHtml('index', templateData, callback);
        } else {
            callback(405, undefined, 'html');
        }
    }

    static menu(data, callback) {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Uncle Ralph\'s Pizzia',
                'head.description' : 'We offer free, simple uptime monitoring for HTTP/HTTPS sites of all kinds. When your site goes down, we\'ll send you a text to let you know',
                'body.class' : 'index',
                'body.title' : 'This is a test'
            };
            FsHtmlServices.constructHtml('menu', templateData, callback);
        } else {
            callback(405, undefined, 'html');
        }
    }

    static constructHtml(templateName, templateData, callback) {
        FsHtmlServices.getTemplate(templateName, templateData, (err, str) => {
            if(!err && str) {
                // Add the universal header and footer
                FsHtmlServices.addUniversalTemplates(str, templateData, (err, str) => {
                    if(!err && str) {
                        // Return the page as HTML
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });

                //callback(200, str, 'html');
            } else {
                callback(500, undefined, 'html');
            }
        });
    }

    static getTemplate(templateName, templateData, callback) {
        templateName = StringHelper.isValidString(templateName);
        templateData = StringHelper.isValidObject(templateData);
        if(templateName && templateData) {
            FsTemplate.readFile(templateName, (err, str) => {
                if(!err && str) {
                    callback(false, FsHtmlServices.interpolate(str, templateData));
                } else {
                    callback('Template not found');
                }
            });
        } else {
            callback('A valid template name was not specified'); 
        }
    }

    static interpolate(str, data) {
        str = !StringHelper.isValidString(str) ? '' : str;
        data = StringHelper.isValidObject(data);

        // Add the templateGlobals to the data object, prepending their key name with "global" 
        for(let key in Config.templateGlobals) {
            if(Config.templateGlobals.hasOwnProperty(key)) {
                data[`global.${key}`] = Config.templateGlobals[key];
            }
        }

        // For each key in the data object, insert its value into the string a the corresponding placeholder
        for(let key in data) {
            if(data.hasOwnProperty(key) && typeof(data[key]) == 'string') {
                let replace = data[key];
                let find = `{${key}}`;
                str = str.replace(find, replace);
            }
        }
        return str;
    }

    static addUniversalTemplates(str, data, callback) {
        str = !StringHelper.isValidString(str) ? '' : str;
        data = StringHelper.isValidObject(data);
        // Get the header
        FsHtmlServices.getTemplate('header', data, (err, headerStr) => {
            if(!err && headerStr) {
                // Get the footer
                FsHtmlServices.getTemplate('footer', data, (err, footerStr) => {
                    if(!err && footerStr) {
                        // Add them all together
                        callback(false, `${headerStr}${str}${footerStr}`);
                    } else {
                        callback('Could not find th footer template');
                    }
                });
            } else {
                callback('Could not find th header template');
            }
        });
    }

    static favicon(data, callback) {
        if(data.method.toLowerCase() == 'get') {
            FsPublic.getStaticAsset('favicon.io', (err, data) => {
                if(!err && data) {
                    callback(200, data, 'favicon');
                } else {
                    callback(500);
                }
            });
        } else {
            callback(405);
        }
    }

    static public(data, callback) {
        if(data.method.toLowerCase() == 'get') {
            let assetName = data.trimmedPath.replace('public/', '').trim();
            if(assetName.length > 0) {
                FsPublic.getStaticAsset(assetName, (err, data) => {
                    if(!err && data) {
                        let contentType = 'plain';

                        if(assetName.indexOf('.css') > -1){
                            contentType = 'css';
                        }

                        if(assetName.indexOf('.png') > -1){
                            contentType = 'png';
                        }

                        if(assetName.indexOf('.jpg') > -1){
                            contentType = 'jpg';
                        }

                        if(assetName.indexOf('.ico') > -1){
                            contentType = 'favicon';
                        }

                        callback(200, data, contentType);
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(404);
            }
        } else {
            callback(405);
        }
    }

}


module.exports = FsHtmlServices;