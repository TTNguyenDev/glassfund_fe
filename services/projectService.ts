import { Task, TaskStatus } from '../models/types/jobType';
import { BlockChainConnector } from '../utils/blockchain';
import { utils } from 'near-api-js';
import { db } from '../db';
import { batchTransactions } from '../utils/serviceUtils';

export const FETCH_PROJECTS_LIMIT = 20;
export const CREATE_PROJECT_FEE = '1';

export type CreateProjectInput = {
    title: string;
    target: string;
    thumbnail?: string;
    body: string;
    minimunDeposite: string;
    startedAt: number;
    endedAt: number;
    funded: string;
    vestingStartTime: number;
    vestingEndTime: number;
    vestingInterval: number;
    claimed: string;
    forceStop: string[];
};

export type CreateProjectFinalInput = {
    title: string;
    description: string;
    target: string;
    minimunDeposite: string;
    startedAt: number;
    endedAt: number;
    funded: string;
    vestingStartTime: number;
    vestingEndTime: number;
    vestingInterval: number;
    claimed: string;
    forceStop: string[];
};

export type Project = {
    id: string;
    title: string;
    description: string;
    target: string;
    minimunDeposite: string;
    startedAt: number;
    endedAt: number;
    funded: string;
    vestingStartTime: number;
    vestingEndTime: number;
    vestingInterval: number;
    claimed: string;
    forceStop: string[];
};

export class ProjectService {
    private static mapToProject(raw: any): Project {
        return {
            id: raw.id,
            title: raw.title,
            description: raw.description,
            target: utils.format.formatNearAmount(raw.target),
            minimunDeposite: utils.format.formatNearAmount(
                raw.minimun_deposite
            ),
            startedAt: Math.floor(Number.parseInt(raw.started_at) / 1000000),
            endedAt: Math.floor(Number.parseInt(raw.ended_at) / 1000000),
            funded: utils.format.formatNearAmount(raw.funded),
            vestingStartTime: Math.floor(
                Number.parseInt(raw.vesting_start_time) / 1000000
            ),
            vestingEndTime: Math.floor(
                Number.parseInt(raw.vesting_end_time) / 1000000
            ),
            vestingInterval: Math.floor(
                Number.parseInt(raw.vesting_interval) / 1000000
            ),
            claimed: utils.format.formatNearAmount(raw.claimed),
            forceStop: raw.force_stop,
        };
    }

    static async createProject(
        payload: CreateProjectFinalInput
    ): Promise<void> {
        const createProjectTrans = {
            methodName: 'new_project',
            body: {
                title: payload.title,
                description: payload.description,
                target: utils.format.parseNearAmount(payload.target),
                minimun_deposite: utils.format.parseNearAmount(
                    payload.minimunDeposite
                ),
                started_at: payload.startedAt * 1000000,
                ended_at: payload.endedAt * 1000000,
                funded: utils.format.parseNearAmount(payload.funded),
                vesting_start_time: payload.startedAt * 1000000,
                vesting_end_time: payload.startedAt * 1000000,
                vesting_interval: payload.vestingInterval * 1000000,
                claimed: utils.format.parseNearAmount(payload.claimed),
                force_stop: payload.forceStop,
            },
            deposit: utils.format.parseNearAmount(CREATE_PROJECT_FEE)!,
        };
        await batchTransactions([createProjectTrans]);
        return;
    }

    static async supportProject(
        projectId: string,
        amount: number
    ): Promise<boolean> {
        return batchTransactions([
            {
                methodName: 'support_project',
                body: {
                    project_id: projectId,
                },
                deposit: utils.format.parseNearAmount(amount.toString())!,
            },
        ]);
    }

    static async forceStop(projectId: string): Promise<boolean> {
        return batchTransactions([
            {
                methodName: 'force_stop',
                body: {
                    project_id: projectId,
                },
            },
        ]);
    }

    static async claimReward(projectId: string): Promise<boolean> {
        return batchTransactions([
            {
                methodName: 'claim_reward',
                body: {
                    project_id: projectId,
                },
            },
        ]);
    }

    static async getListProjects({
        offset = 0,
        limit = FETCH_PROJECTS_LIMIT,
        filter,
    }: {
        offset?: number;
        limit?: number;
        filter?: {
            title?: string;
        };
    } = {}): Promise<Project[]> {
        const table = db.projects;

        let query = table.orderBy('id').offset(offset).limit(limit).toArray();

        if (filter) {
            const { title } = filter;
            if (title)
                return table
                    .filter((item) =>
                        item.title
                            .toLocaleLowerCase()
                            .includes(title.toLocaleLowerCase())
                    )
                    .offset(offset)
                    .limit(limit)
                    .sortBy('id');
        }
        return query;
    }

    static async getProject(projectId: string): Promise<Project> {
        const res = await BlockChainConnector.instance.contract.get_project({
            project_id: projectId,
        });

        return this.mapToProject(res);
    }

    static async getClaimableAmount(projectId: string): Promise<any> {
        const res =
            await BlockChainConnector.instance.contract.get_claimable_amount({
                project_id: projectId,
            });

        return res;
    }

    static async fetchAndCacheProjects(clear?: boolean): Promise<void> {
        const fetchPosts = BlockChainConnector.instance.contract.get_projects;
        const table = db.projects;

        if (clear) table.clear();

        const firstRecord = await table.orderBy('id').reverse().first();

        const LIMIT = 500;
        let currentIndex = 0;
        let isCompleted = false;

        while (!isCompleted) {
            try {
                const res = await fetchPosts({
                    from_index: currentIndex,
                    limit: LIMIT,
                });

                console.log('CACHE PROJECTS', res);

                if (res.length === 0) {
                    isCompleted = true;
                    break;
                }

                const data: any = res.map((raw: any) =>
                    ProjectService.mapToProject({
                        id: raw[0],
                        ...raw[1],
                    })
                );

                if (firstRecord) {
                    const firstRecordIndex = data.findIndex(
                        (item: any) => item.id === firstRecord.id
                    );

                    if (firstRecordIndex !== -1) {
                        await table.bulkAdd(data.slice(0, firstRecordIndex));
                        isCompleted = true;
                        break;
                    }
                }

                await table.bulkAdd(data);

                currentIndex += LIMIT;
            } catch (err) {
                console.error('Fetch and cache projects', err);
                isCompleted = true;
            }
        }
    }
}
