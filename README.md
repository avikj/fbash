# fbash
Terminal over Facebook Messenger, running continuously as a background process.


[![NPM](https://nodei.co/npm/fbash.png?compact=true)](https://nodei.co/npm/fbash/)

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

To use it in a chat that is not the chat with yourself, prefix the command with `/fbterm `. For example, to run `ls` in another chat, use
```
/fbterm ls
```
It will display this output in the chat from which the command was received.

#### Additional commands

* `sendfile <filename>`

retrieves &lt;filename&gt; and sends as an attachment.
      
* `/set <setting> <value>`

sets the value of the setting &lt;setting&gt; to &lt;value&gt;

#### Settings
Each setting is a string that modifies how fbash acts in how it responds to commands.

* `periodReplacement`

Periods in stdout responses are replaced with this character. This is used to bypass Facebook's spam detection.
      
Default: `.`

## Fixes as of latest version
* Allows replacing periods to bypass Facebook's spam detection.
* No longer requires `sudo` to run.

**Note: fbash is not a truly stateful terminal; it cannot handle environment variables and other functionality associated with terminal state. The working directory is handled manually by parsing `cd` commands. Because of this, compound commands with a `cd` component will not function properly, and may cause unexpected errors.**
