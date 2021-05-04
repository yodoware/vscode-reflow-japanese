import * as assert from "assert";
import * as vscode from "vscode";
import * as myExtension from "../../extension";

suite("Extension Test Suite", () => {
  test("Plain Text English", async () => {
    await vscode.commands.executeCommand(
      "workbench.action.files.newUntitledFile"
    );
    try {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        assert.fail();
      }
      await editor.edit((editBuilder: vscode.TextEditorEdit) => {
        editBuilder.insert(
          new vscode.Position(0, 0),
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        );
      });
      await myExtension.reflow(editor);
      assert.strictEqual(
        editor.document.getText(),
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod\r\n" +
          "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim\r\n" +
          "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea\r\n" +
          "commodo consequat."
      );
    } finally {
      await vscode.commands.executeCommand(
        "workbench.action.closeActiveEditor"
      );
    }
  });
  test("Plain Text Japanese", async () => {
    await vscode.commands.executeCommand(
      "workbench.action.files.newUntitledFile"
    );
    try {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        assert.fail();
      }
      await editor.edit((editBuilder: vscode.TextEditorEdit) => {
        editBuilder.insert(
          new vscode.Position(0, 0),
          "衆議院と参議院とが異なつた指名の議決をした場合に、法律の定めるところにより、両議院の協議会を開いても意見が一致しないとき、又は衆議院が指名の議決をした後、国会休会中の期間を除いて十日以内に、参議院が、指名の議決をしないときは、衆議院の議決を国会の議決とする。"
        );
      });
      await myExtension.reflow(editor);
      assert.strictEqual(
        editor.document.getText(),
        "衆議院と参議院とが異なつた指名の議決をした場合に、法律の定めるところにより、\r\n" +
          "両議院の協議会を開いても意見が一致しないとき、又は衆議院が指名の議決をした\r\n" +
          "後、国会休会中の期間を除いて十日以内に、参議院が、指名の議決をしないときは、\r\n" +
          "衆議院の議決を国会の議決とする。"
      );
    } finally {
      await vscode.commands.executeCommand(
        "workbench.action.closeActiveEditor"
      );
    }
  });
  test("C++ Comment", async () => {
    await vscode.commands.executeCommand(
      "workbench.action.files.newUntitledFile"
    );
    try {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        assert.fail();
      }
      await editor.edit((editBuilder: vscode.TextEditorEdit) => {
        editBuilder.insert(
          new vscode.Position(0, 0),
          "// 衆議院と参議院とが異なつた指名の議決をした場合に、法律の定めるところにより、両議院の協議会を開いても意見が一致しないとき、又は衆議院が指名の議決をした後、国会休会中の期間を除いて十日以内に、参議院が、指名の議決をしないときは、衆議院の議決を国会の議決とする。"
        );
      });
      await myExtension.reflow(editor);
      assert.strictEqual(
        editor.document.getText(),
        "// 衆議院と参議院とが異なつた指名の議決をした場合に、法律の定めるところに\r\n" +
          "// より、両議院の協議会を開いても意見が一致しないとき、又は衆議院が指名の\r\n" +
          "// 議決をした後、国会休会中の期間を除いて十日以内に、参議院が、指名の議決\r\n" +
          "// をしないときは、衆議院の議決を国会の議決とする。"
      );
    } finally {
      await vscode.commands.executeCommand(
        "workbench.action.closeActiveEditor"
      );
    }
  });
  test("C Comment", async () => {
    await vscode.commands.executeCommand(
      "workbench.action.files.newUntitledFile"
    );
    try {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        assert.fail();
      }
      await editor.edit((editBuilder: vscode.TextEditorEdit) => {
        editBuilder.insert(
          new vscode.Position(0, 0),
          "/*\r\n * 衆議院と参議院とが異なつた指名の議決をした場合に、法律の定めるところにより、両議院の協議会を開いても意見が一致しないとき、又は衆議院が指名の議決をした後、国会休会中の期間を除いて十日以内に、参議院が、指名の議決をしないときは、衆議院の議決を国会の議決とする。\r\n */"
        );
      });
      editor.selection = new vscode.Selection(
        new vscode.Position(1, 0),
        new vscode.Position(1, 0)
      );
      await myExtension.reflow(editor);
      assert.strictEqual(
        editor.document.getText(),
        "/*\r\n" +
          " * 衆議院と参議院とが異なつた指名の議決をした場合に、法律の定めるところに\r\n" +
          " * より、両議院の協議会を開いても意見が一致しないとき、又は衆議院が指名の\r\n" +
          " * 議決をした後、国会休会中の期間を除いて十日以内に、参議院が、指名の議決\r\n" +
          " * をしないときは、衆議院の議決を国会の議決とする。\r\n" +
          " */"
      );
    } finally {
      await vscode.commands.executeCommand(
        "workbench.action.closeActiveEditor"
      );
    }
  });
  test("Markdown Comment", async () => {
    await vscode.commands.executeCommand(
      "workbench.action.files.newUntitledFile"
    );
    try {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        assert.fail();
      }
      await editor.edit((editBuilder: vscode.TextEditorEdit) => {
        editBuilder.insert(
          new vscode.Position(0, 0),
          "* 衆議院と参議院とが異なつた指名の議決をした場合に、法律の定めるところにより、両議院の協議会を開いても意見が一致しないとき、又は衆議院が指名の議決をした後、国会休会中の期間を除いて十日以内に、参議院が、指名の議決をしないときは、衆議院の議決を国会の議決とする。"
        );
      });
      await myExtension.reflow(editor);
      assert.strictEqual(
        editor.document.getText(),
        "* 衆議院と参議院とが異なつた指名の議決をした場合に、法律の定めるところによ\r\n" +
          "  り、両議院の協議会を開いても意見が一致しないとき、又は衆議院が指名の議決\r\n" +
          "  をした後、国会休会中の期間を除いて十日以内に、参議院が、指名の議決をしな\r\n" +
          "  いときは、衆議院の議決を国会の議決とする。"
      );
    } finally {
      await vscode.commands.executeCommand(
        "workbench.action.closeActiveEditor"
      );
    }
  });
});
