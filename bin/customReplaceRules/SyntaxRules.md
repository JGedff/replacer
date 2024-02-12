# RULES

## MUST NOT

- The file **MUST NOT** end with an extra line

## MUST

- Each case with the syntax to replace or syntax of a dangerous case must be separated with a new line

### Example

    This is a case to replace*With a new text
    This case will delete this text on the file*
    !This is a third case
    !And this is the last of this file

## SYNTAX TO REPLACE

- The <code>*</code> character will be the separator between the text to be replaced and the new text.

### Example

    Text to be replaced*New text

## SYNTAX OF DANGEROUS CASES

- The <code>!</code> character will tell the program that the following text is a dangerous case, so it will stop the program if it founds one of those cases

### Example

    !If finds this on the document to be replaced, it will stop the program