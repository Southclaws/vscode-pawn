import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  CompletionItem,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  Hover,
  DefinitionParams,
  SignatureHelpParams,
  SignatureHelp,
  CompletionList,
  CompletionParams,
  MarkedString,
  Position,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { positionToIndex, findIdentifierAtCursor } from "./util";
import {
  PawnFunction,
  parseFunctions,
  functionTokens,
  findFunctionIdentifier,
} from "./function";
import { parseWords, wordTokens } from "./words";
import { parseDefinitions } from "./definition";

// -
// Initialisation
// -

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
documents.listen(connection);
connection.listen();

connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      // Tell the client that the server supports code completion
      completionProvider: {
        resolveProvider: true,
      },
      definitionProvider: true,
      hoverProvider: true,
      signatureHelpProvider: {
        triggerCharacters: ["(", ","],
      },
    },
  };
});

// -
// Symbol Collection
// -

connection.onDidChangeConfiguration(() => {
  documents.all().forEach(collectSymbols);
});
documents.onDidChangeContent((change) => {
  collectSymbols(change.document);
});

const collectSymbols = async (textDocument: TextDocument) => {
  // TODO: move to function parser class
  functionTokens.forEach((value: PawnFunction, key: string) => {
    if (value.textDocument.uri === textDocument.uri) {
      functionTokens.delete(key);
    }
  });

  // TODO: also move this global state mess elsewhere...
  const findSnip = wordTokens.get(textDocument.uri);
  if (findSnip !== undefined) {
    wordTokens.delete(textDocument.uri);
  }

  parseDefinitions(textDocument);
  parseFunctions(textDocument);
  parseWords(textDocument);
};
connection.onDidChangeWatchedFiles((_change) => {});

// -
// Completion
// -

connection.onCompletion(async (params: CompletionParams) => {
  const c: CompletionList = {
    isIncomplete: false,
    items: await doCompletion(params),
  };
  return c;
});

const doCompletion = async (params: CompletionParams) => {
  const comItems: CompletionItem[] = [];
  functionTokens.forEach((res) => comItems.push(res.completion));
  const findSnip = wordTokens.get(params.textDocument.uri);
  if (findSnip !== undefined) {
    findSnip.forEach((res) => comItems.push(res));
  }
  return comItems;
};

connection.onCompletionResolve(
  async (item: CompletionItem): Promise<CompletionItem> => {
    return await doCompletionResolve(item);
  }
);

const doCompletionResolve = async (item: CompletionItem) => {
  return item;
};

// -
// Hover
// -

connection.onHover((params: TextDocumentPositionParams): Hover | undefined => {
  const doc = documents.get(params.textDocument.uri);
  if (doc === undefined) return;
  return doHover(doc, params.position);
});

const doHover = (
  document: TextDocument,
  position: Position
): Hover | undefined => {
  const cursorIndex = positionToIndex(document.getText(), position);
  const result = findIdentifierAtCursor(document.getText(), cursorIndex);
  const snip = functionTokens.get(result.identifier);

  if (snip === undefined) {
    return undefined;
  }

  let c: MarkedString[] = [];

  if (snip.completion.label !== undefined) {
    c.push(`${snip.completion.label}`);
  }

  if (snip.completion.documentation !== undefined) {
    c.push(`${snip.completion.documentation}`);
  }

  return {
    contents: c,
  };
};

// -
// Call Signature Help
// -

connection.onSignatureHelp((params: SignatureHelpParams):
  | SignatureHelp
  | undefined => {
  const doc = documents.get(params.textDocument.uri);
  if (doc === undefined) return;
  return doSignHelp(doc, params.position);
});

const doSignHelp = (
  document: TextDocument,
  position: Position
): SignatureHelp | undefined => {
  const cursorIndex = positionToIndex(document.getText(), position);
  const result = findFunctionIdentifier(document.getText(), cursorIndex);
  if (result.identifier === "") return undefined;
  const snip = functionTokens.get(result.identifier);
  if (snip === undefined) return undefined;
  let c: MarkedString[] = [];
  if (snip.completion.label !== undefined) c.push(`# ${snip.completion.label}`);
  if (snip.completion.documentation !== undefined)
    c.push(`${snip.completion.documentation}`);
  return {
    activeParameter: 0,
    activeSignature: 0,
    signatures: [
      {
        label: snip.completion.label,
        parameters: snip.params,
        documentation: snip.completion.documentation,
      },
    ],
  };
};

// -
// Go To Definition
// -

connection.onDefinition((textDocumentIdentifier: DefinitionParams) => {
  const doc = documents.get(textDocumentIdentifier.textDocument.uri);
  if (doc === undefined) return;
  return doGoToDef(doc, textDocumentIdentifier.position);
});

const doGoToDef = (document: TextDocument, position: Position) => {
  const cursorIndex = positionToIndex(document.getText(), position);
  const result = findIdentifierAtCursor(document.getText(), cursorIndex);
  const snip = functionTokens.get(result.identifier);
  if (snip === undefined) return;
  return snip.definition;
};
