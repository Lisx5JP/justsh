# 🤖 justsh

## What is justsh?

**justsh** is actually a bunch of scripts which can be used in daily development, but `justsh` simplified it into a set of interactive instruction. Currently, the following commands are supported:

- `-cherry`

## Usage

Install it with flag `-g`, then you can use it from anywhere in your computer.

```bash
npm i justsh -g
```

## 1. `-cherry`

### Why use this when git already has `cherry-pick`?

Note: The script is based on this [answer](https://stackoverflow.com/questions/9229301/git-cherry-pick-says-38c74d-is-a-merge-but-no-m-option-was-given/36989757#36989757).

Sometimes, when you use `cherry-pick`, you may encountered some error like:

```bash
fatal: Commit xxxx is a merge but no -m option was given.
```

But at the same time, you don't care about preserving the exact merging history of a branch and just want to `cherry-pick` a linearized version of it, the you can use `justsh -cherry` to simplify this.

For example: as a frontend developer, maybe you need to maintain a base admin management system, as well as business related management systems. The former is not business related, the latter is business related, **and the latter is forked from the former (which means they share the same code structure).** The former will still be updated, then you can use the `-cherry` command to synchronize the code from the former to the latter.

**\* Before Starting** (important)

You should already set another remote branch to your project, which you could check with `git remote`. The output should be something like:

```bash
origin
anotherRemote
```

The way to add a new remote branch:

```bash
git remote add <name> <git-repo-url>
```

Command:

```bash
justsh -cherry
```

**Resolve Conflict:**

When `cherry-pick` start, there may be conflicts. What you should do is to solve the conflicts and then execute:

```bash
git add -A
git cherry-pick --continue
```

At the end, you should delete the `tempY` branch via:

```bash
git branch -D tempY
```