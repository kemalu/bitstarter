#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tag/attributes
Uses commander.js and cheerio
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting", instr);
	process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlFile) {
    return cheerio.load(fs.readFileSync(htmlFile));
};


var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var checkURL = function(url, checksfile) {
    rest.get(url).on('complete',function(data) {
	$ = cheerio.load(data);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks) {
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
    }
    var outJson = JSON.stringify(out, null, 4);
console.log(outJson);
});
};

var clone = function(fn) {
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('u, --url <URL>', 'URL of page')
	.parse(process.argv);
    if ( program.url) {
   checkURL(program.url, program.checks);
    }
    else {
	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
