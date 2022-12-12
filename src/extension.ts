import { join } from "path";
import * as vscode from "vscode";
import * as VLC from "vscode-languageclient";

let client: VLC.LanguageClient;
let snippetCollection: Map<string, vscode.CompletionItem> = new Map();

const initSnippetCollector = async () => 
  snippetCollection.clear();

  const filesPwn = await vscode.workspace.findFiles("**/*.pwn");
  for (const key in filesPwn) {
    if (filesPwn.hasOwnProperty(key)) {
      const element = filesPwn[key];
      await vscode.workspace.openTextDocument(element);
    }
  }
  const filesInc = await vscode.workspace.findFiles("**/*.inc");
  for (const key in filesInc) {
    if (filesInc.hasOwnProperty(key)) {
      const element = filesInc[key];
      await vscode.workspace.openTextDocument(element);
    }
  }
  
  const filesPawn = await vscode.workspace.findFiles("**/*.pawn");
  for (const key in filesPawn) {
    if (filesPawn.hasOwnProperty(key)) {
      const element = filesPawn[key];
      await vscode.workspace.openTextDocument(element);
    }
  }
};

export async function activate(context: vscode.ExtensionContext) {
  initSnippetCollector();

  let serverModule = context.asAbsolutePath(join("out", "server", "server.js"));
  let debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
  let serverOptions: VLC.ServerOptions = {
    run: { module: serverModule, transport: VLC.TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: VLC.TransportKind.ipc,
      options: debugOptions,
    },
  };

  let clientOptions: VLC.LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "pawn" }],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher("**/.pwn"),
    },
  };

  client = new VLC.LanguageClient(
    "Pawn Client",
    "Pawn Server",
    serverOptions,
    clientOptions
  );

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
