const inquirer = require('inquirer')
const shell = require('shelljs')
const clear = require('clear')

// 首先会通过 git fetch remoteBranch 拿到非 origin 远程的内容
// 然后通过 git log remoteBranch/main 之类的拿到对应分支的 commit
// 看自己要选择哪些 commit 进行合并 (这里假设是 X..Y)

// 每次从 cherry-xxxx 分支开始操作，此分支只负责同步代码
// 1. `git checkout -b tempY Y` 基于 commit Y 新建分支 tempY，会自动切换到 tempY
// 2. `git rebase X` 在 tempY 分支上，基于 commit X rebase
// 3. `git checkout -b cherry master` 在 rebase 之后的 tempY 分支上，基于 master 分支，新建 cherry 分支
// 4. `git cherry-pick X..cherry` 此时到了 cherry 分支，然后 pick 从 commit X 到 cherry 分支的代码
// 5. (optional) `git branch -D tempY` 最后删除 tempY 分支，pick 出的代码，会合并到 cherry 分支上

// 选择 remoteBranch 的名字 (脚本选择当前源的默认分支)
// 选择 commitX
// 选择 commitY

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

const listRemoteBranch = () => {
  const outstr = shell.exec(`git branch -r`)
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

const chooseBranch = async () => {
  const remoteName = await chooseRemote()
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
  const branchName = await chooseBranch()
  const outstr_hash = shell.exec(`git log ${branchName} --format=format:"%H --max-count=13`)
  const outstr = shell.exec(`git log ${branchName} --oneline --max-count=13`)
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

  const commitX = hashList.find(val => val.includes(chooseCommitStart.split(' ')[0]))
  const commitY = hashList.find(val => val.includes(chooseCommitEnd.split(' ')[0]))

  return commitX, commitY
}

const gitCherry = async () => {
  chooseCommit()
}

module.exports = {
  gitCherry,
}
