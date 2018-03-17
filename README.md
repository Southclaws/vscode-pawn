# vscode-pawn

Pawn tools for vscode.

Currently this is a port of the Sublime Text package which includes proper Pawn
syntax highlighting, autocompletions for the standard library and some popular
libraries.

If you like development tools that speed up your workflow and increase
productivity, check out **[sampctl](http://bit.ly/sampctl-thread)**!

Coming soon:

* Static Analysis
* Auto-complete
* Intellisense support

## Installation

Just search for "Pawn Tools" in the vscode extensions and install it.

Alternatively, you can check out the source code or view the marketplace page:

* [GitHub Page](https://github.com/Southclaws/vscode-pawn)
* [Marketplace Page](https://marketplace.visualstudio.com/items?itemName=southclaws.vscode-pawn)

## Compiling Pawn Code

Code uses a method called "Tasks" to run compilers and build tools. All you need
to do is create a folder named `.vscode` in your project's directory and in
there, create a file named `tasks.json`.

![https://i.imgur.com/ywElfTy.gif](https://i.imgur.com/ywElfTy.gif)

The contents depends on what shell you are using. Most users on the latest
Windows 10 will have PowerShell as the default and otherwise you'll be using
Command Prompt (cmd). These shells require different escape characters.

You can check which shell is default by simply opening the integrated terminal
and checking what the dropdown says:

![https://i.imgur.com/7BVdDBN.png](https://i.imgur.com/7BVdDBN.png)

### PowerShell

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build-normal",
      "type": "shell",
      "command": "&'${workspaceRoot}\\pawno\\pawncc.exe'",
      "args": ["${relativeFile}", "'-;+'", "'-(+'", "'-d3'"],
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "isBackground": false,
      "presentation": {
        "reveal": "silent",
        "panel": "dedicated"
      },
      "problemMatcher": "$pawncc"
    }
  ]
}
```

### CMD

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build-normal",
      "type": "shell",
      "command": "\"${workspaceRoot}\\pawno\\pawncc.exe\"",
      "args": ["${relativeFile}", "-;+", "-(+", "-d3"],
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "isBackground": false,
      "presentation": {
        "reveal": "silent",
        "panel": "dedicated"
      },
      "problemMatcher": "$pawncc"
    }
  ]
}
```

### Other Shells

If you're tech-savvy enough to install and use other shells such as MSYS, Git
Bash, zsh, etc. then you're probably knowledgable enough to set up the command
invocation with the correct escape characters Bash is mostly straight forward
but requires paths with spaces to be escaped as well as the pawncc flags like
`-;+` and `-(+` because semicolons and brackets are part of the Bash language.

`"command": "${workspaceRoot}\\pawno\\pawncc.exe",` is the important bit here,
this is the path to your Pawn compiler and I've assumed most of you have a
left-over `pawno` folder from that long dead text editor! This folder not only
contains Pawno but also the Pawn code compiler (pawncc.exe).

`"args": ["\\\"${relativeFile}\\\"", "\\\"-;+\\\"", "\\\"-(+\\\""],` is also
important, this is where you define the arguments passed to the compiler. Pawno
also did this but you might not have known. The defaults have always been `-;+`
to force semicolon usage and `-(+` to force brackets in statements. Please note
the excessive use of backslash characters, if you want to add more arguments you
must use the same triple-backslash-quote around the argument if it involves a
special character.

If you store your Pawn compiler elsewhere, just replace the entire `command`
setting with the full path to your compiler.

Also, if you want to disable debug symbols (you won't be able to use
crashdetect) just remove `-d3` from
`"args": ["${relativeFile}", "-;+", "-(+", "-d3"],`.

`problemMatcher` is the part that allows recognising the Pawn compiler output
and presenting it in the `problems` panel of the editor. This doesn't work well
with external includes because the paths change from relative to absolute.
[sampctl](http://sampctl.com) fortunately fixes this (and a lot of other
annoying things).

## Features

Currently just syntax highlighting and completions from the Sublime project.

Once the [Pawn-Parser](https://github.com/Southclaws/pawn-parser) project
reaches a workable state, this extension will feature more language features
such as intellisense support, go-to-definition, view-all-references, etc...

Here's what the problems panel looks like when the tasks.json is set up
properly:

![https://i.imgur.com/k8ST5pih.png](https://i.imgur.com/k8ST5pih.png)
