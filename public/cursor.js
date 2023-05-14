class Cursor {
    #element;
    constructor(id) {
        this.id = id;
        this.#element = document.createElement('div');
        this.#element.className = 'custom-cursor';
        document.getElementsByTagName('body')[0].appendChild(this.#element);
    }

    show() { this.#element.style.display = ''; return; }
    hide() { this.#element.style.display = 'none'; return; }

    move(x, y, lineWidth, color) {
        this.#element.style.width = `${lineWidth}px`;
        this.#element.style.height = `${lineWidth}px`;
        this.#element.style.left = `${x}px`;
        this.#element.style.top = `${y}px`;
        this.#element.style.background = `${color}`;
        return;
    }
}