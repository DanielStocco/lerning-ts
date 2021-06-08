import { Draggable } from '../models/drag-drop'
import { Component } from "./base-component";
import { autobind } from "../decorators/autobind";
import { Project } from "../models/project";

export class ProjectItem extends Component<HTMLUListElement, HTMLLinkElement> implements Draggable {
    constructor(hostId: string, private project: Project) {
        super( 'single-project', hostId, false, project.id);
        this.configure();
        this.renderContent();
        this.element.draggable = true;

    }

    @autobind
    dragStartHandler(event: DragEvent): void {
        event.dataTransfer!.setData('text/plain', this.project.id);
        event.dataTransfer!.effectAllowed = 'move';
    }

    @autobind
    dragEndHandler(event: DragEvent): void {
        console.log(event);
    }

    configure(): void {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }

    renderContent(): void {
        const header = document.createElement('h2');
        const subHeader = document.createElement('h3');
        const content = document.createElement('p');
        header.textContent = this.project.title;
        subHeader.textContent = this._getAssignament();
        content.textContent = this.project.description;
        this.element.appendChild(header)
        this.element.appendChild(subHeader)
        this.element.appendChild(content)
    }

    private _getAssignament () {
        if (this.project.people === 1)  return ' 1 Person';
        return `${this.project.people} Persons`
    }

}
