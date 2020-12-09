import { CompletionItem, CompletionItemKind } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

export let wordTokens: Map<string, CompletionItem[]> = new Map();

export const parseWords = (textDocument: TextDocument) => {
  const regex = /[A-Za-z_]+/gm;
  const content = textDocument.getText();
  const splitContent = content.split("\n");
  const words: string[] = [];
  const wordCompletion: CompletionItem[] = [];
  splitContent.forEach((cont: string, index: number) => {
    var m;
    do {
      m = regex.exec(cont);
      if (m) {
        if (words.indexOf(m[0]) === -1) {
          words.push(m[0]);
        }
      }
    } while (m);
  });
  for (const key in words) {
    if (words.hasOwnProperty(key)) {
      const element = words[key];
      const newSnip: CompletionItem = {
        label: element,
        kind: CompletionItemKind.Text,
        insertText: element,
      };
      wordCompletion.push(newSnip);
    }
  }

  const findSnip = wordTokens.get(textDocument.uri);
  if (findSnip === undefined) {
    wordTokens.set(textDocument.uri, wordCompletion);
  }
};
