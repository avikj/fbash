# Additional Commands

## sendfile

`sendfile <file_path>`
- sends the file specified by the relative file path `file_path` as an attachment

## savefile
`savefile <file_path>`

*To use this command, the user must first send the desired file as an attachment on Messenger while fbash is running.*
- saves the file most recently sent by the user at the relative file path specified by `file_path`
- does not currently work with images

## showcode
`showcode <file_path> [language]`
- displays the file specified by the relative file path `file_path` with syntax highlighting specified by `language`.
If `language` is not specified, the file extension will be used to attempt to determine the language. 
- the file will only appear highlighted if viewed on [messenger.com](https://messenger.com)

## /set
`/set <setting> <value>`
- sets the value of the setting `setting` to `value`

### List of settings

| Setting | Description | Default|
| ------ | ----------- | -----------------
| periodReplacement   | Periods in the fbash response are replaced with this to bypass facebook's spam detection | `.` |
