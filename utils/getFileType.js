var fs = require('fs');
var path = require('path');

var fileTypesPath = path.join(__dirname, '/data/fileTypes.json');
console.log('reading ', fileTypesPath);
var map = JSON.parse(fs.readFileSync(fileTypesPath));

module.exports = function(filePath){
	var fileName = filePath.substring(filePath.lastIndexOf('/'));
	if(fileName.lastIndexOf('.') == -1)
		return '';
	var ext = fileName.substring(fileName.lastIndexOf('.')+1);
	if(ext in map)
		return map[ext];
	return ext;
}