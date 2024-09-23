import * as vscode from 'vscode';
import path from "node:path";
import { type SitecoreHelixViewFile } from './SitecoreHelixViewFile';

export class SitecoreHelixViewDirectory extends vscode.TreeItem {
	constructor(
		label: string,
		collapsibleState?: vscode.TreeItemCollapsibleState,
		public readonly children: (SitecoreHelixViewDirectory | SitecoreHelixViewFile)[] = []
	) {
		super(label, collapsibleState);
		
		const iconFileName = "folder.svg";

		this.iconPath = {
			light: path.join(__filename, '..', '..', 'resources', iconFileName),
			dark: path.join(__filename, '..', '..', 'resources', iconFileName)
		};

		this.contextValue = "treeItemDirectory";
	}
}