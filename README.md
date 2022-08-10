# 🤖 justsh

## Usage

```bash
npm i justsh -g
```

### 1. -cherry

**Use Case:**

You don't care about preserving the exact merging history of a branch and just want to `cherry-pick` a linearized version of it.

For example: as a frontend developer, maybe you need to maintain a base class back office system, as well as business related back office systems. The former is not business related, the latter is business related, **and the latter is forked from the former (which means they share the same code structure).** The former will still be updated, and you can use the `-cherry` command to synchronize the code from the former to the latter.

Note: This script is based on this [answer](https://stackoverflow.com/questions/9229301/git-cherry-pick-says-38c74d-is-a-merge-but-no-m-option-was-given/36989757#36989757).

**\* Before Starting**

You should already set another remote branch to your project, which you could check with `git remote`. The output should be something like:

```bash
origin
anotherRemote
```

The way to add a new remote branch:

```bash
git remote add <name> <git-repo-url>
```

**Command:**

```bash
justsh -cherry
```
