import React from 'react';
import Header from 'next/head';
import { Layout } from '../../components/layout';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import {
    Box,
    Flex,
    HStack,
    VStack,
    Image,
    Text,
    Input,
    IconButton,
    Avatar,
    NumberInput,
    NumberInputField,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInputStepper,
    Alert,
    AlertIcon,
    Button,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import {
    Project,
    ProjectDescription,
    ProjectService,
} from '../../services/projectService';
import { Nullable } from '../../common';
import { IPFSUtils } from '../../utils/ipfsUtils';
import { db } from '../../db';
import { BlockChainConnector } from '../../utils/blockchain';
import { ModalsController } from '../../utils/modalsController';
import { CardTag } from '../../components/cardTag';

export default function ProjectDetailsPage() {
    const router = useRouter();
    const projectId = router.query.projectId as string;

    const { data, isLoading } = useQuery(
        projectId,
        () => db.projects.where({ projectId }).first(),
        {
            enabled: !!projectId,
        }
    );

    const projectInfoQuery = useQuery<Project>(
        ['project_info', projectId],
        () => ProjectService.getProject(projectId),
        {
            enabled: !!projectId,
        }
    );
    console.log('INFO', projectInfoQuery.data);

    const projectClaimableAmountQuery = useQuery<number>(
        ['project_claimable_amount', projectId],
        () => ProjectService.getClaimableAmount(projectId),
        {
            enabled: !!projectId,
        }
    );
    console.log('CLAIMABLE AMOUNT: ', projectClaimableAmountQuery.data);

    const projectSupportersQuery = useQuery<any>(
        ['project_supporters', projectId],
        () => ProjectService.getSupporters(projectId),
        {
            enabled: !!projectId,
        }
    );
    console.log('SUPPORTERS', projectSupportersQuery.data);
    const projectForceStopAccountsQuery = useQuery<any>(
        ['project_force_stop_accounts', projectId],
        () => ProjectService.getForceStopAccounts(projectId),
        {
            enabled: !!projectId,
        }
    );
    console.log('FORCE STOP ACCOUNT', projectForceStopAccountsQuery.data);
    const projectDescriptionQuery = useQuery<string>(
        ['project_description', projectId],
        () => IPFSUtils.getDataByCID(data!.description) as any,
        {
            enabled: !!data,
        }
    );

    const totalSupporters = React.useMemo(
        () => projectSupportersQuery.data?.length ?? 0,
        [projectSupportersQuery.data]
    );

    const totalForceStop = React.useMemo(
        () => projectInfoQuery.data?.forceStop?.length ?? 0,
        [projectInfoQuery.data?.forceStop]
    );

    const description: Nullable<ProjectDescription> = React.useMemo(
        () =>
            projectDescriptionQuery.data
                ? JSON.parse(projectDescriptionQuery.data)
                : null,
        [projectDescriptionQuery.data]
    );

    const amountRef = React.useRef<any>();

    if (!data) return null;

    return (
        <>
            <Header>
                <title>{data ? data.title : projectId}</title>
            </Header>
            <Layout>
                <Flex w="100%" justify="space-around" mb="40px">
                    <Box maxW="1200px" w="100%">
                        {projectInfoQuery.data && (
                            <Box mt="50px" position="absolute">
                                <CardTag project={projectInfoQuery.data} />
                            </Box>
                        )}
                        <Image
                            src={
                                description?.thumbnail ??
                                'https://previews.123rf.com/images/bridddy/bridddy1912/bridddy191200005/138386777-horizontal-vector-frosted-glass-blue-and-white-background-frozen-window-illustration-abstract-3d-bg-.jpg'
                            }
                            objectFit="cover"
                            maxW="1200px"
                            w="100%"
                            h="240px"
                            marginTop="24px"
                            borderRadius="8px"
                            boxShadow="var(--primary-box-shadow-color)"
                        />
                        <HStack
                            spacing="20px"
                            padding="0 50px"
                            marginTop="-80px"
                            align="end"
                            mb="68px"
                        >
                            <Image
                                borderRadius="full"
                                boxSize="160px"
                                src="/default_avatar.jpg"
                                objectFit="cover"
                                border="6px solid var(--background-color)"
                            />
                            <HStack
                                spacing="30px"
                                justifyContent="space-between"
                                h="80px"
                                flex="1"
                            >
                                <VStack
                                    alignItems="start"
                                    spacing="0"
                                    justify="center"
                                >
                                    <Text
                                        fontSize="28px"
                                        fontWeight="600"
                                        textColor="white"
                                    >
                                        {data.title}
                                    </Text>
                                    <Text
                                        fontSize="20px"
                                        fontWeight="500"
                                        textColor="var(--text-color)"
                                    >
                                        {data.accountId}
                                    </Text>
                                </VStack>
                                {data.accountId !==
                                    BlockChainConnector.instance.account
                                        .accountId &&
                                    Date.now() >= data.startedAt &&
                                    Date.now() <= data.endedAt && (
                                        <HStack
                                            spacing="12px"
                                            padding="10px 15px"
                                            background="var(--sub-alt-color)"
                                            boxShadow="var(--primary-box-shadow-color)"
                                            borderRadius="10px"
                                            maxW="250px"
                                            h="fit-content"
                                        >
                                            <Image
                                                borderRadius="full"
                                                boxSize="30px"
                                                src="/NearIcon.svg"
                                            />
                                            {projectInfoQuery.data && (
                                                <NumberInput
                                                    min={Number(
                                                        projectInfoQuery.data
                                                            .minimumDeposit
                                                    )}
                                                    defaultValue={Number(
                                                        projectInfoQuery.data
                                                            .minimumDeposit
                                                    )}
                                                    precision={2}
                                                    w="100%"
                                                    color="textPrimary"
                                                >
                                                    <NumberInputField
                                                        placeholder="Support"
                                                        ref={amountRef}
                                                    />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                            )}
                                            {data.accountId !==
                                                BlockChainConnector.instance
                                                    .account.accountId &&
                                                Date.now() >=
                                                    data.vestingStartTime &&
                                                Date.now() <=
                                                    data.vestingEndTime &&
                                                projectSupportersQuery.data &&
                                                projectForceStopAccountsQuery.data &&
                                                !!projectSupportersQuery.data.find(
                                                    (i: any) =>
                                                        i[0] ===
                                                        BlockChainConnector
                                                            .instance.account
                                                            .accountId
                                                ) &&
                                                !projectForceStopAccountsQuery.data.includes(
                                                    BlockChainConnector.instance
                                                        .account.accountId
                                                ) && (
                                                    <Button
                                                        onClick={() => {
                                                            ModalsController.controller.setDataForceStopProjectModal(
                                                                {
                                                                    projectId,
                                                                }
                                                            );
                                                            ModalsController.controller.openForceStopProjectModal();
                                                        }}
                                                        colorScheme="red"
                                                    >
                                                        Force Stop
                                                    </Button>
                                                )}
                                            {data.accountId ===
                                                BlockChainConnector.instance
                                                    .account.accountId &&
                                                projectClaimableAmountQuery.data !==
                                                    undefined &&
                                                Date.now() >=
                                                    data.vestingStartTime && (
                                                    <HStack>
                                                        <Text
                                                            textColor="white"
                                                            fontSize="18px"
                                                        >
                                                            {`Claimable Amount: ${projectClaimableAmountQuery.data} Ⓝ`}
                                                        </Text>
                                                        {!!Number(
                                                            projectClaimableAmountQuery.data
                                                        ) && (
                                                            <Button
                                                                onClick={() => {
                                                                    ModalsController.controller.setDataClaimRewardProjectModal(
                                                                        {
                                                                            projectId,
                                                                        }
                                                                    );
                                                                    ModalsController.controller.openClaimRewardProjectModal();
                                                                }}
                                                            >
                                                                Claim
                                                            </Button>
                                                        )}
                                                    </HStack>
                                                )}

                                            <IconButton
                                                aria-label="Add to friends"
                                                w="40px"
                                                h="40px"
                                                icon={<AddIcon />}
                                                onClick={() => {
                                                    ModalsController.controller.setDataSupportProjectModal(
                                                        {
                                                            projectId,
                                                            projectName:
                                                                data.title,
                                                            amount: amountRef
                                                                .current.value,
                                                            projectMinimumDeposit:
                                                                Number.parseInt(
                                                                    data.minimumDeposit
                                                                ),
                                                        }
                                                    );
                                                    ModalsController.controller.openSupportProjectModal();
                                                }}
                                            />
                                        </HStack>
                                    )}
                            </HStack>
                        </HStack>
                        {projectInfoQuery.data?.forceStopTs && (
                            <Box p="15px">
                                <Alert status="error" fontWeight="600">
                                    <AlertIcon />
                                    This project forced stop by the community!
                                </Alert>
                            </Box>
                        )}
                        <HStack
                            borderRadius="5px"
                            padding="10px 0"
                            background="var(--sub-alt-color)"
                            boxShadow="var(--primary-box-shadow-color)"
                            mb="20px"
                        >
                            <VStack alignItems="center" flex="1" spacing="10px">
                                <Text
                                    fontSize="14px"
                                    fontWeight="400"
                                    textColor="var(--text-color)"
                                >
                                    Funded
                                </Text>
                                <HStack
                                    justifyContent="space-between"
                                    alignItems="end"
                                    w="fit-content"
                                    h="fit-content"
                                    spacing="0"
                                >
                                    <Text
                                        fontSize="40px"
                                        lineHeight="40px"
                                        fontWeight="700"
                                        textColor="var(--main-color)"
                                        height="fit-content"
                                    >
                                        {projectInfoQuery.data?.funded}
                                    </Text>
                                    <Text
                                        fontSize="20px"
                                        fontWeight="400"
                                        textColor="var(--main-color)"
                                    >
                                        /{data.target}
                                    </Text>
                                </HStack>
                            </VStack>
                            <VStack alignItems="center" flex="1" spacing="10px">
                                <Text
                                    fontSize="14px"
                                    fontWeight="400"
                                    textColor="var(--text-color)"
                                >
                                    Force stop
                                </Text>
                                <HStack
                                    justifyContent="space-between"
                                    alignItems="end"
                                    w="fit-content"
                                    h="fit-content"
                                    spacing="0"
                                >
                                    <Text
                                        fontSize="40px"
                                        lineHeight="40px"
                                        fontWeight="700"
                                        textColor="var(--error-color)"
                                        height="fit-content"
                                    >
                                        {totalForceStop}
                                    </Text>
                                    <Text
                                        fontSize="20px"
                                        fontWeight="400"
                                        textColor="var(--error-color)"
                                    >
                                        /{totalSupporters}
                                    </Text>
                                </HStack>
                            </VStack>
                            <VStack alignItems="center" flex="1" spacing="10px">
                                <Text
                                    fontSize="14px"
                                    fontWeight="400"
                                    textColor="var(--text-color)"
                                >
                                    Supporters
                                </Text>
                                <HStack
                                    justifyContent="space-between"
                                    alignItems="end"
                                    w="fit-content"
                                    h="fit-content"
                                    spacing="0"
                                >
                                    <Text
                                        fontSize="40px"
                                        lineHeight="40px"
                                        fontWeight="700"
                                        textColor="var(--balloon-text-color)"
                                        height="fit-content"
                                    >
                                        {totalSupporters}
                                    </Text>
                                </HStack>
                            </VStack>
                            <VStack alignItems="center" flex="1" spacing="10px">
                                <Text
                                    fontSize="14px"
                                    fontWeight="400"
                                    textColor="var(--text-color)"
                                >
                                    Your support
                                </Text>
                                <HStack
                                    justifyContent="space-between"
                                    alignItems="end"
                                    w="fit-content"
                                    h="fit-content"
                                    spacing="5px"
                                >
                                    <Text
                                        fontSize="40px"
                                        lineHeight="40px"
                                        fontWeight="700"
                                        textColor="var(--balloon-text-color)"
                                        height="fit-content"
                                    >
                                        0
                                    </Text>
                                    <Text
                                        fontSize="18px"
                                        fontWeight="400"
                                        textColor="var(--balloon-text-color)"
                                    >
                                        NEAR
                                    </Text>
                                </HStack>
                            </VStack>
                        </HStack>
                        <HStack spacing="20px" align="start">
                            <VStack
                                maxW="800px"
                                minW="700px"
                                flex="1"
                                spacing="20px"
                            >
                                <HStack
                                    w="100%"
                                    borderRadius="5px"
                                    padding="12px 16px"
                                    background="var(--sub-alt-color)"
                                    boxShadow="var(--primary-box-shadow-color)"
                                >
                                    <VStack
                                        alignItems="start"
                                        flex="1"
                                        spacing="10px"
                                    >
                                        <Text
                                            fontSize="22px"
                                            fontWeight="500"
                                            textColor="var(--text-color)"
                                        >
                                            Progress
                                        </Text>
                                        <HStack
                                            justifyContent="space-between"
                                            alignItems="end"
                                            w="100%"
                                            h="fit-content"
                                            spacing="0"
                                        ></HStack>
                                    </VStack>
                                </HStack>
                                <HStack
                                    w="100%"
                                    borderRadius="5px"
                                    padding="12px 16px"
                                    background="var(--sub-alt-color)"
                                    boxShadow="var(--primary-box-shadow-color)"
                                >
                                    <VStack
                                        alignItems="start"
                                        flex="1"
                                        spacing="10px"
                                    >
                                        <Text
                                            fontSize="22px"
                                            fontWeight="500"
                                            textColor="var(--text-color)"
                                        >
                                            Description
                                        </Text>
                                        <Box
                                            fontSize="16px"
                                            textColor="var(--balloon-text-color)"
                                            w="100%"
                                            dangerouslySetInnerHTML={{
                                                __html: description?.body ?? '',
                                            }}
                                        />
                                    </VStack>
                                </HStack>
                            </VStack>
                            <VStack w="100%" spacing="20px">
                                <Box layerStyle="cardSecondary" w="100%">
                                    <Text
                                        color="textSecondary"
                                        fontSize="22px"
                                        fontWeight="500"
                                    >
                                        History
                                    </Text>
                                </Box>
                                {projectForceStopAccountsQuery.data?.map(
                                    (item: any, index: number) => (
                                        <Box
                                            key={index}
                                            layerStyle="cardSecondary"
                                            w="100%"
                                            p="8px 16px"
                                        >
                                            <HStack>
                                                <Avatar
                                                    name={item[0]}
                                                    borderWidth="1px"
                                                    borderColor="primary"
                                                />
                                                <Text
                                                    color="textPrimary"
                                                    fontSize="18px"
                                                    fontWeight="400"
                                                >
                                                    {item[0]}
                                                </Text>
                                            </HStack>
                                            <HStack
                                                spacing="5px"
                                                alignItems="end"
                                                justifyContent="center"
                                            >
                                                <Text
                                                    color="textRed"
                                                    fontSize="48px"
                                                    fontWeight="600"
                                                >
                                                    Force Stop
                                                </Text>
                                            </HStack>
                                        </Box>
                                    )
                                )}
                                {projectSupportersQuery.data?.map(
                                    (item: any, index: number) => (
                                        <Box
                                            key={index}
                                            layerStyle="cardSecondary"
                                            w="100%"
                                            p="8px 16px"
                                        >
                                            <HStack>
                                                <Avatar
                                                    name={item[0]}
                                                    borderWidth="1px"
                                                    borderColor="primary"
                                                />
                                                <Text
                                                    color="textPrimary"
                                                    fontSize="18px"
                                                    fontWeight="400"
                                                >
                                                    {item[0]}
                                                </Text>
                                            </HStack>
                                            <HStack
                                                spacing="5px"
                                                alignItems="end"
                                                justifyContent="center"
                                            >
                                                <Text
                                                    color="textGreen"
                                                    fontSize="24px"
                                                    fontWeight="600"
                                                >
                                                    Supported
                                                </Text>
                                                <Text
                                                    color="textGreen"
                                                    fontSize="48px"
                                                    fontWeight="600"
                                                    lineHeight="1.1"
                                                >
                                                    {item[1]}
                                                </Text>
                                                <Text
                                                    color="textGreen"
                                                    fontSize="24px"
                                                    fontWeight="600"
                                                >
                                                    NEAR
                                                </Text>
                                            </HStack>
                                        </Box>
                                    )
                                )}
                            </VStack>
                        </HStack>
                    </Box>
                </Flex>
                {/*
                <Box
                    maxW="var(--max-width)"
                    margin="auto"
                    padding="0 94px 60px"
                >
                    {projectInfoQuery.data?.forceStopTs && (
                        <Box p="15px">
                            <Alert status="error" fontWeight="600">
                                <AlertIcon />
                                This project forced stop by the community!
                            </Alert>
                        </Box>
                    )}
                    <Box p="15px">
                        <HStack justifyContent="space-between">
                            {data.accountId !==
                                BlockChainConnector.instance.account
                                    .accountId &&
                                Date.now() >= data.startedAt &&
                                Date.now() <= data.endedAt && (
                                    <Button
                                        onClick={() => {
                                            ModalsController.controller.setDataSupportProjectModal(
                                                {
                                                    projectId,
                                                    projectMinimumDeposit:
                                                        Number.parseInt(
                                                            data.minimumDeposit
                                                        ),
                                                }
                                            );
                                            ModalsController.controller.openSupportProjectModal();
                                        }}
                                    >
                                        Suppport
                                    </Button>
                                )}
                            {data.accountId !==
                                BlockChainConnector.instance.account
                                    .accountId &&
                                Date.now() >= data.vestingStartTime &&
                                Date.now() <= data.vestingEndTime &&
                                projectSupportersQuery.data &&
                                projectForceStopAccountsQuery.data &&
                                !!projectSupportersQuery.data.find(
                                    (i: any) =>
                                        i[0] ===
                                        BlockChainConnector.instance.account
                                            .accountId
                                ) &&
                                !projectForceStopAccountsQuery.data.includes(
                                    BlockChainConnector.instance.account
                                        .accountId
                                ) && (
                                    <Button
                                        onClick={() => {
                                            ModalsController.controller.setDataForceStopProjectModal(
                                                {
                                                    projectId,
                                                }
                                            );
                                            ModalsController.controller.openForceStopProjectModal();
                                        }}
                                        colorScheme="red"
                                    >
                                        Force Stop
                                    </Button>
                                )}
                            {data.accountId ===
                                BlockChainConnector.instance.account
                                    .accountId &&
                                projectClaimableAmountQuery.data !==
                                    undefined &&
                                Date.now() >= data.vestingStartTime && (
                                    <HStack>
                                        <Text textColor="white" fontSize="18px">
                                            {`Claimable Amount: ${projectClaimableAmountQuery.data} Ⓝ`}
                                        </Text>
                                        {!!Number(
                                            projectClaimableAmountQuery.data
                                        ) && (
                                            <Button
                                                onClick={() => {
                                                    ModalsController.controller.setDataClaimRewardProjectModal(
                                                        {
                                                            projectId,
                                                        }
                                                    );
                                                    ModalsController.controller.openClaimRewardProjectModal();
                                                }}
                                            >
                                                Claim
                                            </Button>
                                        )}
                                    </HStack>
                                )}
                        </HStack>
                        
                        <HStack
                            mb="15px"
                            spacing="30px"
                            justifyContent="space-between"
                        >
                            {!!projectInfoQuery.data && (
                                <Flex
                                    w="100%"
                                    maxW="600px"
                                    flexDir="column"
                                    alignItems="end"
                                >
                                    <Text
                                        textColor="white"
                                        fontSize="16px"
                                        fontWeight="400"
                                    >{`${projectInfoQuery.data.funded}/${data.target} Ⓝ`}</Text>
                                    <Progress
                                        value={Number(
                                            projectInfoQuery.data.funded
                                        )}
                                        max={Number(data.target)}
                                        size="sm"
                                        borderRadius="3xl"
                                        colorScheme="pink"
                                        w="100%"
                                        h="3px"
                                    />
                                </Flex>
                            )}
                        </HStack>
                        <Flex justifyContent="space-between" mb="10px">
                            <Flex
                                border={
                                    Date.now() >= data.startedAt &&
                                    Date.now() <= data.endedAt
                                        ? '1px solid var(--main-color)'
                                        : '0'
                                }
                                alignItems="center"
                                padding="7px 10px"
                                borderRadius="7px"
                            >
                                <Text
                                    fontSize="15px"
                                    fontWeight="700"
                                    lineHeight="15px"
                                    textColor={
                                        Date.now() >= data.startedAt &&
                                        Date.now() <= data.endedAt
                                            ? 'var(--main-color)'
                                            : 'var(--text-color)'
                                    }
                                >
                                    FUNDING
                                </Text>
                            </Flex>
                            <HStack mb="15px">
                                <HStack>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: '#d385ee',
                                        }}
                                    >
                                        <BsClock size={16} />
                                    </div>
                                    <Text textColor="#d385ee">{`${moment(
                                        data.startedAt
                                    ).format('DD/MM/YYYY HH:mm')}`}</Text>
                                </HStack>
                                <MdOutlineDoubleArrow color="#fff" size="20" />
                                <Text textColor="#d385ee">{`${moment(
                                    data.endedAt
                                ).format('DD/MM/YYYY HH:mm')}`}</Text>
                            </HStack>
                        </Flex>
                        <Flex justifyContent="space-between" mb="20px">
                            <Flex
                                border={
                                    Date.now() >= data.vestingStartTime &&
                                    Date.now() <= data.vestingEndTime
                                        ? '1px solid var(--main-color)'
                                        : '0px'
                                }
                                borderWidth="1px"
                                alignItems="center"
                                padding="7px 10px"
                                borderRadius="7px"
                            >
                                <Text
                                    fontSize="15px"
                                    fontWeight="700"
                                    lineHeight="15px"
                                    textColor={
                                        Date.now() >= data.vestingStartTime &&
                                        Date.now() <= data.vestingEndTime
                                            ? 'var(--main-color)'
                                            : 'var(--text-color)'
                                    }
                                >
                                    VESTING
                                </Text>
                            </Flex>
                            <HStack mb="15px">
                                <HStack>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: '#d385ee',
                                        }}
                                    >
                                        <BsClock size={16} />
                                    </div>
                                    <Text textColor="#d385ee">{`${moment(
                                        data.vestingStartTime
                                    ).format('DD/MM/YYYY HH:mm')}`}</Text>
                                </HStack>
                                <MdOutlineDoubleArrow color="#fff" size="20" />
                                <Text textColor="#d385ee">{`${moment(
                                    data.vestingEndTime
                                ).format('DD/MM/YYYY HH:mm')}`}</Text>
                            </HStack>
                        </Flex>
                        <HStack
                            fontSize="16px"
                            textColor="#d385ee"
                            justifyContent="flex-end"
                            fontWeight="600"
                            mb="15px"
                        >
                            <Text>Claimed: </Text>
                            <Text>{projectInfoQuery.data?.claimed} Ⓝ</Text>
                        </HStack>
                    </Box>
                </Box>
                */}
            </Layout>
        </>
    );
}
