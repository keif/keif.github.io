---
path: '/bash-script-test-merge-conflicts'
title: 'Bash Script - test merge conflicts'
published: true
date: '13th January, 2019.'
featured: true
category: Code
url: https://images.pexels.com/photos/247791/pexels-photo-247791.png?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260
---

A reoccuring problem I run into at work is handling multiple branches on a dev environment comprised of Java, JavaScript, SQL, and SCSS files.

It's not an ideal scenario, but utilizing Jenkins, the task is fairly easy in the pipeline - you list the branches you want built, you tell it to deploy (or on a schedule) and it runs through and confirms there is no merge conflicts, before continuing on the pipeline to run the jasmine tests to verify everything is up to snuff on the front-end. Of course, since it's Jenkins, I can kick off the build, then head to the console output and watch for an error, or wait for it to fail.

But who has time for that? In that time, three new JavaScript frameworks were released, and one failed, and the other already replaced Angular!

## What this script does:
- for my needs, it checks out `develop` and pulls to be sure it's up to date
- create a branch `test-merge` that is appended with the day/month/seconds
- we reference a `branches.txt` file that holds the branches (each branch on a new line)
- for each branch:
  - strip out any `# comments` and trim white space
  - verify that it's not an emptry string
  - we merge (using `refs/remotes/origin/` so we don't need to check out each branch locally)
- output "SUCCESS" or "FAIL" to `build-result.txt`
- output the content of `build-result.txt`
- we grep against the file to check if "FAIL" is present
- remove `build-result.txt`
- checkout `develop` and delete `test-merge`

### What it still needs to do:
- Stash and save the current code (in case you haven't committed yet) and apply when you're done
- run from the current branch (saving the current branch, switching to `develop`, and switching back to your original branch)
- fix the issue where it's applying to `develop`, requiring a `reset`

`gist:keif/5f5c93395e06a515b35f1bacf2399db8`