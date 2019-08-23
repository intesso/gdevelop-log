# gdevelop-log

> tiny log util, implemented for gdevelop, but should work in other environments as well. inspired by [debug](http://npmjs.org/debug).


Log Messages in javascript console like console.log, but make it configurable, which logs shall be printed.
Patterns can be provided in several ways: 

- '*' means all logs ar printed | 
- 'sendMessage,testCollision' means only sendMessage and testCollision are printed | 
- '*,-send*' means, all logs in custom functions are printed, but not the ones in functions that start with send |
- 'blu,bla' means, only logs that were logged in a function named `blu` or `bla` are printed

pattern like: '*' or '*,-position' or 'send*,receive' etc.

## license

MIT
