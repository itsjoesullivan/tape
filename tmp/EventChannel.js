define(function() {

/** An object for describing overlapping events, potentially with durations, monophonically.

*/
var EventChannel = function() {
  //Array to hold group (also array) of durations per event.
  this.eventDurationsArray = [];
};

if(typeof window === 'undefined') {
  module.exports = EventChannel;
}

EventChannel.prototype = new Array();


var unshift = EventChannel.prototype.unshift;
EventChannel.prototype.unshift = function() {
  
  this.eventDurationsArray = [
    [
      arguments[0]
    ]
  ];
  return unshift.apply(this,arguments);


  
};

EventChannel.prototype.getClearDurations = function(ev) {

  var index = this.indexOf(ev);

  if(index < 0) {
    throw "Event not present";
  }

  //Is stored
  if(this.eventDurationsArray[index]) {
    return this.eventDurationsArray[index];
  }

  var eventDurations = this.eventDurationsArray[index] = [];
    //previousEvents = this.previousEvents(ev);

  //If we're just getting started...
  if(index === 0) {
    return eventDurations[0] = [{
      start: this.start,
      end: this.end
    }];
  }



  //Check previous event in case it hasn't been set yet
  if(!this.eventDurationsArray[index-1]) {
    this.getClearDurations(this[index-1]);
  }



  //Pretend it will all work out
  var eventDurations = [ev];

  //For each event in this channel
  for(var i = 0; i < index; i++) {

  	var comparisonEventArray = this.eventDurationsArray[i];

  	comparisonEventArray.forEach(function(comparisonDuration) {
  	  var localEventDurations = [];
  	  eventDurations.forEach(function(eventDuration) {
  	  	localEventDurations = localEventDurations.concat(this.getDurationsFromOnePair(eventDuration,comparisonDuration));
  	  }.bind(this));
  	  eventDurations = localEventDurations;
  	}.bind(this));
  }
  

  this.eventDurationsArray[index] = eventDurations;
  return eventDurations;

};

EventChannel.prototype.getDurationsFromOnePair = function(ev,ev2) {
	var nextStart = ev.start,
		eventDurations = [];
		/*
			duration:    [-------]
			ev:            [---]
		*/
		if(ev2.start < nextStart && ev2.end > ev.end) {
			eventDurations = [];
			nextStart = false;
			//return;
		}


    /*
      duration:    [-------]
      ev:          [---]
    */
    if(ev2.start === nextStart && ev2.end >= ev.end) {
      eventDurations = [];
      nextStart = false;
      //return;
    }

		/*
			duration:     [---]
			ev:         [-------] 
		*/
		else if(ev2.start > nextStart && ev2.end < ev.end) {
			eventDurations.push({
				start: nextStart,
				end: ev2.start
			});

			nextStart = ev2.end;
		} 

		/*
			duration:    [--------]
			ev:               [-------]
		*/
		else if(ev2.start < nextStart && ev2.end > nextStart && ev2.end < ev.end && nextStart < ev.end) {
			nextStart = ev2.end;
		}

		/*
			duration:         [-------]
			ev:           [-------]
		*/
		else if(nextStart < ev2.start && ev.end > ev2.start && ev.end < ev2.end) {
			if(nextStart !== false) {
				eventDurations.push({
				start: nextStart,
				end: ev2.start
			  });
		      nextStart = false;
			}
			
		}

		/*
			duration:  [--]
			ev:              [--]
		*/
		else if(ev2.start < nextStart && ev2.end > ev.end) {

		}

		if(nextStart !== false && nextStart < ev.end) {
  			eventDurations.push({
  				start: nextStart,
  				end: ev.end
  			});
  		}

  		return eventDurations;
};

return EventChannel;

})