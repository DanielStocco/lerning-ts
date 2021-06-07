interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}
interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

enum ProjectStatus {
    Active,
    Finished
}

class Project {
    private _id: string = Math.random().toString();

    get id(): string {
        return this._id;
    }


    constructor(
        private _title: string,
        private _description: string,
        private _people: number,
        private _status: ProjectStatus
    ) {
    }


    get status(): ProjectStatus {
        return this._status;
    }

    set status(value: ProjectStatus) {
        this._status = value;
    }

    get title(): string {
        return this._title;
    }

    get description(): string {
        return this._description;
    }

    get people(): number {
        return this._people;
    }
}

type Listener<T> = (items: T[]) => void;

class State<T>{
    protected _listeners: Listener<T> [] = [];

    addListener(listenerFn: Listener<T>){
        this._listeners.push(listenerFn)
    }
}


class ProjectState extends State<Project>{
    private _projects: Project [] = [];
    private static _instance: ProjectState;

    private constructor(){ super(); }

    static get instance() {
        if (!this._instance) {
            this._instance = new ProjectState();
        }
        return this._instance;
    }

    get projects(): Project[] {
        return this._projects;
    }
    addProject (project: Project ) {
        this._projects.push(project);
        this._callListeners();
    }
    moveProject (projectId: string, newStatus: ProjectStatus) {
        const project = this.projects.find(project => project.id === projectId)
        if (!project) { return; }
        project.status = newStatus;
        this._callListeners();
    }

    private _callListeners() {
        for(const listenerFn of this._listeners) {
            listenerFn([...this._projects]);
        }
    }
}

const projectState = ProjectState.instance;




// Validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;

}

function validate(validatableInput: Validatable){
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (validatableInput.min != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value > validatableInput.min;
    }
    if (validatableInput.max != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value < validatableInput.max;
    }

    return isValid;
}
// Validation

//auto bind
function autobind(_: any, _2: string,  descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    return  <PropertyDescriptor> {
        configurable: true,
        get() {
            return originalMethod.bind(this);

        }
    }
}
//auto bind

//Component base
abstract class Compenent <T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(templateId: string, hostElementId: string, insertAtBeginning: boolean,  newElementId?: string) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;
        const importNode = document.importNode(this.templateElement.content, true);
        this.element = importNode.firstElementChild as U;
        if (newElementId) { this.element.id = newElementId; }
        this.attach(insertAtBeginning);
    }

    attach(insertAtBegginning: boolean) {
        const position = insertAtBegginning ? 'afterbegin' : 'beforeend'
        this.hostElement.insertAdjacentElement(position, this.element);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

class ProjectItem extends Compenent<HTMLUListElement, HTMLLinkElement> implements Draggable{
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


class ProjectList extends Compenent<HTMLDivElement, HTMLElement> implements DragTarget{
    assignedProjects: Project[] = [];
    ulId: string = '';
    ulElement: HTMLUListElement;
    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false,`${type}-projects`);
        this.ulElement = this.element.querySelector('ul')!
        this.configure()
        this.renderContent()
    }

    @autobind
    dragOverHandler(event: DragEvent): void {
        if(!event.dataTransfer || event.dataTransfer.types[0] !== 'text/plain'){ return; }
        event.preventDefault()
        this.ulElement.classList.add('droppable');
    }
    @autobind
    dropHandler(event: DragEvent): void {
        if(!event.dataTransfer || event.dataTransfer.types[0] !== 'text/plain'){ return; }
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
        projectState.addListener( (projects: Project[]): void => {
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

class ProjectInput extends Compenent<HTMLDivElement, HTMLFormElement>{
    renderContent(): void { }
    titleInputElement: HTMLInputElement;
    descInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input', 'app', false, 'user-input');
        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;
        this.configure()

    }

    configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }

    private gatherUserInput(): [string, string, number] | void {
        const title = this.titleInputElement.value;
        const desc = this.descInputElement.value;
        const people = +this.peopleInputElement.value;

        console.log([title, desc, people]);


        const titleValidatable: Validatable = {
            value: title,
            required: true,
            minLength: 5
        }

        const descValidatable: Validatable = {
            value: desc,
            required: true,
        }

        const peopleValidatable: Validatable = {
            value: +people,
            required: true,
            min: 10,
            max: 15
        }

        if(!validate(titleValidatable) || !validate(descValidatable) || !validate(peopleValidatable)) {
            console.log('TA LA JAPI');
            return;
        }
        return [ title,desc, people]

    }

    private clearInputs(): void {
        this.titleInputElement.value = '';
        this.descInputElement.value = '';
        this.peopleInputElement.value = '';
    }


    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const data = this.gatherUserInput();
        if (Array.isArray(data)) {
            const [title,  desc, people] = data
            const project = new Project(title, desc, people, ProjectStatus.Active);
            projectState.addProject(project)
            this.clearInputs();
        }

    }
}


const prjInput = new ProjectInput()
const activeProjects = new ProjectList('active');
const finishedProjects = new ProjectList('finished');

