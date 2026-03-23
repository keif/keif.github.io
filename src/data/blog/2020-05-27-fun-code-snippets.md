---
title: Fun Code Snippets
author: Keith Baker
pubDatetime: 2020-05-27T00:00:00.000Z
modDatetime: 2026-03-23T16:52:31.963Z
slug: fun-code-snippets
featured: true
tags:
    - CLI
    - Shell
    - Node.js
description: A few handy CLI snippets and notes to remember how to quickly create or overwrite files using the terminal.
aliases:
    - fun-code-snippets
---

I keep looking up how to do little command-line code tricks (for fun) so I figure I should probably start writing them down somewhere so I can just look them up on my own site.

## Create a File That Contains a CLI Response

Sure, I'm super familiar with creating a file with `touch` and I always forget "how do you `echo` to a file, or append to a file?"

This came from wanting to add a `.nvmrc` file to this blog, as I was a little overzealous in upgrading and the upgrade broke deployment. Meh.

### The Snippets

    touch file.txt

    echo >> file.txt

    > file.txt

### The Explanation

[Lifted from StackExchange](https://unix.stackexchange.com/questions/530555/creating-a-file-in-linux-touch-vs-echo)

With both `> file` and `echo >> file`, the shell creates the file if it didn't already exist.

With `> file`, the file is truncated if it already existed. No command was specified, so nothing gets written to the file and the file will be empty.

`echo`, without any arguments, prints an empty line. So the output contains the line ending character, typically linefeed (LF, \n):

### My Use

    node --version > .nvmrc

So I get a `.nvmrc` file with the node version I'm running!

## Today's Addition: Resetting iTerm2's Cursor

Recently, for whatever reason, iTerm2's cursor (block on my UI) disappears. The cursor is invisible, because I can type, but when you navigate via CLI keys/ctrl+w/u - you sometimes NEED that cursor to know where you are.

### The Snippets

    reset

### The Explanation

After several recent occurances, and not wanting to just "close the tab and open a new one" - I stumbled on this [post from Christian Flores](https://ryel.substack.com/p/reset-iterm2-cursor).

And it worked! Of course - this exists via context menu (right-click -> restart) or even `cmd+r`

### My Use

Less exciting here, `cmd + r` does the trick, but it doesn't quite help diagnose "why" it suddenly started happening.
