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

class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importNode = document.importNode(this.templateElement.content, true);
        this.element = importNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;

        this.attach();
        this.renderContent()

    }

    private renderContent() {
        this.element.querySelector('ul')!.id = `${this.element.id}-list`;
        this.element.querySelector('h2')!.textContent = this.element.id.toUpperCase();

    }
    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
}

class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    form: HTMLFormElement
    titleInputElement: HTMLInputElement;
    descInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;
    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importNode = document.importNode(this.templateElement.content, true);
        this.form = importNode.firstElementChild as HTMLFormElement;
        this.form.id = 'user-input';

        this.titleInputElement = this.form.querySelector('#title') as HTMLInputElement;
        this.descInputElement = this.form.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.form.querySelector('#people') as HTMLInputElement;


        this.configure();
        this.attach();

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


    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const data = this.gatherUserInput();
        if (Array.isArray(data)) {
            const [title,  desc, people] = data
            console.log(title, desc, people);
        }

    }

    private configure() {
        this.form.addEventListener('submit', this.submitHandler)
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.form);
    }
}


const prjInput = new ProjectInput()
const activeProjects = new ProjectList('active');
const finishedProjects = new ProjectList('finished');