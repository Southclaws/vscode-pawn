import {
  CompletionItem,
  CompletionItemKind,
  Definition,
  Location,
  ParameterInformation,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { isAlphaNum, isDigit, isWhitespace, reverse } from "./util";

export interface PawnFunction {
  textDocument: TextDocument;
  completion: CompletionItem;
  definition: Definition;
  params?: ParameterInformation[];
}

export interface FindFunctionIdentifierResult {
  identifier: string;
  parameterIndex: number;
}

export let functionTokens: Map<string, PawnFunction> = new Map();

export const parseFunctions = (textDocument: TextDocument) => {
  const regex = /^(forward|native|stock)\s(.*?)\((.*?)\)/gm;
  const content = textDocument.getText();
  const splitContent = content.split("\n");
  splitContent.forEach((cont: string, index: number) => {
    var m;
    do {
      m = regex.exec(cont);
      if (m) {
        let doc: string = "";
        let endDoc = -1;
        if (splitContent[index - 1] !== undefined)
          endDoc = splitContent[index - 1].indexOf("*/");
        if (endDoc !== -1) {
          let startDoc = -1;
          let inNum = index;
          while (inNum >= 0) {
            inNum--;
            if (splitContent[inNum] === undefined) continue;
            startDoc = splitContent[inNum].indexOf("/*");
            if (startDoc !== -1) {
              if (inNum === index) {
                doc = splitContent[index];
              } else if (inNum < index) {
                while (inNum < index) {
                  doc += splitContent[inNum] + "\n\n";
                  inNum++;
                }
              }
              break;
            }
          }
        }
        doc = doc.replace("/*", "").replace("*/", "").trim();
        const newSnip: CompletionItem = {
          label: m[2] + "(" + m[3] + ")",
          kind: CompletionItemKind.Function,
          insertText: m[2] + "(" + m[3] + ")",
          documentation: doc,
        };
        const newDef: Definition = Location.create(textDocument.uri, {
          start: { line: index, character: m.input.indexOf(m[2]) },
          end: { line: index, character: m.input.indexOf(m[2]) + m[2].length },
        });
        let params: ParameterInformation[] = [];
        if (m[3].trim().length > 0) {
          params = m[3].split(",").map((value) => ({ label: value.trim() }));
        } else {
          params = [];
        }
        const pwnFun: PawnFunction = {
          textDocument: textDocument,
          definition: newDef,
          completion: newSnip,
          params,
        };
        const indexPos = m[2].indexOf(":");
        if (indexPos !== -1) {
          const resOut = /:(.*)/gm.exec(m[2]);
          if (resOut) m[2] = resOut[1];
        }
        const findSnip = functionTokens.get(m[2]);
        if (findSnip === undefined) functionTokens.set(m[2], pwnFun);
      }
    } while (m);
  });
};

export const findFunctionIdentifier = (
  content: string,
  cursorIndex: number
): FindFunctionIdentifierResult => {
  let index = cursorIndex - 1;
  let parenthesisDepth = 0;
  let identifier = "";
  let parameterIndex = 0;

  while (index >= 0) {
    // We surely know that we shouldn't search further if we encounter a semicolon
    if (content[index] === ";") {
      return { identifier: "", parameterIndex: 0 };
    }
    if (content[index] === "," && parenthesisDepth === 0) {
      ++parameterIndex;
    }
    if (content[index] === ")") {
      // Ignore the next '(', it's a nested call
      ++parenthesisDepth;
      --index;
      continue;
    }
    if (content[index] === "(") {
      if (parenthesisDepth > 0) {
        --parenthesisDepth;
        --index;
        continue;
      }

      // Identifier preceding this '(' is the function we are looking for
      // Skip all whitespaces first
      while (isWhitespace(content[--index])) {}
      // Copy the identifier
      while (index >= 0 && isAlphaNum(content[index])) {
        identifier += content[index];
        --index;
      }
      // Remove all digits from the end, an identifier can't start with a digit
      let identIndex = identifier.length;
      while (--identIndex >= 0 && isDigit(identifier[identIndex])) {}
      if (identIndex !== identifier.length - 1) {
        identifier = identifier.substring(0, identIndex + 1);
      }
      // Finally reverse it and return it
      return {
        identifier: reverse(identifier),
        parameterIndex: parameterIndex,
      };
    }

    --index;
  }

  return { identifier: "", parameterIndex: 0 };
};
