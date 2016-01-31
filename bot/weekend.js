'use strict'

var DateFormat = require('dateformat');
var DateMath = require('date-math');

class Weekend {
  
  constructor(weeksFromNow) {
    var now = new Date()
    var sunday = DateMath.week.ceil(now);
    
    var sundayWeekend = DateMath.week.shift(sunday, weeksFromNow)
    var fridayWeekend = DateMath.day.shift(sundayWeekend,-2)
    var mondayWeekend = DateMath.day.shift(sundayWeekend,1)
    
    this.start = fridayWeekend
    this.end = mondayWeekend
  
  }
  
  get pretty() {
    // return `${DateFormat(this.start, "isoDateTime")} - ${DateFormat(this.end, "isoDateTime")}`
    
    return `${DateFormat(this.start, "mmm d")} - ${DateFormat(this.end, "mmm d")}`
  }
  
  static nextGoodWeeknds() {
    
    
    var res =  [new Weekend(3), new Weekend(4), new Weekend(5)]
    return res;
  }
  
}

// var testW = new Weekend(5)

// console.log( Weekend.nextGoodWeeknds().map ( (w) => w.pretty ) )

module.exports = Weekend;