# 为 edX 考试管理系统贡献你的力量

首先，感谢你考虑为 edX 考试管理系统贡献一份力。任何一点微小的贡献都非常欢迎！

贡献的途径有多种，例如：
- 编写相关的教程或博客
- 完善我们的文档
- 提交 Bug 和 Feature
- 添加或完善翻译内容

当给 edX 考试管理系统做贡献时，我们希望你：
- 先在 Issue 中提出你的想法，方便我们给予反馈
- 尽可能提供测试和相关文档
- 为你的 patch 提交一个 Pull Request，我们会尽快 review 并给予回复。由于这是一个开源项目，若未能及时回复，望能耐心等待

## 行为准则

希望本项目的贡献者都遵守行为准则，这是对所有贡献者仅有的要求。

具体见行为准则

## 你的第一个 contribution

如果你还不知道从哪里开始为 edX 考试管理系统做贡献，你从 beginner 和 help-wanted issue 开始：

- beginer issue，只需数行代码及一两个测试
- help wanted issue，相对 beginer issue 会涉及多点东西
- 将 issue 按总评论数排序，来衡量解决该问题所带来的帮助

## 如何提交自己所作出的贡献

1. 先 fork 项目
2. 在你的 fork 项目中进行修改
3. 做好测试
4. 如果你愿意将所做的提交到项目中请：
    - 确保代码风格与项目一致
    - 注意遵守行为准则
    - 发送一个 Pull Request

## Bug 报告
### 安全问题
如果您发现安全漏洞，切勿公开，请发送邮件至 code@e-ducation.cn

如何判断这是不是一个安全问题：
1. 是否可以访问他人信息，或者是否可以访问你本应无权访问的内容？
2. 是否可以禁用他人内容？

如果以上两个问题的答案都是肯定的，那应该是个安全问题。

> 注意，即便两个问题的答案全是否定，这仍可能是个安全问题。如果你不确定，请给我们发邮件。

### 其他BUG
#### 1. 搜索现存问题

你遇到的 Bug 可能别人已经发现。搜索现有的 Issue 结果页面看看，选择参数 "Labels: Bug" 以获取更精确的结果。

如果该 Bug 已经有了 issue，你可以在 issue 下面留言，声明自己也遇到同样问题。

请勿创建重复的 Bug，重复的 Bug 会被关闭。

#### 2. 新建BUG

当确认该 Bug 不存在后，你可以创建一个新的 issue。

在发起一个 issue 的时候，提供一些有用的信息可以帮助我们确认问题的分类。
你可以按照下面的模板填写 issue 的相关信息。

```markdown
## 重现步骤

## 预期行为

## 实际行为

## 显示该 error 页面的链接

## 商业价值/影响

该 Bug 对产品造成什么样的影响？

## 其他信息
```

#### 3.确认并完成

你可以随时更新 Bug 的内容

我们会对 issue 做分类，并与你确认进一步的信息。如果无法重现你的 issue，我们可能无法将其修复，因此强烈建议你描述好 Bug 的重现步骤！

## 建议一个功能或优化

欢迎提出建议。当寻求 edX 考试管理系统的某处优化或尚未存在的功能时，你也许并不孤单。

请在 GitHub 上开一个 issue，尽量描述你想要 feature，为何需要这样一个 feature，具体是功能是什么样子的。

## 代码审查流程

* 我们会每周定期查看代码的 Pull Request
* 在发送反馈给你后，我们预期在两周内得到你的回复
* 如果两周后仍无响应，我们可能会关闭该 Pull Request。

## 代码规范

遵循 [PEP 8](http://www.python.org/dev/peps/pep-0008/)。

* 使用 4 个空格缩进 (不要用 tab)
* 命名示范: modules_and_packages, functions_and_methods, local_variables, GLOBALS, CONSTANTS, MultiWordClasses
* 首字母缩略词算一个单词: 使用 RobustHtmlParser 而非  RobustHTMLParser
* 结尾添加逗号是可以的，这样在列表中添加新行时就不用编辑前一行

可以将其使用于列表、字典、函数引用等。

## Git Message 规范 

50-character subject line

72-character wrapped longer description. This should answer:

Why was this change necessary?
How dose it address the problem?
Are there any side effects?
Include a link to the ticket, if any.
