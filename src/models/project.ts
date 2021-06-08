namespace App {

   export enum ProjectStatus {
        Active,
        Finished
    }

    export class Project {
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
}