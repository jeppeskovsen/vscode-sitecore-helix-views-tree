import * as vscode from 'vscode';
import path from "node:path";

export class SitecoreHelixViewFile extends vscode.TreeItem {
	constructor(
		label: string,
		public filePath: vscode.Uri,
		public readonly children = []
	) {
		super(label);

		this.contextValue = "treeItemFile";

		this.iconPath = new vscode.ThemeIcon('file-symlink-file');

		if (label.endsWith(".cshtml")) {
			const iconFileName = "cshtml.svg";
			this.iconPath = {
				light: path.join(__filename, '..', '..', 'resources', iconFileName),
				dark: path.join(__filename, '..', '..', 'resources', iconFileName)
			};
		}
		
		this.command = {
			command: 'sitecoreHelixViewsTree.openFile',
			title: 'Open File',
			arguments: [this.filePath]
		};
	}
}