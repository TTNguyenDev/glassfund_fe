import { useMemo, useState } from 'react';
import { CreateProjectInput, ProjectService } from '../services/projectService';
import { toast } from 'react-toastify';
import { useQueryClient } from 'react-query';
import { useForm, UseFormReturn } from 'react-hook-form';
import { IPFSUtils } from '../utils/ipfsUtils';
import { BlockChainConnector } from '../utils/blockchain';

export type UseCreateProjectOutput = {
    createProjectLoading: boolean;
    handleFormSubmit: () => void;
    createProjectForm: UseFormReturn<CreateProjectInput>;
};

export const useCreateProject = (): UseCreateProjectOutput => {
    const queryClient = useQueryClient();
    const createProjectForm = useForm<CreateProjectInput>();

    const [createProjectLoading, setCreateProjectLoading] = useState(false);

    const handleFormSubmit = useMemo(
        () =>
            createProjectForm.handleSubmit(async (data: any) => {
                setCreateProjectLoading(true);
                const ipfsData = await IPFSUtils.client.add(
                    JSON.stringify({
                        thumbnail: data.thumbnail,
                        body: data.body,
                    })
                );
                data.description = ipfsData.path;

                try {
                    window.history.replaceState(
                        'create_project_redirect',
                        'project',
                        `/account/${BlockChainConnector.instance.account.accountId}`
                    );
                    await ProjectService.createProject(data);
                    queryClient.invalidateQueries('projects');
                    toast('Create project successfully', {
                        type: 'success',
                    });
                } catch (error) {
                    console.error(error);
                    toast('Create project failed', {
                        type: 'error',
                    });
                } finally {
                    setCreateProjectLoading(false);
                }
            }),
        []
    );

    return {
        createProjectLoading,
        handleFormSubmit,
        createProjectForm,
    };
};
