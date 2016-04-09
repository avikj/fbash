# fbash
Terminal over Facebook Messenger, running continuously as a background process.

## Installation and Setup

Install through npm.
```shell
npm install -g fbash
```


## Running 

fbash can be started using the command `fbash`. If this returns an error regarding access permission, try running with `sudo` as follows.
```shell
sudo fbash
```

All running fbash processes can be stopped using the command `fbash-stop`. 

When `fbash` is initally run, it will prompt the user for Facebook credentials. In subsequent runs, it will use a saved app state. The access to this file is restricted, which is why fbash may require `sudo`.

## Usage

After starting the script on your computer, you can access your terminal by messaging a command to *yourself* on Facebook. You can use most commands through fbash. 
It will respond with `@fbash` followed by the standard output, standard error, or other errors. 
fbash does *not* allow using commands which require user interaction, such as `vim`.


**Note: fbash is not a truly stateful terminal; it cannot handle environment variables and other functionality associated with terminal state. The working directory is handled manually by parsing `cd` commands. Because of this, compound commands with a `cd` component will not function properly, and may cause unexpected errors.**

## Fixes as of latest version
* Previously fbash did not work when installed on non-Windows computers, due to issues with line ending format. This has been fixed
* Handled errors for calling fbash-stop when there are no fbash processes running
