import React from 'react';
import Header from 'next/head';
import { Layout } from '../../components/layout';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import moment from 'moment';
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Flex,
    HStack,
    Image,
    Progress,
    Text,
} from '@chakra-ui/react';
import {
    Project,
    ProjectDescription,
    ProjectService,
} from '../../services/projectService';
import { BsClock } from 'react-icons/bs';
import { MdOutlineDoubleArrow } from 'react-icons/md';
import Avatar from 'react-avatar';
import { Nullable } from '../../common';
import { IPFSUtils } from '../../utils/ipfsUtils';
import { db } from '../../db';
import { ModalsController } from '../../utils/modalsController';
import { BlockChainConnector } from '../../utils/blockchain';

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

    const description: Nullable<ProjectDescription> = React.useMemo(
        () =>
            projectDescriptionQuery.data
                ? JSON.parse(projectDescriptionQuery.data)
                : null,
        [projectDescriptionQuery.data]
    );

    if (!data) return null;

    return (
        <>
            <Header>
                <title>{data ? data.title : projectId}</title>
            </Header>
            <Layout>
                <Box
                    maxW="var(--max-width)"
                    margin="auto"
                    padding="0 94px 60px"
                >
                    <Box>
                        <Image
                            src={
                                description?.thumbnail ??
                                'https://previews.123rf.com/images/bridddy/bridddy1912/bridddy191200005/138386777-horizontal-vector-frosted-glass-blue-and-white-background-frozen-window-illustration-abstract-3d-bg-.jpg'
                            }
                            objectFit="cover"
                            w="100%"
                            h="134px"
                            marginTop="24px"
                            borderRadius="8px"
                        />
                    </Box>
                    {data.forceStopTs && (
                        <Box p="15px">
                            <Alert status="error" fontWeight="600">
                                <AlertIcon />
                                This project forced stop by the community!
                            </Alert>
                        </Box>
                    )}
                    <Box p="15px">
                        <HStack justifyContent="space-between">
                            <Text
                                fontSize="28px"
                                fontWeight="700"
                                textColor="white"
                                mb="15px"
                            >
                                {data.title}
                            </Text>
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
                            <HStack>
                                <Avatar
                                    name={data.accountId}
                                    round
                                    size="30"
                                    textSizeRatio={1.75}
                                />
                                <Text fontSize="16px" textColor="#6ba5c1">
                                    {data.accountId}
                                </Text>
                            </HStack>
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
                                    ).format('DD/MM/YYYY hh:mm')}`}</Text>
                                </HStack>
                                <MdOutlineDoubleArrow color="#fff" size="20" />
                                <Text textColor="#d385ee">{`${moment(
                                    data.endedAt
                                ).format('DD/MM/YYYY hh:mm')}`}</Text>
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
                        <Box
                            fontSize="16px"
                            textColor="var(--text-color)"
                            w="100%"
                            dangerouslySetInnerHTML={{
                                __html: description?.body ?? '',
                            }}
                        ></Box>
                    </Box>
                </Box>
            </Layout>
        </>
    );
}
