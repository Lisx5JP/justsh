const inquirer = require('inquirer')
const shell = require('shelljs')
const clear = require('clear')
const { time } = require('../utils/time')

// 首先会通过 git fetch remoteBranch 拿到非 origin 远程的内容
// 然后通过 git log remoteBranch/main 之类的拿到对应分支的 commit
// 看自己要选择哪些 commit 进行合并 (这里假设是 X..Y)

// 每次从 cherry-xxxx 分支开始操作，此分支只负责同步代码
// 1. `git checkout -b tempY Y` 基于 commit Y 新建分支 tempY，会自动切换到 tempY
// 2. `git rebase X` 在 tempY 分支上，基于 commit X rebase
// 3. `git checkout -b cherry ${localBranch}` 在 rebase 之后的 tempY 分支上，基于 localBranch 分支，新建 cherry 分支
// 4. `git cherry-pick X..cherry` 此时到了 cherry 分支，然后 pick 从 commit X 到 cherry 分支的代码
// 5. (optional) `git branch -D tempY` 最后删除 tempY 分支，pick 出的代码，会合并到 cherry 分支上

// User Interaction
// 1. Choose remote branch
// 2. Choose commitX
// 3. Choose commitY
// 4. Choose local base branch

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
      message: '请选择你要 pick 的远程仓库',
      choices: remoteList,
      default: 0,
    },
  ])

  if (chooseList.name) {
    return chooseList.name
  }
  console.log('>> not choose remote')
}

const chooseRemoteBranch = async () => {
  const remoteName = await chooseRemote()
  console.log(`Please wait, fetching ${remoteName}...`)
  shell.exec(`git fetch ${remoteName}`)
  const branchList = listRemoteBranch(remoteName)

  const chooseList = await inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: '请选择你要 pick 的远程仓库分支',
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
      message: '请选择你要 pick 的 commit 起始点',
      choices: list,
      default: 0,
    },
  ])

  const chooseCommitEnd = await inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: '请选择你要 pick 的 commit 终止点',
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
      message: 'pick 的代码要合并到哪个分支？注：一般为主分支或者专门承接代码同步操作的 cherry 分支',
      choices: branchList,
      default: 0,
    },
  ])

  return chooseList.name
}

const gitCherry = async () => {
  const [commitX, commitY] = await chooseCommit()
  const baseBranch = await chooseLocalBranch()
  const currentTime = time

  shell.exec(`git checkout -b tempY ${commitY}`)
  shell.exec(`git rebase ${commitX}`)
  shell.exec(`git checkout -b cherry-${currentTime} ${baseBranch}`)
  shell.exec(`git cherry-pick ${commitX}..cherry-${currentTime}`)
  shell.exec(`git branch -D tempY`)
}

module.exports = {
  gitCherry,
}
