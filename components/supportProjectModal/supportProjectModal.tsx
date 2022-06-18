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
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Text,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';

import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { BlockChainConnector } from '../../utils/blockchain';
import { ModalsController } from '../../utils/modalsController';
import { ProjectService } from '../../services/projectService';

export type SupportProjectFormInput = {
    projectId: string;
    amount: number;
};

export type SupportProjectModalDataType = {
    projectId: string;
    projectName: string;
    amount: number;
    projectMinimumDeposit: number;
};

export const SupportProjectModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [data, setData] = React.useState<SupportProjectModalDataType>(
        {} as any
    );

    const toast = useToast();

    const supportProjectForm = useForm<SupportProjectFormInput>();

    const setDataSupportProjectModal = React.useCallback(
        (payload: SupportProjectModalDataType) => {
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
            openSupportProjectModal: handleOpen,
            closeSupportProjectModal: handleClose,
            setDataSupportProjectModal,
        });

        return () => {
            supportProjectForm.reset();
        };
    }, []);

    const supportProjectMutation = useMutation(
        ({ projectId, amount }: { projectId: string; amount: number }) =>
            ProjectService.supportProject(projectId, amount)
    );

    const handleBtnSentClick = useMemo(() => {
        return supportProjectForm.handleSubmit(
            async (payload) => {
                try {
                    if (payload.amount < data.projectMinimumDeposit)
                        payload.amount = data.projectMinimumDeposit;
                    await supportProjectMutation.mutateAsync(payload);
                    toast({
                        title: 'Support project successfully',
                        position: 'top',
                        status: 'success',
                        isClosable: true,
                        duration: 3000,
                    });
                } catch (error) {
                    toast({
                        title: 'An error occurred, please try again!',
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
            supportProjectForm.setValue('projectId', data.projectId);
            supportProjectForm.setValue('amount', data.amount);
        } else {
            supportProjectForm.setValue('projectId', '');
            supportProjectForm.setValue('amount', 0);
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
                            <Text fontSize="20px" fontWeight="700" mb="15px">
                                Support Project
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
                                    {...supportProjectForm.register(
                                        'projectId',
                                        {
                                            required: true,
                                        }
                                    )}
                                    readOnly={!!data?.projectId}
                                />
                            </FormControl>
                            <FormControl>
                                <Input
                                    id="name"
                                    placeholder="Name"
                                    readOnly={!!data?.projectId}
                                    value={data?.projectName}
                                />
                            </FormControl>
                            <FormControl>
                                <Input
                                    id="projectId"
                                    placeholder="Project ID"
                                    {...supportProjectForm.register('amount', {
                                        required: true,
                                    })}
                                    readOnly={!!data?.projectId}
                                    autoFocus={!data?.projectId}
                                    fontWeight="700"
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            w="150px"
                            type="submit"
                            colorScheme="purple"
                            isLoading={supportProjectMutation.isLoading}
                            onClick={handleBtnSentClick}
                        >
                            Support
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </form>
        </Modal>
    );
};
