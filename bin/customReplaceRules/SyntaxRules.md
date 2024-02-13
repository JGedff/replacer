# RULES

## Index

- [Must not have](#must-not-have)
- [Must have](#must-have)
    - [Example](#example)
- [Syntax to be able to replace](#syntax-to-be-able-to-replace)
    - [Example](#example-1)
- [Syntax dangerous cases](#syntax-dangerous-cases)
    - [Example](#example-2)

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
    