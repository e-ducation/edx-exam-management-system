# How to File a Quality Issue

---

## Overview

Here are several points to keep in mind when filing a bug report. Providing these details will help us assess your issue's severity accurately and diagnose its cause more quickly.

If you wish to submit a feature request, please create an issue and add a `feature` label to it. This repository has a project named `feature request`, assgin your issue to the `feature request` project.

### Basic Information

- [ ] Please add an `escape` label to the bug, to help us keep track of where our bug reports come from.
- [ ] Please add an `feature` label to the feature request issues.
- [ ] Steps to reproduce the issue, if it is reproducible. There is a "Steps to Reproduce" field in the form if you edit an issue after creating it. But it is okay if you put this in the description. **If you can provide steps to reproduce (meaning steps one can take to reproduce on a fresh test course), there's no need to provide any other information ![(smile)](https://openedx.atlassian.net/wiki/s/-2028024810/6452/7026b3eb98e6519deadfc22d0bcbd964ee381cbd/_/images/icons/emoticons/smile.png)**
  - [ ] Please specify where you reproduced the bug. Was it on [Education](https://www.eliteu.cn/), or on your own installation? If it was on your own installation, are you running off of a named release (which one)? If you're running off of our master branch, an estimation of when you last updated your code base is very helpful.
- [ ] Expected vs. Actual behavior: how did the system behave? How did you expect it to behave in that situation?
- [ ] Business Value Statement: how is this bug impacting the value of our product?
- [ ] Screenshots, if that would illustrate the issue better.
- [ ] Your ticket's title should reflect the buggy behavior. Please do not include course-specific information in the title unless the bug is course-specific.

 If the issue is course specific, meaning you cannot reproduce it on a new course, please include:

- [ ]  URL of the page where the issue is occurring, or, at the very least, a url to the course.
- [ ] ID of the section/subsection/unit, if the issue is with a specific one.
- [ ] Some issues are caused by javascript code that runs in the browser. If you see messages in the javascript console of your browser which look like errors you can include them too. 

### Urgency

- [ ] Is it a live course?
- [ ] Who is the customer?
- [ ] How many users is the issue affecting? Is the issue course specific? Just give your best estimate.
- [ ] Do you think the issue is causing data loss? Data loss means that the problem cannot be automatically fixed fully and will, for example, require students to re-submit solutions.

 

---

## Detailed Instructions

### Search existing issues

​	It's possible that someone else has already created a bug report for the issue you are seeing. Type some text that is related to the problem you're seeing into the search box at the top right of the page, and press enter. Once you're on the search results page, you may want to refine your search parameters by selecting "Labels: Bug".

 	If someone has already created a bug report for this issue, you should add a comment to the existing bug report indicating that you are seeing the same problem. You should **not** create a new bug report for your issue – if you do, it will be closed as a duplicate. 

### Create a new issue

 *After you have verified that there is not an existing bug report,* you should create a new Issue. 

### Finish and Verify

 You can update content of issue anytime.

The Open Source team at education will triage your issue, which may involve asking you for additional information and clarification. If education cannot reproduce your issue, then education will not be able to fix it, so be sure to include reproduction steps in your bug report!

### Issue Resolution

​	education does not provide official support for other organizations running education software. We want to know about the bugs and problems that you encounter using the software, and in most cases we will attempt to fix the bugs that you report (since they may well affect education as well), but we cannot promise a resolution.

 

----

## BUG Template

### Motivation

When you're filing a ticket, there's some information that's really helpful for those triaging the tickets to have. Here is a template you can follow to help fill in that information.

### Template:

```markdown
## Steps to Reproduce

## Expected Behavior

## Actual Behavior

## Link to page that is displaying the error

## Business Value / Impact
how is this bug impacting the value of our product?

## Additional information
```

### Notes on "Steps to Reproduce":

​	If possible, try to reproduce the issue on a test course (make a new course in edge, see if you can reproduce). If you can't, that's cool, but provide some way for someone else to experience the bug. If even that is impossible, just provide as much information as you can, but please make it clear that it wasn't possible to reproduce.	