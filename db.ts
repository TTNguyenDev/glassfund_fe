import Dexie, { Table } from 'dexie';
import { Project } from './services/projectService';

export class MySubClassedDexie extends Dexie {
    projects!: Table<Project>;

    constructor() {
        super('glass_fund');
        this.version(1).stores({
            projects: 'id, projectId, accountId, title',
        });
    }
}

export const db = new MySubClassedDexie();
