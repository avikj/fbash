# fbash
Terminal over Facebook Messenger, running continuously as a background process.


[![NPM](https://nodei.co/npm/fbash.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/fbash/)

![Photo](screenshot.PNG)

## Installation and Setup

Install through npm.
```shell
npm install -g fbash
```


## Running 

fbash can be started using the command `fbash`. When it is initially run, it will prompt the user for an email and password.

These should be the same credentials used to log into Facebook. In subsequent runs, fbash will use a saved app state to log in.
```shell
$ fbash
email: hello@example.com
password: ****************
Started fbash.
```

In addition, all running fbash processes can be stopped with the following command.
```shell
$ fbash-stop
```

## Usage

After starting the script on your computer, you can access your terminal by messaging a command to *yourself* on Facebook. You can use most terminal commands through fbash. 
It will respond with `@fbash` followed by the standard output, standard error, or other errors. 
fbash does *not* allow using commands which require user interaction, such as `vim`.

fbash can also be accessed through normal chats (not just to yourself). 

To use it in a chat that is not the chat with yourself, prefix the command with `/fbash`. For example, to run `ls` in another chat, use
```
/fbash ls
```
It will display this output in the chat from which the command was received.

#### Additional commands

* `sendfile <file_path>`
* `savefile <file_path>`
* `/set <setting> <value>`
* `showcode <file_path> [language]`
* `authorize` and `unauthorize` **(beta)** 

Details for each command can be found on the [docs](DOCS.md).

## Changes as of latest version
* Allows replacing periods to bypass Facebook's spam detection.
* No longer requires `sudo` to run.

**Note: fbash is not a truly stateful terminal; it cannot handle environment variables and other functionality associated with terminal state. The working directory is handled manually by parsing `cd` commands. Because of this, compound commands with a `cd` component will not function properly, and may cause unexpected errors.**

## How to Contribute
* If you have an idea for a command which would be relevant and useful, please open an issue with the suggestion.
* For the 'showcode' command, there is a hard-coded list of file extensions and corresponding languages. If you want a language
to be added, please either open an issue with the language and file extension or create a pull request. The map of languages
and file extensions can be found at src/utils/getFileType.js.
