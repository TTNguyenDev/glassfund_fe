import React, { useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    FormControl,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalOverlay,
    Text,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { BlockChainConnector } from '../../utils/blockchain';
import { ModalsController } from '../../utils/modalsController';
import { ProjectService } from '../../services/projectService';

export type ForceStopProjectFormInput = {
    projectId: string;
};

export type ForceStopProjectModalDataType = {
    projectId: string;
};

export const ForceStopProjectModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [data, setData] = React.useState<ForceStopProjectModalDataType>(
        {} as any
    );

    const toast = useToast();
    const queryClient = useQueryClient();
    const forceStopProjectForm = useForm<ForceStopProjectFormInput>();

    const setDataForceStopProjectModal = React.useCallback(
        (payload: ForceStopProjectModalDataType) => {
            setData(payload);
        },
        [data]
    );

    const handleOpen = React.useCallback(() => {
        if (!BlockChainConnector.instance.account.accountId) {
            ModalsController.controller.openConnectWalletModal();
            return;
        }
        onOpen();
    }, []);

    const handleClose = React.useCallback(() => {
        setData({} as any);
        onClose();
    }, []);

    React.useEffect(() => {
        ModalsController.setController({
            openForceStopProjectModal: handleOpen,
            closeForceStopProjectModal: handleClose,
            setDataForceStopProjectModal,
        });

        return () => {
            forceStopProjectForm.reset();
        };
    }, []);

    const forceStopProjectMutation = useMutation(
        ({ projectId }: { projectId: string }) =>
            ProjectService.forceStop(projectId),
        {
            onSuccess: () => {},
        }
    );

    const handleBtnSentClick = useMemo(() => {
        return forceStopProjectForm.handleSubmit(
            async (payload) => {
                try {
                    await forceStopProjectMutation.mutateAsync(payload);
                    queryClient.invalidateQueries([
                        'project_force_stop_accounts',
                        payload.projectId,
                    ]);
                    toast({
                        title: 'Force stop project successfully',
                        position: 'top',
                        status: 'success',
                        isClosable: true,
                        duration: 3000,
                    });
                    handleClose();
                } catch (error) {
                    toast({
                        title:
                            error.kind.ExecutionError ??
                            'An error occurred, please try again!',
                        position: 'top',
                        status: 'error',
                        isClosable: true,
                        duration: 3000,
                    });
                }
            },
            (error) => {
                toast({
                    title: 'Please fill in all the information',
                    position: 'top',
                    status: 'error',
                    isClosable: true,
                    duration: 3000,
                });
            }
        );
    }, [data]);

    useEffect(() => {
        if (data) {
            forceStopProjectForm.setValue('projectId', data.projectId);
        } else {
            forceStopProjectForm.setValue('projectId', '');
        }
    }, [data]);

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
            <ModalOverlay />
            <form onSubmit={handleBtnSentClick}>
                <ModalContent>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box mb="20px" mt="20px">
                            <Text
                                fontFamily="Exo"
                                fontSize="20px"
                                fontWeight="700"
                                mb="15px"
                            >
                                Force Stop Project
                            </Text>
                            <Box
                                h="2px"
                                width="100%"
                                bg="var(--primary-border-button-color)"
                            />
                        </Box>
                        <VStack align="stretch">
                            <FormControl>
                                <Input
                                    id="projectId"
                                    placeholder="Project ID"
                                    {...forceStopProjectForm.register(
                                        'projectId',
                                        {
                                            required: true,
                                        }
                                    )}
                                    readOnly={!!data?.projectId}
                                    autoFocus={!data?.projectId}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            w="150px"
                            type="submit"
                            isLoading={forceStopProjectMutation.isLoading}
                            onClick={handleBtnSentClick}
                        >
                            OK
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </form>
        </Modal>
    );
};
