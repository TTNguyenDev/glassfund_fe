import { BlockChainConnector } from '../utils/blockchain';
import { utils } from 'near-api-js';
import { db } from '../db';
import { batchTransactions } from '../utils/serviceUtils';

export const FETCH_PROJECTS_LIMIT = 12;
export const CREATE_PROJECT_FEE = '1';

export type CreateProjectInput = {
    title: string;
    target: string;
    thumbnail?: string;
    body: string;
    minimumDeposit: string;
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
    minimumDeposit: string;
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
    id: number;
    projectId: string;
    accountId: string;
    title: string;
    description: string;
    target: string;
    minimumDeposit: string;
    startedAt: number;
    endedAt: number;
    funded: string;
    vestingStartTime: number;
    vestingEndTime: number;
    vestingInterval: number;
    claimed: string;
    forceStop: string[];
    forceStopTs?: number;
    supported?: boolean;
};

export type ProjectDescription = {
    thumbnail?: string;
    body: string;
};

export class ProjectService {
    private static mapToProject(raw: any): Project {
        const index = raw.id?.lastIndexOf('_');
        let accountId = '';
        let id = '';

        if (index !== -1) {
            accountId = raw.id?.slice(0, index);
            id = raw.id?.slice(index + 1);
        }

        return {
            id: Number.parseInt(id),
            accountId,
            projectId: raw.id,
            title: raw.title,
            description: raw.description,
            target: utils.format
                .formatNearAmount(raw.target)
                .replaceAll(',', ''),
            minimumDeposit: utils.format
                .formatNearAmount(raw.minimum_deposit)
                .replaceAll(',', ''),
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
            forceStopTs: raw.force_stop_ts,
            supported: false,
        };
    }

    static async createProject(
        payload: CreateProjectFinalInput
    ): Promise<void> {
        const createProjectTrans = {
            methodName: 'new_project',
            body: {
                metadata: {
                    title: payload.title,
                    description: payload.description,
                    target: utils.format.parseNearAmount(payload.target),
                    minimum_deposit: utils.format.parseNearAmount(
                        payload.minimumDeposit
                    ),
                    started_at: payload.startedAt * 1000000,
                    ended_at: payload.endedAt * 1000000,
                    funded: '0',
                    vesting_start_time: payload.vestingStartTime * 1000000,
                    vesting_end_time: payload.vestingEndTime * 1000000,
                    vesting_interval: payload.vestingInterval * 60000000000,
                    claimed: '0',
                    force_stop: [],
                },
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

    static async drawdown(projectId: string): Promise<boolean> {
        return batchTransactions([
            {
                methodName: 'drawdown',
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
            accountId?: string;
            title?: string;
            supported?: boolean;
            status?: 'pending' | 'funding' | 'vesting' | 'done';
        };
    } = {}): Promise<Project[]> {
        const table = db.projects;

        let query = table
            .orderBy('id')
            .reverse()
            .offset(offset)
            .limit(limit)
            .toArray();

        if (filter) {
            const { accountId, title, supported, status } = filter;
            return table
                .orderBy('id')
                .reverse()
                .filter((item) => {
                    if (accountId !== undefined && item.accountId !== accountId)
                        return false;
                    if (
                        title !== undefined &&
                        !item.title
                            .toLocaleLowerCase()
                            .includes(title.toLocaleLowerCase())
                    )
                        return false;

                    if (supported !== undefined && item.supported !== supported)
                        return false;

                    if (status !== undefined) {
                        if (status === 'pending') {
                            if (!(item.startedAt > Date.now())) return false;
                        }
                        if (status === 'funding') {
                            if (
                                !(
                                    item.startedAt < Date.now() &&
                                    item.endedAt > Date.now()
                                )
                            )
                                return false;
                        }
                        if (status === 'vesting') {
                            if (
                                !(
                                    item.vestingStartTime < Date.now() &&
                                    item.vestingEndTime > Date.now()
                                )
                            )
                                return false;
                        }
                        if (status === 'done') {
                            if (!(item.vestingEndTime <= Date.now()))
                                return false;
                        }
                    }

                    return true;
                })
                .offset(offset)
                .limit(limit)
                .toArray();
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

        return Number(utils.format.formatNearAmount(res)).toFixed(2);
    }

    static async getSupporters(projectId: string): Promise<any> {
        const res = await BlockChainConnector.instance.contract.get_supporters({
            project_id: projectId,
        });
        return res;
    }

    static async getForceStopAccounts(projectId: string): Promise<any> {
        const res =
            await BlockChainConnector.instance.contract.get_force_stop_accounts(
                {
                    project_id: projectId,
                }
            );
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

    static async fetchSupportedProjects(): Promise<void> {
        const fetchMyProjects =
            BlockChainConnector.instance.contract.get_my_projects;
        const table = db.projects;

        const LIMIT = 500;
        let currentIndex = 0;
        let isCompleted = false;
        let supportedProjectIds: string[] = [];

        while (!isCompleted) {
            try {
                const res = await fetchMyProjects({
                    account_id: BlockChainConnector.instance.account.accountId,
                    from_index: currentIndex,
                    limit: LIMIT,
                });

                console.log('MY PROJECTS', res);

                if (res.length === 0) {
                    isCompleted = true;
                    break;
                }

                supportedProjectIds = [
                    ...supportedProjectIds,
                    ...res.map((item: any) => item[0]),
                ];

                currentIndex += LIMIT;
            } catch (err) {
                console.error('Fetch my projects', err);
                isCompleted = true;
            }
        }

        if (supportedProjectIds.length) {
            console.log(
                await table
                    .where('projectId')
                    .anyOf(supportedProjectIds)
                    .modify({
                        supported: true,
                    })
            );
        }
    }
}
