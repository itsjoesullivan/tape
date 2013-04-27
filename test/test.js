var AudioContext,
	Tape;

beforeEach(function() {
	AudioContext = require(__dirname + '/AudioContext.mock.js');
	Tape = require(__dirname + '/../src/index.js');
})

var newLog = function() {
	var messages = [];
	var log = function(message) {
		messages.push(message);
	};
	log.messages = messages;
	log.toString = function() {
		return log.messages;
	}
	return log;
};

var assert = require("assert")

describe('AudioContext', function() {
	it('exists', function() {
		assert.equal(typeof AudioContext,'function');
	});

	describe('currentTime', function() {
		it('returns a number', function() {
			var context = new AudioContext();
			assert.equal(typeof context.currentTime,'number');
		});
	});
});

describe('newLog', function() {
	it('exists', function() {
		assert.equal(typeof newLog,'function');
	});

	it('yields a log object', function() {
		var log = newLog();
		assert.equal(typeof log,'function');
	});

	describe('log', function() {
		it('logs', function() {
			var log = newLog();
			log('hi');
			assert.equal(log.messages[0],'hi');
		});
	});
});


describe('Tape', function() {
	it('exists', function() {
		assert.equal(typeof Tape,'function');
	});

	var tape;

	beforeEach(function() {
		tape = new Tape({
			context: new AudioContext()
		});
	})
	describe('Tape.add', function() {
		it('exists', function() {
			assert.equal(typeof tape.add,'function')
		});

		it('adds an event to Tape.channels.default when no channel mentioned', function() {
			tape.add({
				message: 'hi'
			});
			assert.equal(tape.channels.default[0].message,'hi');
		})
	});

	describe('Tape.play', function() {
		it('plays each channel', function() {
			tape.channels.second = {};
			var ct = 0;
			tape.playChannel = function() { ct++; }
			tape.play();
			assert.equal(ct,2);
		});
	});

	describe('Tape.playSound', function() {
		it('plays a sound', function() {
			var log = newLog();
			tape.playSound({
				start: 0,
				end: 0,
				output: {
					context: new AudioContext(log)
				}
			})
			tape.playChannel(tape.channels.default);
			assert.equal(log.messages[0].verb,'start');
		});
	});

	describe('Tape.playChannel', function() {
		it('plays the notes in a channel', function() {
			var log = newLog();
			tape.add({
				start: 0,
				end: 1,
				output: {
					context: new AudioContext(log)
				}
			});

			tape.add({
				start: 3,
				end: 4,
				output: {
					context: new AudioContext(log)
				}
			});
			tape.playChannel(tape.channels.default);
			assert.equal(log.messages[0].verb,'start');
			assert.equal(log.messages[2].verb,'start');
		});

		it('Notes dont overlap', function() {
			var log = newLog();
			tape.add({
				start: 0,
				end: 10,
				output: {
					context: new AudioContext(log)
				},
				channel: '1'
			});

			tape.add({
				start: 3,
				end: 15,
				output: {
					context: new AudioContext(log)
				},
				channel: '1'
			});
			tape.playChannel(tape.channels['1']);
			assert.equal(log.messages[0].verb,'start');
			assert.equal(log.messages[2].verb,'start');
			assert.equal(log.messages[3].when,3)
		});
	});

});


