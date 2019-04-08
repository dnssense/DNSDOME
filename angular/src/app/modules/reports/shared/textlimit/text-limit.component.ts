import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-text-limit',
  templateUrl: './text-limit.component.html',
  styleUrls: ['./text-limit.component.css']
})
export class TextLimitComponent implements OnInit {

  public croppedText: string;
  public static trail: string = '...';

  @Input()
  public text: string;
  @Input()
  public limit: number = 100;

  constructor() { }

  ngOnInit() {
    this.text = "" + this.text;
    this.text = (this.text != null) ? this.text.trim() : "";
    if (this.text.length > this.limit) {
      this.croppedText = this.text.substring(0, this.limit) + TextLimitComponent.trail;
    } else {
      this.croppedText = this.text;
    }
  }

}
