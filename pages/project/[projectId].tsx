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
    Progress,
} from '@chakra-ui/react';
import { AddIcon, CheckIcon, DownloadIcon } from '@chakra-ui/icons';
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
import ImageNext from 'next/image';
import ClaimIconSvg from '../../assets/claim-icon.svg';
import ClaimedIconSvg from '../../assets/claimed-icon.svg';
import { utils } from 'near-api-js';
import { IoMdLogIn } from 'react-icons/io';

export const CheckedIcon = () => (
    <Flex
        borderRadius="full"
        minW="30px"
        minH="30px"
        justifyContent="center"
        alignItems="center"
        bg="green"
        position="absolute"
        left="0"
        top="50%"
        transform="translate(-50%, -50%)"
    >
        <CheckIcon color="black" fontSize="20px" />
    </Flex>
);

export const ClaimIcon = ({
    position,
    done,
    stop,
    currentClaimed,
    numberOfClaims,
}: {
    position: number;
    done?: boolean;
    stop?: boolean;
    currentClaimed: number;
    numberOfClaims: number;
}) => (
    <Flex
        borderRadius="full"
        minW="30px"
        minH="30px"
        justifyContent="center"
        alignItems="center"
        bg={done ? 'green' : stop ? 'red' : 'white'}
        position="absolute"
        left={`${position}%`}
        top="50%"
        transform="translate(-50%, -50%)"
    >
        <Box
            position="absolute"
            top="-25px"
            color="textPrimary"
            fontWeight="600"
        >
            <Text>{`${currentClaimed}/${numberOfClaims}`}</Text>
        </Box>
        <ImageNext src={ClaimIconSvg} width="20px" />
    </Flex>
);

