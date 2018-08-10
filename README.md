# edX Exam Management System
这个项目是允许使用Open edX进行授课的老师从所授的几门课程中，指定题目或根据条件抽取习题形成试卷，安排学生账号进行考试，查看考试成绩。

## Getting Start

1. Install the requirement
```bash
make install
```

2. Run the server
```bash
make dev.run
```

## Configuration

```
EDX_API = {
    # your open edX host
    'HOST': 'http://0.0.0.0:8001',

    # api to get section's problems
    'SECTION_PROBLEM': '/exam/section/problems',
}
```

## Getting Help

## Issue Tracker

We use GitHub Issues for our issue tracker.

If you’re filing a bug, we’d appreciate it if you would follow [our guidelines for filing high-quality, actionable issues](https://github.com/e-ducation/edx-exam-management-system/blob/master/SUBMITTING_AN_ISSUE.md). 

Thanks!


## How to Contribute
Visit the [Contributor Guidelines](https://github.com/e-ducation/edx-exam-management-system/blob/master/CONTRIBUTING.md) for details on how to contribute as well as the [Open Code of Conduct]() for details on how to participate.


## Reporting Security Issues
Please do not report security issues in public. Please email code@e-ducation.cn.

## License
The edX Exam Management System is available under the AGPL Version 3.0 License.
