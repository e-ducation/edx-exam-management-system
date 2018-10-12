# edX Exam Management System
[![Build Status](https://travis-ci.org/e-ducation/edx-exam-management-system.svg?branch=master)](https://travis-ci.org/e-ducation/edx-exam-management-system)


这个项目是允许使用Open edX进行授课的老师从所授的几门课程中，指定题目或根据条件抽取习题形成试卷，安排学生账号进行考试，查看考试成绩。
此项目目前已经暂停维护，在你使用之前建议先阅读以下链接再决定是否使用此项目 :sweat_smile:  


- <https://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/open-release-hawthorn.master/exercises_tools/randomized_content_blocks.html#randomized-content-blocks>
- <https://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/open-release-hawthorn.master/course_components/create_problem.html#problem-randomization>
- <https://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/open-release-hawthorn.master/course_components/create_problem.html#randomization>

## Getting Start

1. Install the requirement
```bash
make install
```

2. Setup DB
```
make dev.makemigrations

make dev.migrate
```

3. Run the server
```bash
make dev.up
```

4. View api document
Just access `http://0.0.0.0:8111/swagger`
Ps: you have to login to view all api document.

## Configuration
```
EDX_API = {
    # your open edX host
    'HOST': 'http://0.0.0.0:8001',
     # api to get section's problems
    'SECTION_PROBLEM': '/exam/section/problems',
}
```

### Authentication & Authorization
By default, this application relies on an external OAuth2/Open ID Connect provider
(contained within the [LMS](https://github.com/edx/edx-platform)) for authentication and authorization.

Note: When using Open ID Connect, the dashboard and provider must be accessed via different host names
(e.g. dashboard.example.org and provider.example.org) in order to avoid issues with session cookies being overwritten.

Note 2: Seeing signature expired errors upon login? Make sure the clocks of your dashboard and OAuth servers are synced
with a centralized time server. If you are using a VM, the VM's clock may skew when the host is suspended. Restarting
the NTP service usually resolves this issue.
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
