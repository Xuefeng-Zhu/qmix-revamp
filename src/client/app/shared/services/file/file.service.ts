import { Injectable } from '@angular/core';
import { EditorService } from '../editor/editor.service';
import { StorageService } from '../storage/storage.service';
import { File, Folder } from '../../models/file-models/index';

@Injectable()
export class FileService {
  private fileTreeKey = 'qmix-file-tree';
  private selectedFileKey = 'qmix-selected-file';
  private _fileTree: Folder;
  private _selectedFile: File;

  constructor(private storageService: StorageService,
              private editorService: EditorService) {
    this.loadFileTree();
  }

  openFile(file: File) {
    file.open = true;
    this.selectFile(file);
    this.saveFileTree();
  }

  closeFile(file: File) {
    file.open = false;
    this.saveFileTree();
  }

  selectFile(file: File) {
    this.selectedFile = file;
    this.editorService.content = file.tempContent;
  }

  saveFile(file: File) {
    file.content = this.editorService.content;
    file.saved = true;
    this.saveFileTree();
  }

  loadSelectedFile(): void {
    if (this.selectedFileId) {
      this.selectFile(this._fileTree.getFileById(this.selectedFileId));
    }
  }

  selectedFileChanged(): void {
    this.selectedFile.tempContent = this.editorService.content;
    this.selectedFile.saved = this.selectedFile.tempContent === this.selectedFile.content;
  }

  saveFileTree(): void {
    const fileTreeJson = this.fileTree.contents.map((fileItem) => {
      return fileItem.toObject();
    });
    this.storageService.set(this.fileTreeKey, fileTreeJson);
  }

  private loadFileTree(): void {
    const parseFileItem = (fileItem: any): File|Folder => {
      if (fileItem.itemType === 'file') {
        return new File(fileItem.name, fileItem.content, fileItem.open, fileItem.id);
      } else if (fileItem.itemType === 'folder') {
        return new Folder(fileItem.name, fileItem.contents.map(parseFileItem), fileItem.expanded);
      } else {
        return null;
      }
    };
    
    const fileTreeJson = this.storageService.get(this.fileTreeKey) || [];
    const contents = fileTreeJson.map(parseFileItem);
    this._fileTree = new Folder('', contents);
  }

  get openFiles(): File[] {
    return this.fileTree.openFiles;
  }

  get fileTree(): Folder {
    return this._fileTree;
  }

  get selectedFile(): File {
    return this._selectedFile;
  }
  
  set selectedFile(file: File) {
    this._selectedFile = file;
    this.storageService.set(this.selectedFileKey, file.id);
  }

  get selectedFileId(): string {
    return this.storageService.get(this.selectedFileKey);
  }
}
