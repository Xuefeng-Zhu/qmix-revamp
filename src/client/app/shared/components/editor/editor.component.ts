import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';

// Services
import { CompilerService } from '../../services/compiler/compiler.service';
import { EditorService } from '../../services/editor/editor.service';
import { FileService } from '../../services/file/file.service';

// Models
import { File } from '../../models/file.model';

// Ace editor imports
import * as ace from 'brace';
import 'brace/mode/javascript';
import './styling/ace.theme';
import './styling/solidity.mode';

@Component({
  moduleId: module.id,
  selector: 'sd-editor',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.css']
})
export class EditorComponent implements AfterViewInit {
  private container = 'ace-container';
  private editor: any;

  constructor(private fileService: FileService,
              private editorService: EditorService,
              private changeDetector: ChangeDetectorRef,
              private compilerService: CompilerService) { }

  ngAfterViewInit(): void {
    this.initEditor();
    this.initShortcuts();
    this.initSaveCheck();
  }

  selectFile(file: File): void {
    this.fileService.selectFile(file);
    this.compilerService.requestCompilation();
  }

  closeFile(file: File): void {
    this.fileService.closeFile(file);
  }

  closeAll(): void {
    this.openFiles.forEach((file) => {
      this.closeFile(file);
    });
  }

  isSelected(file: File): boolean {
    return file === this.selectedFile;
  }

  private initEditor(): void {
    this.editor = ace.edit(this.container);
    this.editor.getSession().setMode('ace/mode/javascript');
    this.editor.setTheme('ace/theme/qmix');
    this.editor.getSession().on('change', () => {
      this.fileService.onSelectedFileContentChanged();
    });

    this.editorService.editor = this.editor;

    this.fileService.loadSelectedFile();
    this.changeDetector.detectChanges();
  }

  private initShortcuts(): void {
    const commands = this.editor.commands;

    commands.addCommand({
      name: 'save',
      bindKey: {
        win: 'Ctrl-S',
        mac: 'Command-S'
      },
      exec: () => {
        this.fileService.saveFile(this.selectedFile);
      }
    });
  }

  private initSaveCheck(): void {
    // Listen to an unload (window close) event
    window.addEventListener('beforeunload', (event: Event) => {
      // Confirm with the user before closing if we have unsaved files
      if (this.fileService.hasUnsavedFiles) {
        event.returnValue = true;
      }
    });
  }

  get openFiles(): File[] {
    return this.fileService.openFiles;
  }

  get selectedFile(): File {
    return this.fileService.selectedFile;
  }
}
