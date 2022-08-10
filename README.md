# justsh

## Usage

### 1. cherry-pick

Note: This script is based on this [answer](https://stackoverflow.com/questions/9229301/git-cherry-pick-says-38c74d-is-a-merge-but-no-m-option-was-given/36989757#36989757).

**\* Before Starting**

You should already set another remote branch to your project, which you could check with `git remote`. The output should be something like:

``` bash
origin
anotherRemote
```

The way to add a new remote branch:

``` bash
git remote add <name> <git-repo-url>
```
