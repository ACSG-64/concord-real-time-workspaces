# Contributing to Concord real time work spaces


All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. 


## I Have a Question
If you have any questions, please check first the Issues or the Discussions section. It is also advisable to search the internet for answers first.

If you then still feel the need to ask a question and need clarification, we recommend the following:

- Please start a new discussion [here](https://github.com/ACSG-64/concord-real-time-workspaces/discussions/categories/q-a).
- Provide as much context as you can about what you're running into.
- Provide project and platform versions (nodejs, npm, etc), depending on what seems relevant (if relevant).

## I Want To Contribute

> ### Legal Notice <!-- omit in toc -->
> When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content and that the content you contribute may be provided under the project license.

### Reporting Bugs

<!-- omit in toc -->
#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report. Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you are using the latest version.
- Determine if your bug is really a bug and not an error on your side e.g. using incompatible environment components/versions.
- Also make sure to search the internet (including Stack Overflow) to see if users outside of the GitHub community have discussed the issue.
- Collect information about the bug:
    - Stack trace (Traceback)
    - OS, Platform and Version (Windows, Linux, macOS, x86, ARM)
    - Version of the interpreter, compiler, SDK, runtime environment, package manager, depending on what seems relevant.
    - Possibly your input and the output
    - Can you reliably reproduce the issue? And can you also reproduce it with older versions?

<!-- omit in toc -->
#### How Do I Submit a Good Bug Report?

> You must never report security related issues, vulnerabilities or bugs including sensitive information to the issue tracker, or elsewhere in public. Instead sensitive bugs must be sent by email to .
<!-- You may add a PGP key to allow the messages to be sent encrypted as well. -->

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an [Issue](https://github.com/ACSG-64/concord-real-time-workspaces/issues/new). (Since we can't be sure at this point whether it is a bug or not, we ask you not to talk about a bug yet and not to label the issue.)
- Explain the behavior you would expect and the actual behavior.
- Please provide as much context as possible and describe the *reproduction steps* that someone else can follow to recreate the issue on their own. This usually includes your code. For good bug reports you should isolate the problem and create a reduced test case.
- Provide the information you collected in the previous section.

Once it's filed: if the team is able to reproduce the issue, it will be marked `needs-fix`, as well as possibly other tags (such as `critical`).

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Concord real time work spaces, **including completely new features and minor improvements to existing functionality**. Following these guidelines will help maintainers and the community to understand your suggestion and find related suggestions.

<!-- omit in toc -->
#### Before Submitting an Enhancement

- Make sure that you are using the latest version.
- Perform a [search](https://github.com/ACSG-64/concord-real-time-workspaces/issues) to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.
- Find out whether your idea fits with the scope and aims of the project. It's up to you to make a strong case to convince the project's developers of the merits of this feature. Keep in mind that we want features that will be useful to the majority of our users and not just a small subset. If you're just targeting a minority of users, consider writing an add-on/plugin library.

<!-- omit in toc -->
#### How Do I Submit a Good Enhancement Suggestion?

If you have a conceptual suggestion, propose it in the discussion section here: [IDEAS](https://github.com/ACSG-64/concord-real-time-workspaces/discussions/categories/ideas), otherwise create a new Issue. 

- Use a **clear and descriptive title** for the issue to identify the suggestion.
- Provide a **step-by-step description of the suggested enhancement** in as many details as possible.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why. At this point you can also tell which alternatives do not work for you.
- You may want to **include screenshots and animated GIFs** which help you demonstrate the steps or point out the part which the suggestion is related to. 
- **Explain why this enhancement would be useful** to most Concord real time work spaces users. You may also want to point out the other projects that solved it better and which could serve as inspiration.


## Styleguides
Follow the style guide defined in the .eslintrc.json files. If you use Visual Studio Code, you may be interested in using the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint&ssr=false#overview) extension.

Additionally, consider the following:
* Variable naming: use descriptive names and the convention is camel case.
* Code blocks: Follow the Kernighan and Ritchie style for braces.
* Comments:
    * To describe functions or methods, follow the JSDoc convention. 
    * Separate sections of code like this: 
    ```javascript
    /* A section */
    const exampleVar = 'An example';
    function demo() {...}
    
    /* Another section */
    ...
    ```
    * Describe sections of code with multiline comments.
    * Describe parts of code with single-line comments.

### Commit Messages
Commit messages must be clear about the changes contributed. If you modified something existing, comment that as well. If the commit is related to an issue, also reference it with the issue number.

## _Attribution_
_This guide is based on the **contributing-gen**. [Make your own](https://github.com/bttger/contributing-gen)!_