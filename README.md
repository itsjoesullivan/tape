#tape

A tape deck for the web audio API

##Explanation

Ok, so the web audio API is very cool but departs in some big ways from the traditional physical model of audio recording.

Tape addresses the particular problem of scheduling audio playback. In other words, "playing" audio.

##Usage

	var tape = new Tape();

	var audioEvent = {
		start: 0,
		end: 10,
		offset: 1.5,
		buffer: AudioBuffer || getter,
		output: GainNode || getter
	};

	tape.add(audioEvent);

	//Set tape position to zero
	tape.position(0);

	//Initiate playback, in this case resulting in immediately playing sound _buffer_ through _output_ starting 1.5 seconds into the sound.
	tape.play();