var AudioBufferSource = module.exports = function(log) {
	this.log = log;
};

AudioBufferSource.prototype.start = function(when,offset,duration) {
	this.log({
		verb: 'start',
		when:when,
		offset: offset,
		duration: duration
	});
};

AudioBufferSource.prototype.stop = function(when) {
	this.log({
		verb: 'stop',
		when: when
	});
}

AudioBufferSource.prototype.connect = function() {};