# fbash
Terminal over Facebook Messenger, without continuously running browser instances.

## Installation and Setup

1. Install through npm.
```shell
npm install fbash -g
```


## Running 

fbash can be started using the command `fbash`.

All running fbash processes can be stopped using the command `fbash-stop`.

When `fbash` is initally run, it will prompt the user for Facebook credentials. In subsequent runs, it will use a saved app state.

## Usage

After starting the script on your computer, you can access your terminal by messaging a command to *yourself* on Facebook. You can use most commands through fbash. 
It will respond with `@fbash` followed by the standard output, standard error, or other errors. 
fbash does *not* allow using commands which require user interaction, such as `vim`.


*Note: fbash is not a truly stateful terminal; it cannot handle environment variables and other functionality associated with terminal state. The working directory is handled manually by parsing `cd` commands. Because of this, compound commands with a `cd` component will not function properly, and may cause unexpected errors.*
