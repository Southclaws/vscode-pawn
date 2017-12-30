# vscode-pawn README

Pawn tools for vscode.

Currently this is a port of the Sublime Text package which includes proper Pawn syntax highlighting, autocompletions for the standard library and some popular libraries.

Coming soon:

* Static Analysis
* Auto-complete
* Intellisense support

## Installation

Just search for "Pawn Tools" in the vscode extensions and install it.

## Compiling Pawn Code

Code uses a method called "Tasks" to run compilers and build tools. All you need to do is create a folder named `.vscode` in your project's directory and in there, create a file named `tasks.json` with the following contents:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build-normal",
            "type": "shell",
            "command": "C:\\path\\to\\pawncc.exe",
            "args": ["${relativeFile}", "-\\;+", "-\\(+"],
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

`"command": "C:\\path\\to\\pawncc.exe",` is the important bit here, this is the path to your Pawn compiler.

If you use the standard server directory structure, you probably have a `pawno` directory in your workspace, so you can simply set `command` to `"command": "${workspaceRoot}\\pawno\\pawncc.exe",`

Also, if you want to disable debug symbols (you won't be able to use crashdetect) just remoe `-d3` from `"args": ["${relativeFile}", "-;+", "-(+", "-d3"],`.

## Features

Currently just syntax highlighting.

Once the [Pawn-Parser](https://github.com/Southclaws/pawn-parser) project reaches a workable state, this extension will feature more language features such as intellisense support, go-to-definition, view-all-references, etc...
