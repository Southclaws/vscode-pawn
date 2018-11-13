"use strict";

import * as vscode from "vscode";
import * as net from "net";
import { spawn, SpawnOptions, ChildProcess } from "child_process";
import axios from 'axios';

// process stores the sampctl process handle while it's executing
var process: ChildProcess;

type Package = {
	user: string;
	repo: string;
	classification: string;
};

var packages:Package[];

const GetCompletionItem = (Range: vscode.Range) => (pack: Package) => {

	const { user, repo , classification } = pack;
	const content = new vscode.CompletionItem(user+"/"+repo, vscode.CompletionItemKind.Text);
	content.additionalTextEdits = [vscode.TextEdit.delete(Range)];
	content.insertText = `"${user}/${repo}"`;
	return content;
};

async function GetPackagelist() {
	try {
		let response =  await axios.get("https://api.sampctl.com/");
		packages = response.data.filter((item:Package) => item.classification === "full");
	} catch(err) {
		console.error(err);
		vscode.window.showErrorMessage("Couldn't connect to https://api.sampctl.com/ packages suggestions might not work!");
	}

}

export function activate(context: vscode.ExtensionContext) {
	GetPackagelist();
	vscode.languages.registerCompletionItemProvider({ language: 'json', pattern: '**/pawn.json' }, {
		async provideCompletionItems (document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
			
			const editor = vscode.window.activeTextEditor;
			const posline = editor.selection.active;
			const { text } = document.lineAt(posline);
			const currentLineReplaceRange = new vscode.Range(new vscode.Position(posline.line, position.character), new vscode.Position(posline.line, text.length));
			
			if(packages !== undefined) {
				return packages.map(GetCompletionItem(currentLineReplaceRange));
			}
		},
		resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken) {
			return item;
		}
			
	});
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
