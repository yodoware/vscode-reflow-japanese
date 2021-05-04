import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "reflow-japanese.reflow",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        reflow(editor);
      }
    }
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}

export function reflow(editor: vscode.TextEditor): Thenable<void> {
  return editor
    .edit((editBuilder: vscode.TextEditorEdit) => {
      const point = editor.selection.active;
      const grammar = detectGrammar(editor, point);
      let lineText = editor.document.lineAt(point.line).text;
      let range: vscode.Range | undefined;
      const hasNextLine = point.line + 1 < editor.document.lineCount;
      if (hasNextLine && lineText.match(/^\s*$/) !== null) {
        const position = new vscode.Position(point.line + 1, 0);
        editor.selection = new vscode.Selection(position, position);
        return;
      } else if (hasNextLine && point.character === lineText.length) {
        let nextLineText = editor.document.lineAt(point.line + 1).text;
        if (nextLineText.match(/^\s*$/) !== null) {
          const position = new vscode.Position(
            point.line + 1,
            nextLineText.length
          );
          editor.selection = new vscode.Selection(position, position);
          return;
        }
        range = new vscode.Range(
          new vscode.Position(point.line, 0),
          new vscode.Position(point.line + 1, nextLineText.length)
        );
        if (grammar === "cppcomment") {
          nextLineText = nextLineText.replace(/^\s*\/\/ /, "");
        } else if (grammar === "ccomment") {
          nextLineText = nextLineText.replace(/^\s*\* /, "");
        } else {
          nextLineText = nextLineText.replace(/^\s*/, "");
        }
        if (
          lineText.length > 0 &&
          isLatin(lineText.charAt(lineText.length - 1)) &&
          nextLineText.length > 0 &&
          isLatin(nextLineText.charAt(0))
        ) {
          lineText += " " + nextLineText;
        } else {
          lineText += nextLineText;
        }
      } else {
        range = new vscode.Range(
          new vscode.Position(point.line, 0),
          new vscode.Position(point.line, lineText.length)
        );
      }
      const tabLength = Number(editor.options.tabSize ?? 4);
      const lineLength: number =
        vscode.workspace.getConfiguration("reflowJapanese").get("lineLength") ??
        74;
      const out = reflowText(lineText, grammar, tabLength, lineLength);
      editor.selection = new vscode.Selection(range.end, range.end);
      editBuilder.replace(range, out);
    })
    .then(() => {
      editor.selection = new vscode.Selection(
        editor.selection.active,
        editor.selection.active
      );
    });
}

function isSpace(ch: string): boolean {
  return ch === " " || ch === "\t";
}

function isLatin(ch: string): boolean {
  return ch.charCodeAt(0) < 0x02b0;
}

function isGyotoKinsoku(s: string): boolean {
  return "、。，．・？！゛゜ヽヾゝゞ々ー）］｝」』".indexOf(s) >= 0;
}

function isGyomatsuKinsoku(s: string): boolean {
  return "（［｛「『".indexOf(s) >= 0;
}

function getWidth(s: string): number {
  let width = 0;
  for (let i = 0; i < s.length; ++i) {
    width += isLatin(s.charAt(i)) ? 1 : 2;
  }
  return width;
}

function detectGrammar(
  editor: vscode.TextEditor,
  point: vscode.Position
): string {
  const lineText = editor.document.lineAt(point.line).text;
  if (lineText.match(/^\s*\* /) !== null) {
    for (let line = point.line - 1; line >= 0; --line) {
      const prevLineText = editor.document.lineAt(line).text;
      if (prevLineText.match(/^\s*\/\*/) !== null) {
        return "ccomment";
      } else if (prevLineText.match(/^\s*\* /) === null) {
        break;
      }
    }
  }
  if (lineText.match(/^\s*[\*\+\-] /) !== null) {
    return "markdown";
  } else if (lineText.match(/^\s*\/\/ /) !== null) {
    return "cppcomment";
  } else {
    return "plaintext";
  }
}

function reflowText(
  lineText: string,
  grammar: string,
  tabLength: number,
  lineLength: number
): string {
  const match = lineText.match(/^\s*/);
  let indent = match !== null ? match[0] : "";
  let indentWidth = 0;
  for (let i = 0; i < indent.length; ++i) {
    indentWidth += indent.charAt(i) === "\t" ? tabLength : 1;
  }
  lineText = lineText.substr(indent.length);
  let firstIndent: string;
  if (grammar === "markdown") {
    const markdown = lineText.match(/^[\*\+\-] /) || [""];
    lineText = lineText.substr(2);
    firstIndent = indent + markdown[0];
    indent += "  ";
    indentWidth += 2;
  } else if (grammar === "cppcomment") {
    lineText = lineText.substr(3);
    indent += "// ";
    firstIndent = indent;
    indentWidth += 3;
  } else if (grammar === "ccomment") {
    lineText = lineText.substr(2);
    indent += "* ";
    firstIndent = indent;
    indentWidth += 2;
  } else {
    firstIndent = indent;
  }
  const contentWidth = lineLength - indentWidth;
  if (contentWidth <= 0) {
    return "";
  }
  let out = "";
  let row = 0;
  const output = (s: string) => {
    let width = getWidth(s);
    if (row !== 0 && row + width > contentWidth) {
      let i;
      for (i = out.length - 1; i >= 0; --i) {
        if (!isSpace(out.charAt(i))) {
          break;
        }
      }
      out = out.substr(0, i + 1);
      if (!isGyotoKinsoku(s) || row + width > contentWidth + 2) {
        if (out.length > 0 && isGyomatsuKinsoku(out.charAt(out.length - 1))) {
          const lastCh = out.charAt(out.length - 1);
          out = out.substr(0, out.length - 1) + "\n";
          s = lastCh + s;
          width += getWidth(lastCh);
        } else {
          out += "\n";
        }
        row = 0;
      }
    }
    if (row === 0 && isSpace(s)) {
      return;
    }
    if (out.length === 0) {
      out += firstIndent;
    } else if (out.charAt(out.length - 1) === "\n") {
      out += indent;
    }
    out += s;
    row += width;
  };
  const STATE_LATIN = 1;
  const STATE_NON_LATIN = 2;
  const STATE_LATIN_SPACE = 3;
  let state = STATE_LATIN;
  let latinWord = "";
  for (let i = 0; i < lineText.length; ++i) {
    const ch = lineText.charAt(i);
    switch (state) {
      case STATE_LATIN:
        if (isSpace(ch)) {
          output(latinWord);
          latinWord = "";
          output(ch);
          state = STATE_LATIN_SPACE;
        } else if (isLatin(ch)) {
          latinWord += ch;
          state = STATE_LATIN;
        } else {
          output(latinWord);
          latinWord = "";
          output(ch);
          state = STATE_NON_LATIN;
        }
        break;
      case STATE_NON_LATIN:
        if (isLatin(ch)) {
          latinWord += ch;
          state = STATE_LATIN;
        } else {
          output(ch);
          state = STATE_NON_LATIN;
        }
        break;
      case STATE_LATIN_SPACE:
        if (isSpace(ch)) {
          output(ch);
          state = STATE_LATIN_SPACE;
        } else if (isLatin(ch)) {
          latinWord += ch;
          state = STATE_LATIN;
        } else {
          output(ch);
          state = STATE_NON_LATIN;
        }
        break;
    }
  }
  output(latinWord);
  return out;
}
