"use strict";

import * as vscode from "vscode";
import { spawn } from "child_process";
import * as net from "net";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.packageEnsure", packageEnsure)
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("extension.packageBuild", packageBuild)
    );
}

function packageEnsure() {
    let process = spawn("sampctl", ["package", "ensure"]);
    process.on("message", (message: any, sendHandle: net.Socket | net.Server) => {
        console.log(message as String);
    });
    process.on("close", (code: number, signal: string) => {
        if (code != 0) {
            vscode.window.showErrorMessage("ensure failed");
        }
    });
}

function packageBuild() {
    let process = spawn("sampctl", ["package", "build"]);
    process.on("message", (message: any, sendHandle: net.Socket | net.Server) => {
        console.log(message as String);
    });
    process.on("close", (code: number, signal: string) => {
        if (code != 0) {
            vscode.window.showErrorMessage("build failed failed");
        }
    });
}

export function deactivate() {}
