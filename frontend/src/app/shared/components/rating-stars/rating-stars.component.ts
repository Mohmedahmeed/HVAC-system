import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.css'],
})
export class RatingStarsComponent {
  @Input() value = 0;
  @Input() readonly = false;
  @Input() max = 5;
  @Input() ariaLabel = 'Rating';
  @Input() required = false;
  @Output() valueChange = new EventEmitter<number>();

  @ViewChildren('starBtn')
  starButtons?: QueryList<ElementRef<HTMLButtonElement>>;

  get values(): number[] {
    return Array.from({ length: this.max }, (_, i) => i + 1);
  }

  get displayLabel(): string {
    return `Rated ${this.value} out of ${this.max}`;
  }

  onSelect(star: number): void {
    if (this.readonly) {
      return;
    }
    this.setValue(star);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.readonly) {
      return;
    }

    let next: number | undefined;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      next = Math.min(this.max, this.value + 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      next = Math.max(1, this.value - 1);
    } else if (event.key === 'Home') {
      next = 1;
    } else if (event.key === 'End') {
      next = this.max;
    } else {
      return;
    }

    event.preventDefault();
    this.setValue(next);
    const button = this.starButtons?.toArray()[next - 1];
    button?.nativeElement.focus();
  }

  private setValue(star: number): void {
    this.value = star;
    this.valueChange.emit(star);
  }
}