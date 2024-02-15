# REPLACER

## Index

- [What is this?](#what-is-this)
- [Why?](#why)
- [How to install it?](#how-to-install-it)
- [How to uninstall it?](#how-to-uninstall-it)
- [Usage](#usage)
- [Options](#options)
- [Custom replace rules](#custom-replace-rules)
    - [Must not have](#must-not-have)
    - [Must have](#must-have)
        - [Example](#example)
    - [Syntax to be able to replace](#syntax-to-be-able-to-replace)
        - [Example](#example-1)
    - [Syntax dangerous cases](#syntax-dangerous-cases)
        - [Example](#example-2)
- [What dependencies does this program have?](#what-dependencies-does-this-program-have)

## What is this?

This command will create a new folder that will contain a transformation of the files from the specified path.

This folder will change lines in the JavaScript files **including comments**.

It will change the lines that uses **CommonJs (module.exports / require("path"))** syntax to **Ecmascript (export / import)** syntax.

Also, using an option later mentioned, **you can tell the program what should be replaced**, **and for what should be replaced.**

## Why?

Have you ever been in a situation where you typed the **same word** throughout a project with **diferent files and folders** or a documentation and then **it turned out to be another word**?

Have you ever been in a situation where you **confused some words** by writing them **in a similar language**?

Also, has it ever happened to you that **you made a change, but then regretted it**?

Well, this command **will make this changes for you**, **and will also keep the original version**. So you will be able to **use the original without having to edit again the files**.

## How to install it?

You can install it using the next command:

    npm install @jgedff/replacer -g

## How to uninstall it?

You can uninstall using the next command:

    npm uninstall @jgedff/replacer -g

## Usage

This command uses the required <code>-p</code> option to select the file or folder to be replaced.

If it does not tells another option, it will try to replace the CommonJs syntax to the Ecmascript syntax, and will put all files in the a folder in your actual directory with the name <code>result</code>

**It does not work on parent folders from where it is executed**

## Options

| Option | Alias | Description | Type | Required |
| :-: | :-: | :- | :-: | :-: |
| -p | path | Route of the directory to transform (relative path) | String | ✔ |
| -d | destiny | Route where the folder created will be | String | ❌ |
| -e | ecmascript | Transform from ecmascript to commonjs | Boolean | ❌ |
| -c | comments | Transform also comments **(If you don't add this option, the comments will also modify, but not completly. It does not work on custom replace)** | Boolean | ❌ |
| -r | custom_replace | Transform the files using a rule file mentioned in with this option. **The syntax is indicated in the -s option** | String | ❌ |
| -s | custom_syntax | Syntax of the rule file proporcionated to do a custom replace | Boolean | ❌ |

## Custom replace rules

### Must not have

- The file **MUST NOT** end with an extra line

### Must have

- Each case with the syntax to replace or syntax of a dangerous case must be separated with a new line

#### Example

    This is a case to replace*With a new text
    This case will delete this text on the file*
    !This is a third case
    !And this is the last of this file

### Syntax to be able to replace

- The <code>*</code> character will be the separator between the text to be replaced and the new text.

#### Example

    Text to be replaced*New text

### Syntax dangerous cases

- The <code>!</code> character will tell the program that the following text is a dangerous case, so it will stop the program if it founds one of those cases

#### Example

    !If finds this on the document to be replaced, it will stop the program

## What dependencies does this program have?

- [yargs](https://www.npmjs.com/package/yargs) - Used to create the command
- [fs-extra](https://www.npmjs.com/package/fs-extra) - Used to read and write
- [chalk](https://www.npmjs.com/package/chalk) - Used to do the console log with colors