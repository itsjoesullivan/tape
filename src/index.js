



//var EventChannel = require('../lib/EventChannel');
define([
	'/lib/tape/lib/EventChannel/index.js',
	'underscore',
	'backbone'
], function(EventChannel,_,Backbone) {

var Tape = function(cf) {
	_.extend(this,Backbone.Events);
	//Where you are in the tape. read: NOT wrt the context
	this.position = 0;
	this.context = cf.context;
	this.channels = {
		default: new EventChannel()
	};
	this.openEvents = [];
	this.contextMinusPosition = 0;

	this.intervals = [];
	this.dryRun = false;

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

	if(!('end' in soundEvent)) {
		soundEvent.end = function() { return soundEvent.start + soundEvent.sound.buffer.duration; }
	}
	
	if('channel' in soundEvent &! (soundEvent.channel in this.channels))
	  this.channels[soundEvent.channel] = new EventChannel();

	//add the sound. unshift instead of push to establish priority (overwriting.. see evaluateSoundEvent)
	this.channels[soundEvent.channel || 'default'].unshift(soundEvent);
};

/** Play all the sounds by dealing with each channel

*/
Tape.prototype.run = function(filter) {
	this.end = 0;
	if(this.status === 'running') {
		return;
	}
	
	this.contextTimeAtPlay = this.context.currentTime;
	this.contextMinusPosition = this.contextTimeAtPlay - this.position;
	if(filter && typeof filter === 'object' && typeof filter.channel === 'string') {
		this.playChannel(this.channels[filter.channel]);
	} else {
		for(var name in this.channels) {
			this.playChannel(this.channels[name]);
		}
	}
	
	if(this.context instanceof webkitOfflineAudioContext) return;
	this.intervals.push(setInterval(function() {
		this.trigger('time:seconds',Math.round(this.position + this.context.currentTime-this.contextTimeAtPlay));
	}.bind(this),1000));

	delete this.contextMinusPosition;

	this.status = 'running';

	if(this.dryRun || this.context instanceof webkitOfflineAudioContext) return;

	
	this.trigger('run');
	this.trigger('time:seconds',Math.round(this.position));
};

Tape.prototype.stop = function() {
	if(this.status === 'stopped') {
		this.position = 0;
		this.trigger('time:seconds',0);
		this.set('armed',false);
		return;
	}
	this.position = this.position + this.context.currentTime - this.contextTimeAtPlay;
	this.openEvents.forEach(function(ev) {
		if(ev.source.playbackState !== 3) {

			ev.source.stop(ev.start > this.context.currentTime ? ev.start : 0);
		}
	}.bind(this));
	this.trigger('stop');
	this.status = 'stopped';
	delete this.contextTimeAtPlay;

	this.intervals.forEach(function(interval) {
		clearInterval(interval);
	});
	this.intervals = [];
	this.trigger('time:seconds',Math.round(this.position));
};

/** Handle a channel of sound events

*/
Tape.prototype.playChannel = function(channel) {
	if(!(channel && 'forEach' in channel)) return;
	channel.forEach(function(soundEvent) {
		if(typeof soundEvent.end === 'function') {
			soundEvent.end = soundEvent.end();
		}
		var durations = channel.getClearDurations(soundEvent);
		durations.forEach(function(duration) {
			for(var i in soundEvent) {
				if(i === 'start' || i === 'end') continue;
				duration[i] = soundEvent[i];
			}
			this.playSound(duration);
		}.bind(this));
	}.bind(this));
};

Tape.prototype.evaluateSoundEvent = function(soundEvent,channel) {
	var soundEvents = [];
	return soundEvents;
};

Tape.prototype.playSound = function(soundEvent) {

	//Get the output the setter, if it is one.
	var output = (typeof soundEvent.output === 'function') 
	  ? soundEvent.output() 
	  : soundEvent.output;

	//Create buffer source from the output's context
	var source = soundEvent.context().createBufferSource();
	source.buffer = soundEvent.sound.buffer;
	source.connect(output);
	
	if(soundEvent.end < this.position) {
		return;
	}

	var absoluteStartTime = this.contextMinusPosition + soundEvent.start;
	var offset = this.position - soundEvent.start;
	var duration = soundEvent.end - soundEvent.start;

	if(absoluteStartTime + duration > this.end) {
		this.end = absoluteStartTime + duration - this.context.currentTime;
	}

	//Don't play if we're in dryRun mode--sometimes we just want to learn about what would be played.
	if(this.dryRun) return;

	//Schedule the sound.
	source.start(absoluteStartTime, offset,duration);
	
	//No need to be ready to stop if offline.
	if(this.context instanceof webkitOfflineAudioContext) return;

	//Keep track of this sound so we know whether to kill it in the event of stopping.
	this.openEvents.push({
		source: source,
		start: absoluteStartTime
	});
};

Tape.prototype.set = function(k,v) {
	if(typeof k !== 'string') {
		for(var key in k) {
			this.set(key,k[key]);
		}
	}
	this[k] = v;
	this.trigger('change:' + k,this,v);
}

return Tape;

})

