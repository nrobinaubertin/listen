import { Component, EventEmitter, Output, ViewChild, Input, OnInit } from "@angular/core";
import { SearchService } from "./search.service";
import { File } from "./File";
import { Observable } from "rxjs/Observable";

@Component({
    selector: "search-bar",
    templateUrl: "search-bar.component.html"
})
export class SearchBarComponent {
    @Output() onFoundFiles = new EventEmitter<File[]>();
    @Input() query: string;
    mode: string = "s";
    searchTerm: string = "";
    request: Observable<string>;
    requestStartTime: number;

    constructor(private searchService: SearchService) {}

    ngOnInit() {
        let input = document.getElementById('searchInput');
        input.focus();
    }

    selectMode(mode : string): void {
        switch (mode) {
            case "s":
                this.mode = "s";
                //document.querySelector('.search-bar .modeToggle > i').classList.remove("glyphicon-search");
                //document.querySelector('.search-bar .modeToggle > i').classList.add("glyphicon-folder-close");
                document.getElementById('searchInput').removeAttribute("disabled");
                break;
            case "b":
                this.mode = "b";
                //document.querySelector('.search-bar .modeToggle > i').classList.add("glyphicon-search");
                //document.querySelector('.search-bar .modeToggle > i').classList.remove("glyphicon-folder-close");
                document.getElementById('searchInput').setAttribute("disabled","true");
                break;
            default:
                console.log("unknown mode");
                break;
        }
    }

    alternateMode(): void {
        if(this.mode == "s") {
            this.selectMode("b");
            this.browse("");
            this.query = "/";
        } else {
            this.selectMode("s");
            this.search("");
            this.query = "";
        }
    }
    
    browse(s: string) {
        if (s !== undefined && s !== "" && s !== null) {
            this.query = s;
            s = encodeURI(s.replace(/\s+/gi,"+"));
        } else {
            this.query = "";
            s = "";
        }
        history.replaceState({}, "", window.location.href.replace(/#.*/, "") + "#/b/" + s);
        this.searchService.browse(s).subscribe(
            r => {
                this.onFoundFiles.emit(r);
            },
            error => console.log(error)
        );
    }

    search(s: string) {
        if (s !== undefined && s !== "" && s !== null) {
            s = encodeURI(s.replace(/\s+/g,"+"));
        } else {
            s = "";
        }
        if(this.searchTerm == s) {
            // nothing changed, false alert.
            return;
        }
        history.replaceState({}, "", window.location.href.replace(/#.*/, "") + "#/s/" + s);
        this.searchTerm = s;
        if (s.length < 1) {
            this.onFoundFiles.emit([]);
            return;
        }
        let that:any = this;
        let request: Observable<string> = this.searchService.search(s);
        window.setTimeout(function() {
            if(that.searchTerm == s) {
                that.request = request;
                that.requestStartTime = Date.now();
                request.subscribe(
                    r => {
                        if(that.searchTerm == s) {
                            let duration:number = Date.now() - that.requestStartTime;
                            console.log("request duration : "+duration+"ms");
                            that.onFoundFiles.emit(r);
                        }
                    },
                    error => console.log(error)
                );
            }
        }, 300);
    }
}
