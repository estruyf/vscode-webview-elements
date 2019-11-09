import { LitElement, html, css, property, customElement } from 'lit-element';
import { nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import getBaseURL from './utils/getBaseURL';

const BASE_URL = getBaseURL();
const cachedIcons: Map<string, TemplateResult> = new Map();

const fetchIcon = async (name: string) => {
  let res: Response;
  let icon: TemplateResult;

  try {
    res = await fetch(`${BASE_URL}icons/light/${name}.svg`);
  } catch(error) {
    console.error(error);
  }

  try {
    const markup = await res.text();
    icon = html`${unsafeHTML(markup)}`;
  } catch(error) {
    console.error(error);
  }

  cachedIcons.set(name, icon);

  return Promise.resolve(icon);
};

@customElement('vscode-icon')
export class VscodeIcon extends LitElement {
  @property({ type: String })
  set name(name: string) {
    const cached = cachedIcons.get(name);
    this._name = name;

    if (!cached) {
      fetchIcon(name)
        .then((markup) => {
          this._iconMarkup = markup;
          this.requestUpdate();
        });
    } else {
      this._iconMarkup = cached;
      this.requestUpdate();
    }
  }
  get name(): string {
    return this._name;
  }
  @property({ type: Number }) size: number = 16;

  private _name: string = '';
  private _iconMarkup: TemplateResult = html`${nothing}`;

  static get styles() {
    return css`
      :host {
        display: inline-block;
      }

      span {
        background-position: center center;
        background-repeat: no-repeat;
        background-size: contain;
        display: block;
      }
    `;
  }

  render() {
    const size = `${this.size}px`;

    return html`
      <style>
        :host,
        svg {
          height: ${size};
          width: ${size};
        }

        svg {
          display: block;
        }

        :host-context(.vscode-light) span {
          background-image: url(${BASE_URL}icons/light/${this.name}.svg);
        }

        :host-context(.vscode-dark) span,
        :host-context(.vscode-high-contrast) span {
          background-image: url(${BASE_URL}icons/dark/${this.name}.svg);
        }
      </style>
      ${this._iconMarkup}
    `;
  }
}
