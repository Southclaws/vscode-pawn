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

To actually compile after you've set up the `tasks.json` below, press
CTRL+Shift+B (Windows) or CMD+Shift+B (Mac), or alternatively open up the
command palette with CTRL+Shift+P (Windows) or CMD+Shift+P (Mac) and type
`Run Task`, hit enter and select `build-normal`.

If you use [sampctl](http://bit.ly/sampctl) it's the same process except you'll
have four options in the `Run Task` list:

* `build only` - build the package
* `build watcher` - build the package on every file change
* `run tests` - run the package
* `run tests watcher` - run the package on every file change

### With `sampctl package init`

If you're using sampctl, the `sampctl package init` command will automatically
generate a vscode `tasks.json` if you selected `vscode` in the editor part of
the setup menu.

If you've already got a package but you didn't do this, you can simply download
the `tasks.json` from the
[Pawn Package template repo](https://github.com/Southclaws/pawn-package-template/blob/master/.vscode/tasks.json).

Once you've done that, there's no more setup needed!

### Creating `tasks.json`

Code uses a method called "Tasks" to run compilers and build tools. All you need
to do is create a folder named `.vscode` in your project's directory and in
there, create a file named `tasks.json`.

![https://i.imgur.com/ywElfTy.gif](https://i.imgur.com/ywElfTy.gif)

Then paste this into that file:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build-normal",
      "type": "shell",
      "command": "${workspaceRoot}/pawno/pawncc.exe",
      "args": ["${file}", "-Dgamemodes", "-;+", "-(+", "-d3"],
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

#### Explanation

`"command": "${workspaceRoot}/pawno/pawncc.exe",` is the important bit here,
this is the path to your Pawn compiler and I've assumed most of you have a
left-over `pawno` folder from that long dead text editor! This folder not only
contains Pawno but also the Pawn code compiler (`pawncc.exe`). You can safely
delete `pawno.exe` forever.

`"args": [...],` is also important, this is where you define the arguments
passed to the compiler. Pawno also did this but you might not have known. The
defaults have always been `-;+` to force semicolon usage and `-(+` to force
brackets in statements.

If you store your Pawn compiler elsewhere, just replace the entire `command`
setting with the full path to your compiler.

Also, if you want to disable debug symbols (you won't be able to use
crashdetect) just remove `-d3` from `"args"`.

`problemMatcher` is the part that allows recognising the Pawn compiler output
and presenting it in the `problems` panel of the editor. This doesn't work well
with external includes because the paths change from relative to absolute.
[sampctl](http://bit.ly/sampctl-thread) fortunately fixes this (and a lot of
other annoying things).

## Features

Currently just syntax highlighting and completions from the Sublime project.

Once the [Pawn-Parser](https://github.com/Southclaws/pawn-parser) project
reaches a workable state, this extension will feature more language features
such as intellisense support, go-to-definition, view-all-references, etc...

Here's what the problems panel looks like when the tasks.json is set up
properly:

![https://i.imgur.com/k8ST5pih.png](https://i.imgur.com/k8ST5pih.png)
