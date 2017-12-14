# Asynchronous Iterators & Generators

### Basic Async

```javascript
// Say "I have Mac and Cheese"
console.log("I have Mac and Cheese");
// Say "Sure thank you" three seconds from now. 
setTimeout(function() {
	console.log("Sure thank you");
}, 3000); 
// Say "Want Some?"
console.log("Want some?");

/*console logs:
> I have Mac and Cheese
> Want some?
> Sure thank you
*/
```

### Synchronous Iteration

#### Concepts

- Iterables
	- Data structures that can be iterated
	- Use the `Symbol.iterator` protocol
	- Some examples include arrays, strings and maps
- Iterator
	- An object created by invoking `[Symbol.iterator]()` on an iterable
	- Using the `next()` method, it wraps each element in the iterable and returns them one-by-one
- IteratorResult
	- A new data structure returned by `next`
	
```javascript
const iterable = ['x', 'y', 'z'];
const iterator = iterable[Symbol.iterator]();

iterator.next();
// returns { value: 'x', done: false }

iterator.next();
// returns { value: 'y', done: false }

iterator.next();
// returns { value: 'z', done: false }

iterator.next();
// all subsequent calls return { value: undefined, done: true }
```

```javascript
const str = 'codebeast';
const codebeast = {
	[Symbol.iterator]: () => {
		const letterArray = str.split('');
		return {
			next: () => ({ 
				done: letterArray.length === 0,
			 	value: letterArray.shift()
			})
		};
	}
}

for (const letter of codebeast) { console.log(letter); }
// prints out each letter in turn
```

### Asynchronous Iteration
