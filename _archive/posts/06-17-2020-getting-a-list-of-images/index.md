---
path: "/getting-a-list-of-images"
title: "Getting a List of Images"
published: true
date: "17th June, 2020."
featured: true
category: Code
cover_image: "./code.jpeg"
---

There's a tool I use for importing/exporting massive amounts of data (well, I say MaSSiVe but it's just... a LOT of data, thousands of rows, CSV files that can be DOZENS of MB, so not like terabytes of data). So of course, one limitation is - images. You can't just feed the tool a list of URLs and say "get these for me."

So I went down the road of [wget](https://linuxize.com/post/wget-command-examples/) - and of course, I didn't think of this at the beginning, and it took a conversation where I had to say it out loud to figure it out (thanks to a co-worker for talking about the idea with me, which gave me the keywords I wasn't using to stumble upon `wget` as the solution, duh).

It's super simple and easy to use, which made it more facepalming for not using it to begin with. Granted, I had to convert a CSV file with syntax issues galore and figure out the direct URL structure to get the downloads to actually work properly - but all the work I did to use a tool, set me up to easilly clean up the data for wget to use.

## Setup:

Of course, `wget` is not included in OSX, so I had to install it using [brew](https://brew.sh/).

```
brew install wget
```

## Syntax (first run):

```
wget -i file_name.txt
```

...this ran through the file, line-by-line to get the images. Pretty simple, right?

## Syntax (run in parallel):

```
cat text_file.txt | parallel --gnu "wget {}"
```

...thanks to [StackOverflow](https://stackoverflow.com/questions/40986340/how-to-wget-a-list-of-urls-in-a-text-file) for this one, which would've sped up the process (I was attempting THOUSANDS of images). This ALSO requires you to install `parallel` as it's not a native OSX command, again, simply by `brew install parallel`.

* [Additional reading and configuration of `wget`](https://linuxize.com/post/wget-command-examples/)