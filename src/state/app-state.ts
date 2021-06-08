import {Project, ProjectStatus} from "../models/project";

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

export const projectState = ProjectState.instance;
