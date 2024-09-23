import * as vscode from 'vscode';
import { SitecoreHelixViewFile } from './SitecoreHelixViewFile';
import { SitecoreHelixViewDirectory } from './SitecoreHelixViewDirectory';
import { SitecoreHelixViewsTreeConfig } from './configuration';
import path from 'node:path';
import fs from 'node:fs/promises';

type TreeNode = { [key: string]: TreeNode | string }; // A directory is a TreeNode, and a file is represented by `null`.
type TreeNodeFileInfo = { absolutePath: string, relativePath: string };

type SitecoreHelixViewItem = SitecoreHelixViewFile | SitecoreHelixViewDirectory;

function alphabetically(a: SitecoreHelixViewItem, b: SitecoreHelixViewItem) {
	if ((a.label as string) < (b.label as string)) {
		return -1;
	}
	if ((a.label as string) > (b.label as string)) {
		return 1;
	}

	return 0;
}

export class SitecoreHelixViewsDataProvider implements vscode.TreeDataProvider<SitecoreHelixViewItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<SitecoreHelixViewItem | undefined | void> = new vscode.EventEmitter<SitecoreHelixViewItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<SitecoreHelixViewItem | undefined | void> = this._onDidChangeTreeData.event;

	constructor(private configuration: SitecoreHelixViewsTreeConfig) { }

	getTreeItem(element: SitecoreHelixViewItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: SitecoreHelixViewItem): Thenable<SitecoreHelixViewItem[]> {
		if (element) {
			return Promise.resolve(element.children);
		}

		return new Promise((resolve, reject) => {
			this.getViewFiles().then(files => {
				const tree = this.buildPathTree(files);
				const structure = this.buildFolderStructure(tree, "root").children as SitecoreHelixViewItem[];

				//structure.push(new SitecoreHelixViewDirectory("Refresh", vscode.TreeItemCollapsibleState.None, []));

				resolve(structure);
			});
		});
	}

	refresh(): void {
		// Optionally update items here
		this._onDidChangeTreeData.fire(); // Notify that the data has changed
	}

	private async getViewFiles() {
		const viewFiles: TreeNodeFileInfo[] = [];

		for (const folder of this.configuration.foldersToLookThrough) {
			const files = await this.findCshtmlFiles(folder);
			for (const absolutePath of files) {
				const [, relativePath] = absolutePath.split("\\code\\");
				if (relativePath) {
					viewFiles.push({ absolutePath, relativePath });
				}
			}
		}

		return viewFiles;
	}

	private buildFolderStructure(node: Record<string, any>, folderName: string = ''): SitecoreHelixViewItem {
		const folders: SitecoreHelixViewItem[] = [];
		const files: SitecoreHelixViewItem[] = [];
	
		// Traverse each key in the node
		for (const key in node) {
			if (typeof node[key] === 'string') {
				// If it's a string, it's a file (absolute path)
				const filename = path.basename(key);
				files.push(new SitecoreHelixViewFile(filename, vscode.Uri.file(node[key])));
			} else {
				// If it's an object, it's a folder
				folders.push(this.buildFolderStructure(node[key], key));
			}
		}

		folders.sort(alphabetically);
		files.sort(alphabetically);

		const contents = [...folders, ...files];
	
		return new SitecoreHelixViewDirectory(folderName, vscode.TreeItemCollapsibleState.Collapsed, contents);
	};

	private buildPathTree(files: TreeNodeFileInfo[]): TreeNode {
		const root: TreeNode = {};
	
		files.forEach(({ absolutePath, relativePath }) => {
			const parts = relativePath.split('\\'); // Split the relative path by the backslashes (for Windows paths).
			let current = root;
	
			// Traverse or create the folder structure.
			parts.forEach((part, index) => {
				if (index === parts.length - 1) {
					// If it's the last part (the file), assign the absolute path.
					current[part] = absolutePath;
				} else {
					// Otherwise, keep building the tree for directories.
					current[part] = current[part] || {};
					current = current[part] as TreeNode;
				}
			});
		});
	
		return root;
	};

	private async findCshtmlFiles(dir: string): Promise<string[]> {
		let cshtmlFiles: string[] = [];

		try {
			const files = await fs.readdir(dir, { withFileTypes: true });

			for (const file of files) {
				const fullPath = path.join(dir, file.name);

				if (file.isDirectory()) {
					// Recursively search in subdirectories
					const subDirFiles = await this.findCshtmlFiles(fullPath);
					cshtmlFiles = cshtmlFiles.concat(subDirFiles);
				} else if (file.isFile() && fullPath.endsWith('.cshtml')) {
					// If the file is a .cshtml file, add it to the list
					cshtmlFiles.push(fullPath);
				}
			}
		} catch (err: any) {
			vscode.window.showErrorMessage(`Error reading directory ${dir}: ${err.message}`);
		}

		return cshtmlFiles;
	}
}