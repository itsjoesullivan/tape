var AudioBufferSource = require(__dirname + '/AudioBufferSource.mock.js');

var AudioContext = module.exports = function(log) {
	this.log = log;
	startTime = new Date().getTime();
	this.__defineGetter__("currentTime", function(){
		return ((new Date().getTime()) - startTime) / 1000;
    });
};
AudioContext.prototype.createBufferSource = function() {
	return new AudioBufferSource(this.log);
};