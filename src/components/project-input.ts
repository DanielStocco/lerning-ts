/// <reference path = "base-component.ts"/>
/// <reference path = "../decorators/autobind.ts"/>
/// <reference path = "../utils/validations.ts"/>
/// <reference path = "../models/project.ts"/>
namespace App {
    export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
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
}