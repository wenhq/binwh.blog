---
title: 动图说明常用GIT命令
date: 2022-05-16T15:20:00
lang: zh-CN
author: Lydia Hallie
sidebar: auto
categories:
 - tech
tags:
 - tech,翻译
meta:
  - name: description
    content: CS Visualized Useful Git Commands
  - name: keywords
    content: git
---

![](/images/2022/0516/p1.png "")

文章用可视化的方式介绍一些常用```Git```指令的图解说明。

包括：

- ```git merge```
- ```git rebase```
- ```git reset```
- ```git revert```
- ```git cherry-pick```
- ```git fetch```
- ```git pull```
- ```git reflog```

<!-- more -->

> 本文搬运自[[译] 图解常用的 Git 指令含义 | 稀土掘金](https://juejin.cn/post/6844904117291188231)， 原文为[CS Visualized: Useful Git Commands](https://dev.to/lydiahallie/cs-visualized-useful-git-commands-37p1)，作者[Lydia Hallie](https://dev.to/lydiahallie)

---

## 合并（git merge）

项目有多条功能分支时，需要使用```git merge```命令，指定将某个分支的提交合并到当前分支。```Git```中有两个合并策略：```fast-forward```和```no-fast-forward```。

### fast-forward（--ff）

如果当前分支，在合并分支前，没有做过额外提交。那么合并分支的过程不会产生的新的提交记录，而是直接将分支上的提交添加进来。这称为```fast-forward```合并。

![](/images/2022/0516/p11.awebp "")

### no-fast-forward（--no-ff）

在当前分支分离出子分支后，做了一些修改；而分离出的子分支也做了修改。这个时候再使用```git merge```，就会触发```no-fast-forward```策略。

在```no-fast-forward```策略下，```Git```会在当前分支（```active branch```）额外创建一个新的 合并提交（```merging commit```）。这条提交记录既指向当前分支，又指向合并分支。

![](/images/2022/0516/p12.awebp "")

合并后，在当前主分支```master```上包含```dev```分支上的所有修改。

### 合并冲突

两个分支对同一个```README.md```文件做了修改。```Git```是无法自行决定合并策略的。这个时候，```Git```就会把合并操作交给我们。

![](/images/2022/0516/p13.png)

如果此时将```dev```合并到```master```，那么就存在合并冲突了：标题是使用 Hello! 还是 Hey! 呢？当在主分支上执行```git merge```后，```Git```会提示存在合并冲突，并把冲突的地方标记出来。我们手工处理完毕后，保存修改、添加文件、然后提交修改就可以了。

![](/images/2022/0516/p14.awebp "")

## 变基（git rebase）
```git rebase```指令会复制当前分支的所有最新提交，然后将这些提交添加到指定分支提交记录之上。

![](/images/2022/0516/p21.awebp "")

如图，```dev```分支是从主分支上分离出去的（在```i8fe5```处），之后主分支与```dev```分支上都有相应的修改。执行```git rebase master```指令后，```dev```分支将自己的最新提交记录复制出来（提交```hash```也发生了改变），拼在了主分支最后一次提交之上。这种合并分支的方式，会另```Git```提交历史看起来很清爽。

变基在开发功能（```feature branch```）分支时很有用——在开发功能时，主分支上可能也做了一些更新，我们可以将主分支上的最新更新通过变基合并到功能分支上来，这在未来在主分支上合并功能分支避免了冲突的发生。

### 交互式变基

采用 交互式变基（```Interactive Rebase```） 形式，变基时提供了 6 种操作模式：

- reword：修改提交信息
- edit：修改此提交
- squash：将当前提交合并到之前的提交中
- fixup：将当前提交合并到之前的提交中，不保留提交日志消息
- exec：在每一个需要变基的提交上执行一条命令
- drop：删除提交

#### 以 drop 为例
![](/images/2022/0516/p22.awebp "")

#### 以 squash 为例
![](/images/2022/0516/p23.awebp "")
```e45cb```（+styles.css） 合并到```ec5be```（+index.js） 提交后，两个提交重新```hash```出了```c4ec9```（+styles.css、+index.js）这个提交记录。

## 重置（git reset）
如果因为某些原因（比如新提交导致了 BUG，或只是一个 WIP 提交），需要撤回提交，那么可以使用```git reset```指令。```git reset```可以控制当前分支回撤到某次提交时的状态。

### 软重置
执行软重置时，撤回到特定提交之后，已有的修改会保留。

以下图为例：```9e78i```提交添加了 style.css 文件，```035cc```提交添加了 index.js 文件。使用软重置，我们可以撤销提交记录，但是保留新建的 style.css 和 index.js 文件。

![](/images/2022/0516/p31.awebp "")

使用```git status```指令查看，发现新建的 style.css 和 index.js 的两个文件还在，不过对应的提交记录已经移除。这很好，我们可以对这些文件内容重新编辑，稍后再做提交。

### 硬重置

有时重置时，无需保留提交已有的修改，直接将当前分支的状态恢复到某个特定提交下，这种重置称为硬重置，需要注意的是，硬重置还会将当前工作目录（```working directory```）中的文件、已暂存文件（```staged files```）全部移除！

![](/images/2022/0516/p32.awebp "")

使用```git status```查看，发现当前操作空间空空如也。```Git```丢弃了```9e78i```和```035cc```两次提交引入的修改，将仓库重置到```ec5be```时的状态。

## 还原（git revert）

另一种撤销更改的方式，是使用```git revert```指令。用于还原某次提交的修改，会创建一个包含已还原更改的新提交记录！

举个例子，我们在```ec5be```上添加了 index.js 文件。之后发现并不需要这个文件。那么就可以使用```git revert ec5be```指令还原之前的更改。

![](/images/2022/0516/p41.awebp "")

新的提交记录```9e78i```还原了```ec5be```引入的更改。```git revert```可以在不修改分支历史的前提下，还原某次提交引入的更改。

## 检出提交（git cherry-pick）

如果某个分支上的某次提交的修改正是当前分支需要的，那我们可以使用```cherry-pick```命令检出某次的提交更改作为新的提交添加到当前分支上面。

举个例子（如下图所示）：```dev```分支上的```76d12```提交添加了 index.js 文件，我们需要将本次提交更改加入到```master```分支，那么就可以使用```git cherry-pick 76d12```单独检出这条记录修改。

![](/images/2022/0516/p51.awebp "")

现在```master```分支包含了```76d12```中引入的修改，并添加了一条提交记录```9e78i```。

## 获取（git fetch）

假设，我们在一个有关联远程分支（比如：在 Github 上）的分支上工作，那么就要面临一个问题——你和你的同事都这个分支上工作，你的同事将他做的更改（比如一个 quick fix）提交到了远程分支上，而这些提交是你本地没有的。

此时，就要使用```git fetch```指令将远程分支上的最新的修改下载下来。

![](/images/2022/0516/p61.awebp "")

可以看见，```git fetch```指令并没有影响本地分支。

## 拉取（git pull）

除了```git fetch```，我们还能使用```git pull```获取远程分支数据。有什么不同呢？```git pull```指令实际做了两件事：```git fetch```和```git merge```。

![](/images/2022/0516/p71.awebp "")

> 译注：这里的图画的是有问题的——当前主分支并没有新的提交，因此```git merge```的结果是直接将远程分支上的提交添加到当前分支之后，而不是如图所示的产生一个合并提交。

## Reflog（git reflog）

每个人都会犯错，举一个例子：假设你不小心使用```git reset```命令硬重置仓库到某个提交。后面突然想到，重置导致了一些已有的正常代码的误删！

```git reflog```是一个非常有用的命令，用于显示所有已执行操作的日志！包括合并、重置、还原：基本上记录了对分支的任何更改。

![](/images/2022/0516/p81.awebp "")

如果你不幸犯错了，你可以使用```git reflog```的信息通过重置```HEAD```轻松地重做此操作！

假设，我们不想合并```origin/master```分支了。执行```git reflog```命令，我们看到合并之前的仓库状态位于```HEAD@{1}```这个地方，我们使用```git reset```指令将```HEAD```头指向```HEAD@{1}```。

![](/images/2022/0516/p82.awebp "")

可以看见，最新的操作信息也已经记录到```reflog```中了！

（正文完）