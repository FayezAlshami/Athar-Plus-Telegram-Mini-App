declare module "gsap/SplitText" {
  export class SplitText {
    chars: HTMLElement[];
    words: HTMLElement[];
    lines: HTMLElement[];
    revert: () => void;
    static create(target: Element, config: { type: string; mask?: "lines" | "words" | "chars"; aria?: "auto" | "hidden" | "none" }): SplitText;
  }
}
