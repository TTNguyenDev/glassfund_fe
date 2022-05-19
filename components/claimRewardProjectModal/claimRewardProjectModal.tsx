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
            ProjectService.claimReward(projectId)
    );

    const handleBtnSentClick = useMemo(() => {
        return claimRewardProjectForm.handleSubmit(
            async (payload) => {
                try {
                    await claimRewardProjectMutation.mutateAsync(payload);
                    toast({
                        title: 'Claim reward project successfully',
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
                            <Text
                                fontFamily="Exo"
                                fontSize="20px"
                                fontWeight="700"
                                mb="15px"
                            >
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
                        >
                            Claim reward
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </form>
        </Modal>
    );
};
