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

export type DrawdownProjectFormInput = {
    projectId: string;
};

export type DrawdownProjectModalDataType = {
    projectId: string;
};

export const DrawdownProjectModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [data, setData] = React.useState<DrawdownProjectModalDataType>(
        {} as any
    );

    const toast = useToast();
    const queryClient = useQueryClient();
    const drawdownProjectForm = useForm<DrawdownProjectFormInput>();

    const setDataDrawdownProjectModal = React.useCallback(
        (payload: DrawdownProjectModalDataType) => {
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
            openDrawdownProjectModal: handleOpen,
            closeDrawdownProjectModal: handleClose,
            setDataDrawdownProjectModal,
        });

        return () => {
            drawdownProjectForm.reset();
        };
    }, []);

    const drawdownProjectMutation = useMutation(
        ({ projectId }: { projectId: string }) =>
            ProjectService.drawdown(projectId),
        {
            onSuccess: () => {},
        }
    );

    const handleBtnSentClick = useMemo(() => {
        return drawdownProjectForm.handleSubmit(
            async (payload) => {
                try {
                    await drawdownProjectMutation.mutateAsync(payload);
                    queryClient.invalidateQueries([
                        'project_info',
                        payload.projectId,
                    ]);
                    toast({
                        title: 'Drawdown project successfully',
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
            drawdownProjectForm.setValue('projectId', data.projectId);
        } else {
            drawdownProjectForm.setValue('projectId', '');
        }
    }, [data]);

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
            <ModalOverlay />
            <form onSubmit={handleBtnSentClick}>
                <ModalContent bg="#323437">
                    <ModalCloseButton />
                    <ModalBody>
                        <Box mb="20px" mt="20px">
                            <Text fontSize="20px" fontWeight="700" mb="15px">
                                Drawdown Project
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
                                    {...drawdownProjectForm.register(
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
                            variant="primary"
                            w="150px"
                            type="submit"
                            isLoading={drawdownProjectMutation.isLoading}
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
