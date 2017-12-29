'use strict';
import { debug } from 'util';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let terminalStack: vscode.Terminal[] = [];

  function getLatestTerminal() {
    return terminalStack[terminalStack.length - 1];
  }

  vscode.window.onDidCloseTerminal(() => {
    terminalStack = [];
  });

  const runJest = vscode.commands.registerCommand('extension.runJest', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const selection = editor.selection;
    const text = editor.document.getText(selection);

    if (terminalStack.length === 0) {
      terminalStack.push(vscode.window.createTerminal('jest'));
    }
    const terminal = getLatestTerminal();
    terminal.show();
    terminal.sendText(`yarn test -t '${text}'`);
  });

  const debugJest = vscode.commands.registerCommand('extension.debugJest', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const selection = editor.selection;
    const text = editor.document.getText(selection);

    const config = {
      name: 'Debug Jest Tests',
      type: 'node',
      request: 'launch',
      port: 9229,
      runtimeArgs: [],
      console: 'integratedTerminal',
      internalConsoleOptions: 'neverOpen'
    };
    const jestPath = process.platform.includes('win32')
      ? '${workspaceRoot}/node_modules/jest/bin/jest.js'
      : '${workspaceRoot}/node_modules/.bin/jest';
    config.runtimeArgs.push('--inspect-brk');
    config.runtimeArgs.push(jestPath);
    config.runtimeArgs.push('--runInBand');
    config.runtimeArgs.push('-t ' + text);
    vscode.debug.startDebugging(undefined, config);
  });

  context.subscriptions.push(runJest);
  context.subscriptions.push(debugJest);
}

export function deactivate() {
  // deactivate
}
