const inquirer = require('inquirer')
const shell = require('shelljs')
const clear = require('clear')
const { time } = require('../utils/time')

// First, use git fetch remoteBranch to get the remote commits
// Then, use command like git log remoteBranch/main to get the commit hash we want
// Now, we can choose which commit we want to use (eg, X..Y)

// Start from a branch like cherry-xxxx, which is only used for sync remote branch
// 1. `git checkout -b tempY Y` create new branch tempY based on commitY, and checkout to tempY
// 2. `git rebase X` rebase from commitX, on tempY branch
// 3. `git checkout -b cherry-${time} ${localBranch}` after rebase, create new branch cherry-${time}
// 4. `git cherry-pick X..cherry-${time}` now, we are on branch cherry-${time}, and then execute `cherry-pick`
// 5. (optional) `git branch -D tempY` delete branch tempY, and the code we picked already in branch cherry-${time}

// User Interaction
// 1. Choose remote branch
// 2. Choose commitX
// 3. Choose commitY
// 4. Choose local base branch

let lang = 'en'
const detectLang = () => {
  const outstr = shell.exec(`locale | grep LANG`)
  clear()
  if (outstr.stdout.includes('zh_CN')) lang = 'zh'
}

const msgMap = {
  en: {
    chooseRemote: 'Please select a remote repo to pick:',
    loading: 'Please wait, fetching',
    chooseRemoteBranch: 'Please select a remote branch to pick:',
    commitX: 'Please select a commit as the start point:',
    commitY: 'Please select a commit as the end point:',
    chooseLocalBranch: 'Which branch to merge the pick code into? Note: typically the main branch or a cherry branch that specializes in accepting code synchronization operations',
  },
  zh: {
    chooseRemote: '请选择你要 pick 的远程仓库：',
    loading: '请稍等, 拉取远程分支代码中',
    chooseRemoteBranch: '请选择你要 pick 的远程仓库分支：',
    commitX: '请选择你要 pick 的 commit 起始点：',
    commitY: '请选择你要 pick 的 commit 终止点：',
    chooseLocalBranch: 'pick 的代码要合并到哪个分支？注：一般为主分支或者专门承接代码同步操作的 cherry 分支',
  }
}

const listRemote = () => {
  const outstr = shell.exec(`git remote`)
  clear()

  const list = outstr.stdout.split(/\n/).reduce((pre, cur) => {
    const reg = /origin\//
    const matchList = cur.split(reg)
    const match = matchList[matchList.length - 1].replace(/\*/, '').trim()
    if (match && !pre.includes(match)) {
      pre.push(match)
    }
    return pre
  }, [])

  return list
}

const listRemoteBranch = (name) => {
  const outstr = shell.exec(`git branch -r --list '${name}*'`)
  clear()

  const list = outstr.stdout.split(/\n/).reduce((pre, cur) => {
    if (cur && !pre.includes(cur)) {
      pre.push(cur)
    }
    return pre
  }, [])

  return list
}

const chooseRemote = async () => {
  const remoteList = listRemote()

  const chooseList = await inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: msgMap[lang].chooseRemote,
      choices: remoteList,
      default: 0,
    },
  ])

  if (chooseList.name) {
    return chooseList.name
  }
}

const chooseRemoteBranch = async () => {
  const remoteName = await chooseRemote()
  console.log(`${msgMap[lang].loading} ${remoteName}...`)
  shell.exec(`git fetch ${remoteName}`)
  const branchList = listRemoteBranch(remoteName)

  const chooseList = await inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: msgMap[lang].chooseRemoteBranch,
      choices: branchList,
      default: 0,
    },
  ])

  return chooseList.name
}

const chooseCommit = async () => {
  const branchName = await chooseRemoteBranch()
  const outstr_hash = shell.exec(`git log ${branchName} --format=format:"%H" --max-count=40`)
  const outstr = shell.exec(`git log ${branchName} --oneline --max-count=40`)
  clear()

  const list = outstr.stdout.split(/\n/).reduce((pre, cur) => {
    if (cur && !pre.includes(cur)) {
      pre.push(cur)
    }
    return pre
  }, [])

  const hashList = outstr_hash.stdout.split(/\n/).reduce((pre, cur) => {
    if (cur && !pre.includes(cur)) {
      pre.push(cur)
    }
    return pre
  }, [])

  const chooseCommitStart = await inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: msgMap[lang].commitX,
      choices: list,
      default: 0,
    },
  ])

  const chooseCommitEnd = await inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: msgMap[lang].commitY,
      choices: list,
      default: 0,
    },
  ])

  const commitX = hashList.find(val => val.includes(chooseCommitStart.name.split(' ')[0]))
  const commitY = hashList.find(val => val.includes(chooseCommitEnd.name.split(' ')[0]))

  return [commitX, commitY]
}

const listLocalBranch = async () => {
  const outstr = shell.exec(`git branch`)
  clear()

  const list = outstr.stdout.split(/\n/).reduce((pre, cur) => {
    if (cur && !pre.includes(cur)) {
      const prune = cur.replace(/\*/, "").trim()
      pre.push(prune)
    }
    return pre
  }, [])

  return list
}

const chooseLocalBranch = async () => {
  const branchList = await listLocalBranch()

  const chooseList = await inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: msgMap[lang].chooseLocalBranch,
      choices: branchList,
      default: 0,
    },
  ])

  return chooseList.name
}

const gitCherry = async () => {
  detectLang()
  const [commitX, commitY] = await chooseCommit()
  const baseBranch = await chooseLocalBranch()
  const currentTime = time

  shell.exec(`git checkout -b tempY ${commitY}`)
  shell.exec(`git rebase ${commitX}`)
  shell.exec(`git checkout -b cherry-${currentTime} ${baseBranch}`)
  shell.exec(`git cherry-pick ${commitX}..cherry-${currentTime}`)
}

module.exports = {
  gitCherry,
}
