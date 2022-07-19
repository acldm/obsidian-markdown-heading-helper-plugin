import {App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';
import {Arr} from "tern";
import {start} from "repl";

const HEAD_REG: RegExp = /^(\#{1,6})([^\#\n]+)$/m;
const CLEAR_HEADING: RegExp = /^(\#*[\s\n]*)/m;

export default class MarkdownHeadingHelperPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: 'indent-heading',
			name: 'Indent Heading',
			hotkeys: [
				{modifiers: ["Mod", "Shift"], key: ">"}
			],
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.indentHeading(editor);
			}
		});

		this.addCommand({
			id: 'hoist-heading',
			name: 'hoist Heading',
			hotkeys: [
				{modifiers: ["Mod", "Shift"], key: "<"}
			],
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.hoistHeading(editor);
			}
		});

		this.addCommand({
			id: 'sibling-heading',
			name: 'sibling Heading',
			hotkeys: [
				{modifiers: ["Mod", "Shift"], key: "/"}
			],
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.siblingHeading(editor);
			}
		});

	}

	indentHeading(editor: Editor) {
		this.insertHeading(editor, 1);
	}

	hoistHeading(editor: Editor) {
		this.insertHeading(editor, -1);
	}

	siblingHeading(editor: Editor) {
		this.insertHeading(editor, 0, true);

	}

	insertHeading(editor: Editor, increment: number, isPrevious: boolean = false) {
		const cursor = editor.getCursor();

		let startHead = cursor.line;
		const findedHead = this.findPreviousHeadLevel(editor, startHead - (isPrevious ? 1 : 0));
		if (findedHead !== -1) {
			const insertHead = Math.min(Math.max(findedHead + increment, 1), 6)
			const str = editor.getLine(startHead);
			const heading = CLEAR_HEADING.exec(str);
			let replaceTo = 0;
			if (heading) {
				replaceTo = heading[1].length;
			}

			editor.replaceRange("#".repeat(insertHead) + ' ', {
				line: cursor.line,
				ch: 0
			}, {
				line: cursor.line,
				ch: replaceTo
			})
		}
	}

	findPreviousHeadLevel(editor: Editor, startHead: number): number {
		while (startHead > 0) {
			let str = editor.getLine(startHead)
			const result = HEAD_REG.exec(str)
			if (!!result) {
				return result[1].length;
			}
			startHead--;
		}

		return -1;
	}
}