export const FundingIcon = ({
    position,
    stop,
}: {
    position: number;
    active?: boolean;
    stop?: boolean;
}) => (
    <Flex
        borderRadius="full"
        minW="30px"
        minH="30px"
        justifyContent="center"
        alignItems="center"
        bg={stop ? 'red' : 'green'}
        position="absolute"
        left={`${position}%`}
        top="50%"
        transform="translate(-50%, -50%)"
    >
        <ImageNext src={ClaimedIconSvg} width="20px" />
    </Flex>
);

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
    const yourSupport = React.useMemo(() => {
        const data = projectSupportersQuery.data?.find(
            (item: any) =>
                item[0] === BlockChainConnector.instance.account.accountId
        );

        if (data) return utils.format.formatNearAmount(data[1]);

        return 0;
    }, [projectSupportersQuery.data]);
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
    const canDrawdownQuery = useQuery<any>(
        ['can_drawdown', projectId],
        () => ProjectService.canDrawdown(projectId),
        {
            enabled: !!projectId,
        }
    );
    console.log('CAN DRAWDOWN', canDrawdownQuery.data);

    const totalSupporters = React.useMemo(
        () => projectSupportersQuery.data?.length ?? 0,
        [projectSupportersQuery.data]
    );

    const totalForceStop = React.useMemo(
        () => projectForceStopAccountsQuery.data?.length ?? 0,
        [projectForceStopAccountsQuery.data]
    );

    const description: Nullable<ProjectDescription> = React.useMemo(
        () =>
            projectDescriptionQuery.data
                ? JSON.parse(projectDescriptionQuery.data)
                : null,
        [projectDescriptionQuery.data]
    );

    const amountRef = React.useRef<any>();

    const progressData = React.useMemo(() => {
        const data = projectInfoQuery.data;

        if (!data) return null;

        const fullTime = data.vestingEndTime - data.startedAt;

        const fundingPercent = Math.floor(
            ((data.endedAt - data.startedAt) * 100) / fullTime
        );

        const vestingPercent = Math.floor(100 - fundingPercent);

        const currentPercent = Math.floor(
            (((Date.now() > data.vestingEndTime
                ? data.vestingEndTime
                : Date.now()) -
                data.startedAt) *
                100) /
                fullTime
        );

        const numberOfClaims = Math.floor(
            (data.vestingEndTime - data.vestingStartTime) / data.vestingInterval
        );

        const currentClaim = Math.floor(
            ((Date.now() > data.vestingEndTime
                ? data.vestingEndTime
                : Date.now()) -
                data.vestingStartTime) /
                data.vestingInterval
        );

        const currentClaimed = Number(data.funded)
            ? Math.floor(
                  (Number(data.claimed) * numberOfClaims) / Number(data.funded)
              )
            : 0;

        const stopAtFundingEnd =
            !Number(data.funded) && Date.now() >= data.endedAt;

        return {
            funded: Number(data.funded),
            fundingPercent,
            vestingPercent,
            currentPercent,
            numberOfClaims,
            currentClaim,
            currentClaimed,
            stopAtFundingEnd,
        };
    }, [projectInfoQuery.data]);

    console.log('PROGRESS DATA', progressData);

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
                                                        border="none"
                                                    />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper border="none" />
                                                        <NumberDecrementStepper border="none" />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                            )}
                                            <IconButton
                                                aria-label="Support"
                                                maxW="35px"
                                                maxH="35px"
                                                minW="35px"
                                                minH="35px"
                                                borderRadius="full"
                                                bg="transparent"
                                                transform="scale(-1)"
                                                icon={
                                                    <IoMdLogIn
                                                        size="28"
                                                        color="#fff"
                                                    />
                                                }
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
                                            size="lg"
                                        >
                                            Force Stop
                                        </Button>
                                    )}
                                {data.accountId !==
                                    BlockChainConnector.instance.account
                                        .accountId &&
                                    !!projectInfoQuery.data?.forceStopTs &&
                                    !!projectSupportersQuery.data &&
                                    !!projectSupportersQuery.data.find(
                                        (i: any) =>
                                            i[0] ===
                                            BlockChainConnector.instance.account
                                                .accountId
                                    ) &&
                                    canDrawdownQuery.data && (
                                        <Button
                                            onClick={() => {
                                                ModalsController.controller.setDataDrawdownProjectModal(
                                                    {
                                                        projectId,
                                                    }
                                                );
                                                ModalsController.controller.openDrawdownProjectModal();
                                            }}
                                            colorScheme="green"
                                            size="lg"
                                        >
                                            Drawdown
                                        </Button>
                                    )}
                                {data.accountId ===
                                    BlockChainConnector.instance.account
                                        .accountId &&
                                    projectClaimableAmountQuery.data !==
                                        undefined &&
                                    Date.now() >= data.vestingStartTime && (
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
                                            <Text
                                                color="textPrimary"
                                                fontSize="20px"
                                            >
                                                {
                                                    projectClaimableAmountQuery.data
                                                }
                                            </Text>
                                            <IconButton
                                                aria-label="Claim"
                                                w="40px"
                                                h="40px"
                                                icon={<DownloadIcon />}
                                                isDisabled={
                                                    !Number(
                                                        projectClaimableAmountQuery.data
                                                    )
                                                }
                                                onClick={() => {
                                                    ModalsController.controller.setDataClaimRewardProjectModal(
                                                        {
                                                            projectId,
                                                        }
                                                    );
                                                    ModalsController.controller.openClaimRewardProjectModal();
                                                }}
                                            />
                                        </HStack>
                                    )}
                            </HStack>
                        </HStack>
                        {projectInfoQuery.data?.forceStopTs && (
                            <Box mb="20px">
                                <Alert
                                    status="error"
                                    fontSize="20px"
                                    fontWeight="600"
                                    borderRadius="5px"
                                >
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
                                        {yourSupport}
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
                                align="stretch"
                            >
                                <Box layerStyle="cardSecondary" p="12px 16px">
                                    <Text
                                        fontSize="22px"
                                        fontWeight="500"
                                        textColor="textPrimary"
                                        mb="15px"
                                    >
                                        Progress
                                    </Text>
                                    <Box padding="20px">
                                        <Flex
                                            alignItems="center"
                                            position="relative"
                                            w="100%"
                                        >
                                            {progressData && (
                                                <>
                                                    <Progress
                                                        w="100%"
                                                        value={
                                                            progressData.currentPercent
                                                        }
                                                        size="xs"
                                                        colorScheme="green"
                                                        hasStripe
                                                    />
                                                    <CheckedIcon />
                                                    <FundingIcon
                                                        position={
                                                            progressData.fundingPercent
                                                        }
                                                        stop={
                                                            progressData.stopAtFundingEnd
                                                        }
                                                    />
                                                    {/*{Array.from(
                                                        Array(
                                                            progressData.currentClaimed
                                                        )
                                                    ).map((_, index) => (
                                                        <ClaimIcon
                                                            position={
                                                                progressData.fundingPercent +
                                                                ((index + 1) *
                                                                    100 *
                                                                    progressData.vestingPercent) /
                                                                    100 /
8pxprogressData.numberOfClaims
                                                            }
                                                            active
                                                        />
                                                    ))}*/}
                                                    {!!progressData.funded && (
                                                        <ClaimIcon
                                                            position={
                                                                progressData.fundingPercent +
                                                                ((progressData.currentClaimed +
                                                                    (progressData.currentClaimed ===
                                                                    progressData.numberOfClaims
                                                                        ? 0
                                                                        : 1)) *
                                                                    100 *
                                                                    progressData.vestingPercent) /
                                                                    100 /
                                                                    progressData.numberOfClaims
                                                            }
                                                            stop={
                                                                !!projectInfoQuery
                                                                    .data
                                                                    ?.forceStopTs
                                                            }
                                                            done={
                                                                progressData.currentClaimed ===
                                                                progressData.numberOfClaims
                                                            }
                                                            currentClaimed={
                                                                progressData.currentClaimed
                                                            }
                                                            numberOfClaims={
                                                                progressData.numberOfClaims
                                                            }
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </Flex>
                                    </Box>
                                </Box>
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
                                                    name={item}
                                                    borderWidth="1px"
                                                    borderColor="primary"
                                                />
                                                <Text
                                                    color="textPrimary"
                                                    fontSize="18px"
                                                    fontWeight="400"
                                                >
                                                    {item}
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
                                                spacing="8px"
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
                                                    lineHeight="1.05"
                                                >
                                                    {utils.format.formatNearAmount(
                                                        item[1]
                                                    )}
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
