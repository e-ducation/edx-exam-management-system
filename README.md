# edX Exam Management System
这个项目是允许使用Open edX进行授课的老师从所授的几门课程中，指定题目或根据条件抽取习题形成试卷，安排学生账号进行考试，查看考试成绩。

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
make dev.run
```

4. View api document
Just access `http://0.0.0.0:8111/`, you have to login to view all api document.

## Configuration

```
EDX_API = {
    # your open edX host
    'HOST': 'http://0.0.0.0:8001',

    # api to get section's problems
    'SECTION_PROBLEM': '/exam/section/problems',
}

SOCIAL_AUTH_EDX_OIDC_KEY = ''  #Client key
SOCIAL_AUTH_EDX_OIDC_SECRET = ''  #Client secret
SOCIAL_AUTH_EDX_OIDC_URL_ROOT = 'http://lms/oauth2' #Provider root (e.g. https://courses.stage.edx.org/oauth2)
SOCIAL_AUTH_EDX_OIDC_ID_TOKEN_DECRYPTION_KEY = ''   #Identity token decryption key (same value as the client secret for edX OpenID Connect)
SOCIAL_AUTH_EDX_OIDC_ISSUER = 'http://lms/oauth2'  #OAuth/OpenID Connect provider ID token issuer (e.g. https://courses.stage.edx.org/oauth2)
```
Your Edx-platform must make the following configuration for logging:
1. Configure the following environment variables to lms.env.json or devstack_docker.py(When using the Docker-based devstack)
```python
"FEATURES: {
    ...
    "ENABLE_OAUTH2_PROVIDER": true,
    "OAUTH_ENFORCE_SECURE": false,
    ...
}
"JWT_ISSUER": "http://LMS/oauth2",
"OAUTH_OIDC_ISSUER": "http://LMS/oauth2",
"OAUTH_ENFORCE_SECURE": false,
...
```
2. Then log in to http://lms/admin/ as an administrator and join the corresponding client at http://lms/admin/oauth2/client/.The Client id and Client secret are the SEA_AUTH_EDX_OIDC_KEY and SOCIAL_AUTH_EDX_OIDC_SECRET just configured.
3. On the http://lms/admin/ page, add the newly joined client to the Trusted clients.
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
