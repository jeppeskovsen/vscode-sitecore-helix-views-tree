import * as vscode from 'vscode';

export type SitecoreHelixViewsTreeConfig = {
	enabled: boolean;
	publishFolder?: string;
  foldersToLookThrough: string[];
}

export function getConfiguration(context: vscode.ExtensionContext): SitecoreHelixViewsTreeConfig {
  const config = vscode.workspace.getConfiguration('sitecoreHelixViewsTree');
	const enabled = context.extensionMode === vscode.ExtensionMode.Development || config.get<boolean>('enabled', false);

	let publishFolder = config.get<string>('foundationFolder');
	if (context.extensionMode === vscode.ExtensionMode.Development) {
		publishFolder = context.asAbsolutePath("test\\artifact");
	}

	const foldersToLookThrough: string[] = [];

	let foundationFolder = config.get<string>('foundationFolder');
	if (context.extensionMode === vscode.ExtensionMode.Development) {
		foundationFolder = context.asAbsolutePath("test\\src\\Foundation");
	}

	if (foundationFolder) {
		foldersToLookThrough.push(foundationFolder);
	}

	let featureFolder = config.get<string>('featureFolder');
	if (context.extensionMode === vscode.ExtensionMode.Development) {
		featureFolder = context.asAbsolutePath("test\\src\\Feature");
	}

	if (featureFolder) {
		foldersToLookThrough.push(featureFolder);
	}

	let projectFolder = config.get<string>('projectFolder');
	if (context.extensionMode === vscode.ExtensionMode.Development) {
		projectFolder = context.asAbsolutePath("test\\src\\Project");
	}

	if (projectFolder) {
		foldersToLookThrough.push(projectFolder);
	}

  return {
		publishFolder,
		enabled,
    foldersToLookThrough
  };
}