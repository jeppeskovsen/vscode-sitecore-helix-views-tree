import * as vscode from 'vscode';
import fs from "node:fs/promises";
import path from "node:path";
import { getConfiguration } from './configuration';
import { SitecoreHelixViewsDataProvider } from './SitecoreHelixViewsDataProvider';
import { type SitecoreHelixViewFile } from './SitecoreHelixViewFile';

export function activate(context: vscode.ExtensionContext) {
	const config = getConfiguration(context);
	const sitecoreHelixViewsDataProvider = new SitecoreHelixViewsDataProvider(config);

	context.subscriptions.push(vscode.commands.registerCommand('sitecoreHelixViewsTree.refreshTree', () => {
		sitecoreHelixViewsDataProvider.refresh();
	}));

	vscode.workspace.onDidChangeConfiguration(() => {
		sitecoreHelixViewsDataProvider.refresh();
	});

	if (!config.enabled) {
		return;
	}

	context.subscriptions.push(vscode.commands.registerCommand('sitecoreHelixViewsTree.publishFile', async (file: SitecoreHelixViewFile) => {
		if (!config.publishFolder) {
			vscode.window.showInformationMessage("You need to configure publishFolder setting to publish");
			return;
		}

		try {
			const filePath = file.filePath.path.substring(1);
			const [, relativePath] = filePath.split("/code/");
			const dest = path.join(config.publishFolder, relativePath);
			const destFolder = path.dirname(dest);
			await fs.mkdir(destFolder, { recursive: true });
			await fs.copyFile(filePath, dest);

			vscode.window.showInformationMessage(`File published: ${relativePath}`);
		} catch (error: any) {
			vscode.window.showErrorMessage(`Could not publish file: ${error.message}`);
		}
	}));

	if (config.foldersToLookThrough.length === 0) {
		vscode.window.showInformationMessage("You need to configure setting for source folders");
		return;
	}

	vscode.window.registerTreeDataProvider('sitecoreHelixViewsTree', sitecoreHelixViewsDataProvider);

	vscode.commands.registerCommand('sitecoreHelixViewsTree.openFile', async (fileUri: vscode.Uri) => {
		try {
			const document = await vscode.workspace.openTextDocument(fileUri);
			await vscode.window.showTextDocument(document);
		} catch (error: any) {
			vscode.window.showWarningMessage(`Failed to open as text document. Trying default file opener...`);

			try {
				await vscode.commands.executeCommand('vscode.open', fileUri);
			} catch (fallbackError: any) {
				vscode.window.showErrorMessage(`Could not open the file: ${fallbackError.message}`);
			}
		}
	});
}

// This method is called when your extension is deactivated
export function deactivate() { }
