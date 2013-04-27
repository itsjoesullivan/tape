var EventChannel = require('../lib/EventChannel');

var Tape = module.exports = function(cf) {
	//Where you are in the tape. read: NOT wrt the context
	this._position = 0;
	this.context = cf.context;
	this.channels = {
		default: new EventChannel()
	};
	this.openEvents = [];
	this.contextMinusPosition = 0;
};

/**
	@soundEvent = {
		buffer: AudioBuffer
		[output: GainNode]
		[start: int]
		[stop: int]
		[offset: int]
		[channel: channel]
	}
*/
Tape.prototype.add = function(soundEvent) {
	
	if('channel' in soundEvent &! (soundEvent.channel in this.channels))
	  this.channels[soundEvent.channel] = new EventChannel();

	//add the sound. unshift instead of push to establish priority (overwriting.. see evaluateSoundEvent)
	this.channels[soundEvent.channel || 'default'].unshift(soundEvent);
};

/** Play all the sounds by dealing with each channel

*/
Tape.prototype.play = function() {
	this.contextTimeAtPlay = this.context.currentTime;
	this.contextMinusPosition = this.contextTimeAtPlay - this._position;
	for(var name in this.channels) {
		this.playChannel(this.channels[name]);
	}
	delete this.contextTimeAtPlay;
	delete this.contextMinusPosition;
};

Tape.prototype.stop = function() {
	this.openEvents.forEach(function(ev) {
		if(ev.source.playbackState !== 3) {

			ev.source.stop(ev.start > this.context.currentTime ? ev.start : 0);
		}
	});
};

/** Handle a channel of sound events

*/
Tape.prototype.playChannel = function(channel) {
	channel.forEach(function(soundEvent) {
		var durations = channel.getClearDurations(soundEvent);
		durations.forEach(function(duration) {
			for(var i in soundEvent) {
				if(i === 'start' || i === 'end') continue;
				duration[i] = soundEvent[i];
			}
			this.playSound(duration);
		}.bind(this));
		//var sounds = this.evaluateSoundEvent(soundEvent,channel).forEach(this.playSound);
	}.bind(this));
};

Tape.prototype.evaluateSoundEvent = function(soundEvent,channel) {
	var soundEvents = [];

	return soundEvents;
};

Tape.prototype.playSound = function(soundEvent) {

	var output = typeof soundEvent.output === 'function' ? soundEvent.output() : soundEvent.output

	//Create buffer source from the output's context
	var source = output.context.createBufferSource(soundEvent.buffer);
	source.connect(output);
	
	if(soundEvent.end < this._position) {
		return;
	}

	var absoluteStartTime = this.contextMinusPosition + soundEvent.start;

	source.start(absoluteStartTime,this._position - soundEvent.start);
	source.stop(soundEvent.end);
	this.openEvents.push({
		source: source,
		start: absoluteStartTime
	});
};