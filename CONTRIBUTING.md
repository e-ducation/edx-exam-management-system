# Contributing to edX Exam Management System

First off, thank you for considering contributing to edX Exam Management System. Contributions are very welcome, and strongly encouraged!

You can contribute in many ways. For example, you might:
* Writing tutorials or blog posts
* Improving the documentation
* Submitting bug reports and feature requests
* Improve and/or add new I18n translations

When contributing to edX Exam Management System, we ask that you:
* Let us know what you plan in the GitHub Issue tracker so we can provide feedback.
* Provide tests and documentation whenever possible. It is very unlikely that we will accept new features or functionality into edX Exam Management System without the proper testing and documentation. When fixing a bug, provide a failing test case that your patch solves.
* Open a GitHub Pull Request with your patches and we will review your contribution and respond as quickly as possible. Keep in mind that this is an open source project, and it may take us some time to get back to you. Your patience is very much appreciated.

## Code of Conduct

The project has a Code of Conduct that all contributors are expected to follow. This code describes the minimum behavior expectations for all contributors.

See details on our policy on Code of Conduct.

## Your First Contribution

Unsure where to begin contributing? You can start by looking through these beginner and help-wanted issues:

* Beginner issues - issues which should only require a few lines of code, and a test or two.
* Help wanted issues - issues which should be a bit more involved than beginner issues.
* Both issue lists are sorted by total number of comments. While not perfect, number of comments is a reasonable proxy for impact a given change will have.

## How to submit a contribution

1. Create your own fork of the code
2. Do the changes in your fork
3. Test your changes
4. If you like the change and think the project could use it:
    * Be sure you have followed the code style for the project.
    * Note the Code of Conduct.
    * Send a pull request.

## Reporting Bugs 
### Security Issues 
If you find a security vulnerability, do not report security issues in public. Please email code@e-ducation.cn.

In order to determine whether you are dealing with a security issue, ask yourself these two questions:
1. Can I access something that's not mine, or something I shouldn't have access to?
2. Can I disable something for other people?

If the answer to either of those two questions are "yes", then you're probably dealing with a security issue. 

> Note that even if you answer "no" to both questions, you may still be dealing with a security issue, so if you're unsure, just email us.

### Other bugs 
#### 1. Search existing issues

​It's possible that someone else has already created a bug report for the issue you are seeing. 
Type some text that is related to the problem you're seeing into the search box at the top right of the page, and press enter. 
Once you're on the search results page, you may want to refine your search parameters by selecting "Labels: Bug".

If someone has already created a bug report for this issue, you should add a comment to the existing bug report indicating that you are seeing the same problem. 

You should **not** create a new bug report for your issue – if you do, it will be closed as a duplicate. 

#### 2. Create a new issue

**After you have verified that there is not an existing bug report,** you should create a new Issue. 

When you're filing a issue, there's some information that's really helpful for those triaging the tickets to have. Here is a template you can follow to help fill in that information.

**Template**
```markdown
## Steps to Reproduce

## Expected Behavior

## Actual Behavior

## Link to page that is displaying the error

## Business Value / Impact
how is this bug impacting the value of our product?

## Additional information
```

#### 3. Finish and Verify 

You can update content of issue anytime.

The Open Source team at e-education will triage your issue, which may involve asking you for additional information and clarification. 
If we cannot reproduce your issue, then the issue will not be able to fix it, so be sure to include reproduction steps in your bug report!
 

## Suggest a feature or enhancement

Feature requests are welcome. If you find yourself wishing for a feature that doesn't exist in edX Exam Management System, you are probably not alone. 

Open an issue on our issues list on GitHub which describes the feature you would like to see, why you need it, and how it should work.

## Code review process

* We looks at Pull Requests on a regular basis in a weekly. 
* After feedback has been given we expect responses within two weeks.
* After two weeks we may close the pull request if it isn't showing any activity.

## Code vonvention
Follow [PEP 8](http://www.python.org/dev/peps/pep-0008/).

* 4-space indents (no tabs)
* Names like this: modules_and_packages, functions_and_methods, local_variables, GLOBALS, CONSTANTS, MultiWordClasses
* Acronyms should count as one word: RobustHtmlParser, not RobustHTMLParser
* Trailing commas are good: they prevent having to edit the last line in a list when adding a new last line. 

You can use them in lists, dicts, function calls, etc.

## Commit Message Conventions

50-character subject line

72-character wrapped longer description. This should answer:

* Why was this change necessary?
* How dose it address the problem?
* Are there any side effects?

Include a link to the ticket, if any.

