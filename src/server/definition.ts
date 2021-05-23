import {
  CompletionItem,
  CompletionItemKind,
  Definition,
  Location,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { functionTokens, PawnFunction } from "./function";

export const parseDefinitions = (textDocument: TextDocument) => {
  const regexDefine = /^#define\s+([A-Za-z_]*?)($|\s)/gm;
  const content = textDocument.getText();
  const splitContent = content.split("\n");
  splitContent.forEach((cont: string, index: number) => {
    var m;
    do {
      m = regexDefine.exec(cont);
      if (m) {
        const newSnip: CompletionItem = {
          label: m[1],
          kind: CompletionItemKind.Text,
          insertText: m[1],
        };

        const newDef: Definition = Location.create(textDocument.uri, {
          start: { line: index, character: m.input.indexOf(m[1]) },
          end: { line: index, character: m.input.indexOf(m[1]) + m[1].length },
        });

        // TODO: Don't use the function table for this, use a separate map.
        const pwnFun: PawnFunction = {
          textDocument: textDocument,
          completion: newSnip,
          definition: newDef,
        };

        const findSnip = functionTokens.get(m[1]);
        if (findSnip === undefined) {
          functionTokens.set(m[1], pwnFun);
        }
      }
    } while (m);
  });
};
