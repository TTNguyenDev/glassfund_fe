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

export type ClaimRewardProjectFormInput = {
    projectId: string;
};

export type ClaimRewardProjectModalDataType = {
    projectId: string;
};

export const ClaimRewardProjectModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [data, setData] = React.useState<ClaimRewardProjectModalDataType>(
        {} as any
    );

    const toast = useToast();
    const queryClient = useQueryClient();
    const claimRewardProjectForm = useForm<ClaimRewardProjectFormInput>();

    const setDataClaimRewardProjectModal = React.useCallback(
        (payload: ClaimRewardProjectModalDataType) => {
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
            openClaimRewardProjectModal: handleOpen,
            closeClaimRewardProjectModal: handleClose,
            setDataClaimRewardProjectModal,
        });

        return () => {
            claimRewardProjectForm.reset();
        };
    }, []);

    const claimRewardProjectMutation = useMutation(
        ({ projectId }: { projectId: string }) =>
            ProjectService.claimReward(projectId),
        {
            onSuccess: () => {},
        }
    );

    const handleBtnSentClick = useMemo(() => {
        return claimRewardProjectForm.handleSubmit(
            async (payload) => {
                try {
                    await claimRewardProjectMutation.mutateAsync(payload);
                    queryClient.invalidateQueries([
                        'project_claimable_amount',
                        payload.projectId,
                    ]);
                    queryClient.invalidateQueries([
                        'project_info',
                        payload.projectId,
                    ]);
                    toast({
                        title: 'Claim reward project successfully',
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
            claimRewardProjectForm.setValue('projectId', data.projectId);
        } else {
            claimRewardProjectForm.setValue('projectId', '');
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
                                Claim Reward Project
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
                                    {...claimRewardProjectForm.register(
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
                            isLoading={claimRewardProjectMutation.isLoading}
                            onClick={handleBtnSentClick}
                            colorScheme="purple"
                        >
                            Claim reward
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </form>
        </Modal>
    );
};
