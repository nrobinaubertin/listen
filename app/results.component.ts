import { Component, Input, Output, EventEmitter } from "@angular/core";

import { FileComponent } from "./file.component";
import { File } from "./File";
import { SearchService } from "./search.service";

@Component({
    selector: "results",
    template: `
        <perfect-scrollbar style="height: 100%;">
            <file
                *ngFor="let file of files"
                [class.active]="currentSong == file.src"
                (click)="selectFile(file.src)"
                [attr.data-src]="file.src"
                [file]="file"
            >
            </file>
        </perfect-scrollbar>
    `
})
export class ResultsComponent {
    @Input() files: File[] = [];
    @Output() onPlaySong = new EventEmitter<string>();
    @Output() onOpenDir = new EventEmitter<string>();
    currentSong: string;

    constructor(public searchService: SearchService) {}

    selectFile(src: string) {
        if (src.match(/\.mp3$/)) {
            this.loadSong(src);
        } else {
            this.onOpenDir.emit(src);
        }
    }

    loadSong(src: string) {
        this.currentSong = src;
        this.onPlaySong.emit(this.currentSong);
    }
}
