var DateMath = require('date-math');

var sunday = DateMath.week.ceil(new Date());

var sunday3w = DateMath.week.shift(sunday, 3)
var friday3w = DateMath.day.shift(sunday3w,-2)

var sunday4w = DateMath.week.shift(sunday, 4)
var friday4w = DateMath.day.shift(sunday4w,-2)

var sunday5w = DateMath.week.shift(sunday, 5)
var friday5w = DateMath.day.shift(sunday5w,-2)

console.log(sunday)
console.log(friday3w)
console.log(sunday3w)
console.log(friday4w)
console.log(sunday4w)
console.log(friday5w)
console.log(sunday5w)