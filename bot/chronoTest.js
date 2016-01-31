var Chrono = require('chrono-node')

var results1 = Chrono.parse("Feb 15 to march 2")
var results2 = Chrono.parse('I have an appointment tomorrow from 10 to 11 AM')


// console.log("%j", results)

var start = results1[0].start.date()
var end = results1[0].end.date()

// console.log("Start: %s", start)
// console.log("End: %s", end)

// console.log("%j", results1[0])

var weekend = Chrono.parse("next weekend")

console.log(weekend)

// var startW = weekend[0].start.date()
// console.log("Start: %s", startW)

// var endW = results1[0].end.date()
// console.log("End: %s", endW)