---
path: "/javascript-currying"
title: "JavaScript Currying: Explained"
published: false
date: "18th February, 2019."
featured: true
category: Code
cover_image: "./slack.png"
---

On the Slack group [Talk Front-End Development](//talk-fed.slack.com) there was a brief conversation about JavaScript Currying I felt was worth sharing (some editing from the original conversation between @a, @Tigran, and @TeslaNick for brevity):

## TIL about currying, but I can’t see a practical example. Can anyone explain why it’s beneficial?

Currying is one of those things that you’ll know when you need it as long as you keep its existence in mind.

If you’re familiar with `react-redux`, it has a `connect` HOC is used liked so:
`connect(mapStateToProps)(SomeComponent)`

Its implementation might look like something like this:
```javascript
  const connect = (mstp, mdtp) => Component => {
  const someNewProps = mstp(state);
  return NewComponent = (props) => <Component {…someNewProps} {…props}/>
}
```

It takes the first argument, retrieves some data from it, and passes into the Component which is the second argument.

There’s a subtle distinction between what is commonly meant by currying—which is usually a slightly different concept
called _partial application_—and its actual mathematical meaning.

Most of the time the difference is unimportant. But imagine a function that cyphers letters: you give it an offset, _o_ and a letter, and the output is a letter _o_ places away from the input letter.

So `cypher(1, 'A')` would return `B`. `cypher(1, 'Z')` would return `A`
 
You can partially apply this function (usually synonymous with currying) by “binding” the first argument to a value. In JS you can do this with `.bind`: `cypher.bind(null, 1)` will return a function where the first argument is _always_ `1`. 
(the `null` argument to `.bind` is used to re-bind `this` and probably should be avoided)

## Putting the two ideas together: our cypher function and partial application.

If we have a string of letters that we want to cypher, we could do:
```javascript
  "FRIENDS, ROMANS, COUNTRYMAN, LEND ME YOUR EARS"
  .split('') // split into individual characters
  .filter(isALetter) // remove characters that aren't letters, because you can't cypher commas etc
  .map(cypher.bind(this, 1)) // cypher every letter in the string
  .join('') // return it to a string
```
Which would return:
`"GSJFOETSPNBOTDPVOUSZNFOMFOENFZPVSFBST"`
 
Which is the input string cyphered to the right by one place. F->G, R->S, etc.

But we could create many different cyphers with different offsets

*Ok, that’s partial application.*

## Currying is just a _tiny_ bit different.

When we have a pure function, we have a mapping from one value-space to another value-space. So if you have a function that takes a number and turns it into a color, and every number corresponds to a color, you’ve created a mapping from one value-space (number) to another (color).

If you ignore what’s _in_ the function, you could replace it with a lookup table: Pass in 1, you get red, pass in 2, you get green, and there’s just a big list of numbers to colors somewhere in your program.

When you have a pure function of two or more arguments, you have a multi-dimensional mapping. You’re mapping from one “space” of _n_ coordinates to another “space” of at least _n_ coordinates.

Currying is the computer science way to collapse those _n_ dimensional spaces down to _n-1_ dimensional spaces.

In the case of our cypher function: we have a two-dimensional space (numeric offsets, letters) and we collapse it to a one-dimensional one by fixing the first argument to be 1.

This has interesting mathematical implications that I don’t really understand that have to do with set theories and category theory.
