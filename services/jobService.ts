import { Task, TaskStatus } from '../models/types/jobType';
import { BlockChainConnector } from '../utils/blockchain';
import { utils } from 'near-api-js';
import { db } from '../db';
import { PRICE_DECIMAL_LENGTH } from '../constants';
import { batchTransactions } from '../utils/serviceUtils';

export const FETCH_TASKS_LIMIT = 20;

export type CreateTaskInput = {
    title: string;
    description: string;
    price: string;
    maxParticipants: string;
    duration: number;
    categoryId: string;
    newCategory?: string;
};

export enum TaskSortTypes {
    NEWEST = 'newest',
    OLDEST = 'oldest',
    HIGH_PRICE = 'high_price',
    LOW_PRICE = 'low_price',
}

export type FetchType = 'available' | 'account' | 'account_completed';

export class TaskService {
    static async createTask(
        payload: CreateTaskInput,
        newCategory?: {
            name: string;
        }
    ): Promise<void> {
        const transactions: any[] = [];

        if (newCategory)
            transactions.push({
                methodName: 'new_category',
                body: {
                    topic_name: newCategory.name,
                },
            });

        const maxParticipants = Number.parseInt(payload.maxParticipants);
        const createTaskTrans = {
            methodName: 'new_task',
            body: {
                title: payload.title,
                description: payload.description,
                price: utils.format.parseNearAmount(payload.price),
                max_participants: maxParticipants,
                duration: (payload.duration * 1000000).toString(),
                category_id: payload.categoryId.toLowerCase(),
            },
            gas: '30000000000000',
            deposit: utils.format.parseNearAmount(
                (Number.parseFloat(payload.price) * maxParticipants)
                    .toFixed(PRICE_DECIMAL_LENGTH)
                    .toString()
            ),
        };
        transactions.push(createTaskTrans);
        await batchTransactions(transactions);
        return;
    }

    static async submitWork(payload: {
        taskId: string;
        proof: string;
    }): Promise<void> {
        await BlockChainConnector.instance.contract.submit_work(
            {
                task_id: payload.taskId,
                proof: payload.proof,
            },
            '30000000000000',
            utils.format.parseNearAmount('0.01')
        );
    }

    static async approveWork(payload: {
        taskId: string;
        workerId: string;
    }): Promise<void> {
        await BlockChainConnector.instance.contract.approve_work({
            task_id: payload.taskId,
            worker_id: payload.workerId,
        });
    }

    static async rejectWork(payload: {
        taskId: string;
        workerId: string;
    }): Promise<void> {
        await BlockChainConnector.instance.contract.reject_work({
            task_id: payload.taskId,
            worker_id: payload.workerId,
        });
    }

    static async markATaskAsCompleted(payload: {
        taskId: string;
    }): Promise<void> {
        await BlockChainConnector.instance.contract.mark_task_as_completed({
            task_id: payload.taskId,
        });
    }

    static async fetchAvailableJobs(): Promise<Task[]> {
        const res = await BlockChainConnector.instance.contract.available_tasks(
            {
                from_index: 0,
                limit: 12,
            }
        );

        return res.map((raw: any) =>
            TaskService.mapToModel({
                task_id: raw[0],
                ...raw[1],
            })
        );
    }

    static async fetchJobsInfinity({
        offset = 0,
        fromBlockId,
        filter,
    }: {
        offset?: number;
        filter?: {
            status?: TaskStatus;
            sort?: string;
            categories?: string[];
            title?: string;
            owner?: string;
            type?: FetchType;
            minAvailableUntil?: number;
            maxAvailableUntil?: number;
            minCreatedAt?: number;
            maxCreatedAt?: number;
        };
        fromBlockId?: number;
    }): Promise<Task[]> {
        return undefined as any;
    }

    static async fetchJobByAccountId(accountId?: string): Promise<Task[]> {
        const res = await BlockChainConnector.instance.contract.current_tasks({
            account_id:
                accountId ?? BlockChainConnector.instance.account.accountId,
            from_index: 0,
            limit: 50,
        });

        return res.map((raw: any) =>
            TaskService.mapToModel({
                task_id: raw[0],
                ...raw[1],
            })
        );
    }

    static async fetchJobCompletedByAccountId(
        accountId?: string
    ): Promise<Task[]> {
        const res = await BlockChainConnector.instance.contract.completed_tasks(
            {
                account_id:
                    accountId ?? BlockChainConnector.instance.account.accountId,
                from_index: 0,
                limit: 50,
            }
        );

        return res.map((raw: any) =>
            TaskService.mapToModel({
                task_id: raw[0],
                ...raw[1],
            })
        );
    }

    static async fetchTaskById(taskId?: string): Promise<Task> {
        const res = await BlockChainConnector.instance.contract.task_by_id({
            task_id: taskId,
        });

        return this.mapToModel({ ...res, task_id: taskId });
    }

    private static mapToModel(raw: any): Task {
        const arr = raw.task_id.split('_');
        const id = Number.parseInt(arr[arr.length - 1]);

        return {
            id,
            taskId: raw.task_id,
            owner: raw.owner,
            title: raw.title,
            description: raw.description,
            maxParticipants: raw.max_participants,
            price: Number(utils.format.formatNearAmount(raw.price)),
            proposals: raw.proposals?.map((p: any) => ({
                accountId: p.account_id,
                proofOfWork: p.proof_of_work,
                isApproved: p.is_approved,
                isRejected: p.is_reject,
            })),
            availableUntil: Number.parseInt(raw.available_until.substr(0, 13)),
            categoryId: raw.category_id,
            createdAt: Number.parseInt(raw.created_at.substr(0, 13)),
        };
    }

    static async fetchAndCacheTasks(
        type?: FetchType,
        clear?: boolean
    ): Promise<void> {
        return undefined as any;
    }

    static async checkTaskCompleted(taskId: string): Promise<boolean> {
        return undefined as any;
    }

    static async maxParticipantsPerTask(): Promise<number> {
        return BlockChainConnector.instance.contract.maximum_participants_per_task();
    }
}
