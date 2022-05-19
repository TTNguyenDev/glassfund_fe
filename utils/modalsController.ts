import { SupportProjectModalDataType } from '../components/supportProjectModal';

export type ModalsControllerType = {
    openConnectWalletModal: () => void;
    openCreateTaskModal: () => void;
    closeCreateTaskModal: () => void;
    openDepositInfomationModal: () => void;
    closeDepositInfomationModal: () => void;
    setDataDepositInfomationModal: (payload: {
        amount: number;
        reason: string;
        action: any;
    }) => any;

    openCreateProjectModal: () => void;
    closeCreateProjectModal: () => void;
    openSupportProjectModal: () => void;
    closeSupportProjectModal: () => void;
    setDataSupportProjectModal: (payload: SupportProjectModalDataType) => void;
};

export class ModalsController {
    private static _controller: ModalsControllerType = {} as any;

    static get controller() {
        return this._controller;
    }

    static setController(
        controller: Partial<Record<keyof ModalsControllerType, any>>
    ) {
        this._controller = { ...this._controller, ...controller };
    }
}
