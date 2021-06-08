import {Component} from "./base-component.js";
import {DragTarget} from "../models/drag-drop.js";
import {Project, ProjectStatus} from "../models/project.js";
import {autobind} from "../decorators/autobind.js";
import {projectState} from "../state/app-state.js";
import {ProjectItem} from "./project-item.js";

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[] = [];
    ulId: string = '';
    ulElement: HTMLUListElement;

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects`);
        this.ulElement = this.element.querySelector('ul')!
        this.configure()
        this.renderContent()
    }

    @autobind
    dragOverHandler(event: DragEvent): void {
        if (!event.dataTransfer || event.dataTransfer.types[0] !== 'text/plain') {
            return;
        }
        event.preventDefault()
        this.ulElement.classList.add('droppable');
    }

    @autobind
    dropHandler(event: DragEvent): void {
        if (!event.dataTransfer || event.dataTransfer.types[0] !== 'text/plain') {
            return;
        }
        event.preventDefault()
        const projectId = event.dataTransfer!.getData('text/plain');
        const newStatus = this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
        projectState.moveProject(projectId, newStatus);
    }

    @autobind
    dragLeaveHandler(_: DragEvent): void {
        this.ulElement.classList.remove('droppable');
    }

    renderContent() {
        this.ulElement.id = this.ulId;
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);
        this.element.querySelector('h2')!.textContent = this.element.id.toUpperCase();

    }

    configure(): void {
        this.ulId = `${this.element.id}-list`;
        projectState.addListener((projects: Project[]): void => {
            this.assignedProjects = projects.filter(prj => {
                return this.type === 'active'
                    ? prj.status === ProjectStatus.Active
                    : prj.status === ProjectStatus.Finished
            });
            this._renderProject();
        });
    }

    private _renderProject() {
        const listEl = document.getElementById(this.ulId)!
        listEl.innerHTML = '';
        for (const assignetdProject of this.assignedProjects) {
            new ProjectItem(this.ulId, assignetdProject)
        }
    }
}
