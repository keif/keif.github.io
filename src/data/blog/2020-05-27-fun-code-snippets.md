---
author: Keith Baker
pubDatetime: 2020-05-27T00:00:00Z
modDatetime: 2025-09-07T03:27:00Z
title: Fun Code Snippets
slug: fun-code-snippets
featured: false
tags:
  - cli
  - shell
  - node
description:
  A few handy CLI snippets and notes to remember how to quickly create or overwrite files using the terminal.
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