---
path: "/docker-override"
title: "Docker Override - extending your docker-compose"
published: true
date: "14th February, 2019."
featured: true
category: Code
url: https://images.pexels.com/photos/247791/pexels-photo-247791.png?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260
---

An inherent problem I've ran into at my day job is the necessity to point to different versions of images. Ideally, these images would be tagged, so we could, say, point to each image of a release, or timestamp, or a build. Currently, they don't do that (priorities of different groups, and all that).

To offset local development needs, another co-worker pointed out in the past his prior teams had used [docker override files](https://docs.docker.com/compose/extends/) to accomplish this task. I'm all about automation and offloading tweaks and convenience fixes to configuration files, so this was right up my alley.

## The initial problem

My local docker environment was pointing to the `:latest` docker images. Some code I relied on lived in the `:develop` images. Let's not talk about the path that lead to this discovery, lots of messages and conversations ensued to figure this out.

## Inital tasks

I read up on extending the [docker-compose file](https://docs.docker.com/compose/extends/). From there, I copied our original `docker-compose.yml` into `docker-compose.override.yml` and adjusted the `docker-container.image` to point from `:latest` to `:develop`. Most importantly - I knew not every image file needed to be pointing to `:develop`, so only those files were changed.

Dead easy.

To get up and running, I didn't need to do any configuration changes, no command line arguemnts. It was handled by following the established convention that docker looks for the `override.yml` and uses it if present.

I brought the containers up - and my original problem I was trying to solved - was complete! I was back in `development` again!

NOTE: _To start a normal environment run `docker-compose up -f docker-compose.yml`_ - this will skip the `docker-compose.override.yml` file!

## First mistakes

I didn't think it through - I copied the _entire_ file. I was worried it would drop certain properties. This was unnecessary, and creates a maintenance issue - if they change a property in the main `docker-compose.yml` mine would override it! So I pruned the `docker-compose.override.yml` down to the bare minimums - just the `image:` paths pointing to `:develop`

Through my pairing down, I also discovered that they look at the `version: 0.0` number in both files - if they don't match, it'll throw an error and fail - an ideal scenario since I also added the `docker-compose.override.yml` to `.gitignore` so as long as our developers maintaining the main `docker-compose` file keep it updated, it will make sure any override/extend file will fail and say it needs to be updated as well!

Now, as we've moved forward, there's been talk of additional `docker-compose` files being necessary. And no one wants to maintain their local `docker-compose.yml` file and change which image it posts to, and not accidentally commit those changes. No matter how rad a developer you are - accidents happen, and we want to minimize the ownership of the group of people who might accidentally break that file.

## Additional compose files

This gives birth to additional `docker-compose.whatever.yml` files! So we can (in the future) point to different environments or snapshots and execute them via: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up`
