"use strict";

import * as vscode from "vscode";
import * as net from "net";
import { spawn, SpawnOptions, ChildProcess } from "child_process";

// process stores the sampctl process handle while it's executing
var process: ChildProcess;

export function activate(context: vscode.ExtensionContext) {
    // vscode.window.showInformationMessage("Pawn Tools Loaded!");
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.packageEnsure", packageEnsure)
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.packageBuild", packageBuild)
    );
}

async function packageEnsure() {
    console.log("running: sampctl package ensure");

    let opts: SpawnOptions = {
        cwd: vscode.workspace.workspaceFolders[0].uri.fsPath
    };

    process = spawn("sampctl", ["package", "ensure"], opts);

    process.on("close", (code: number, signal: string) => {
        if (code != 0) {
            vscode.window.showErrorMessage("ensure failed");
        }
    });
}

async function packageBuild() {
    console.log("running: sampctl package build");

    process = spawn("sampctl", ["package", "build"]);

    process.on("close", (code: number, signal: string) => {
        if (code != 0) {
            vscode.window.showErrorMessage("build failed");
        }
    });
}

export function deactivate() {}
