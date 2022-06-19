import React from 'react';
import Header from 'next/head';
import { Layout } from '../../components/layout';
import { ListProjects } from '../../components/listProjects';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useInfiniteQuery, useQuery } from 'react-query';
import {
    VStack,
    Text,
    Button,
    SimpleGrid,
    Box,
    HStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { Optional } from '../../common';
import {
    ProjectService,
    FETCH_PROJECTS_LIMIT,
} from '../../services/projectService';
import { ProjectFilter } from '../../components/tasksFilter';
import { ModalsController } from '../../utils/modalsController';
import { useProjectFilter } from '../../hooks/useProjectFilter';

export default function AccountPage() {
    const app = useSelector((state: RootState) => state.app);
    const router = useRouter();
    const accountId = router.query?.accountId as Optional<string>;

    const { filter, setProjectFilter, applyProjectFilter } = useProjectFilter();

    React.useEffect(() => {
        if (accountId) {
            setProjectFilter({
                accountId,
            });
            applyProjectFilter();
        }
    }, [accountId]);

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery(
        ['acount_projects', filter],
        ({ pageParam: { offset } = {} }) =>
            ProjectService.getListProjects({
                offset,
                filter,
            }),
        {
            getNextPageParam: (lastPage, pages) => {
                if (lastPage.length < FETCH_PROJECTS_LIMIT) return undefined;
                return {
                    offset: FETCH_PROJECTS_LIMIT * pages.length,
                };
            },
            enabled: app.data.cacheReady && !!accountId,
        }
    );

    const projects = React.useMemo(
        () =>
            data
                ? data.pages.reduce(
                      (prev, current) => [...prev, ...current],
                      []
                  )
                : undefined,
        [data?.pages]
    );

    const allProjectsQuery = useQuery(
        ['all_projects', accountId],
        () =>
            ProjectService.getListProjects({
                offset: 0,
                limit: 10000,
                filter: {
                    accountId,
                },
            }),
        {
            enabled: !!accountId,
        }
    );

    const allSupportedProjectsQuery = useQuery(
        ['all_supported_projects', accountId],
        () =>
            ProjectService.getListProjects({
                offset: 0,
                limit: 10000,
                filter: {
                    supported: true,
                },
            }),
        {
            enabled: !!accountId,
        }
    );

    const pendingProjectsQuery = useQuery(
        ['pending_projects', accountId],
        () =>
            ProjectService.getListProjects({
                offset: 0,
                limit: 10000,
                filter: {
                    accountId,
                    status: 'pending',
                },
            }),
        {
            enabled: !!accountId,
        }
    );

    const fundingProjectsQuery = useQuery(
        ['funding_projects', accountId],
        () =>
            ProjectService.getListProjects({
                offset: 0,
                limit: 10000,
                filter: {
                    accountId,
                    status: 'funding',
                },
            }),
        {
            enabled: !!accountId,
        }
    );

    const vestingProjectsQuery = useQuery(
        ['vesting_projects', accountId],
        () =>
            ProjectService.getListProjects({
                offset: 0,
                limit: 10000,
                filter: {
                    accountId,
                    status: 'vesting',
                },
            }),
        {
            enabled: !!accountId,
        }
    );

    const doneProjectsQuery = useQuery(
        ['done_projects', accountId],
        () =>
            ProjectService.getListProjects({
                offset: 0,
                limit: 10000,
                filter: {
                    accountId,
                    status: 'done',
                },
            }),
        {
            enabled: !!accountId,
        }
    );

    return (
        <>
            <Header>
                <title>My Account</title>
            </Header>
            <Layout activeKey="one">
                <Box maxW="1600px" margin="auto" padding="0 20px">
                    <Text layerStyle="headingPage">My profile</Text>
                    <SimpleGrid columns={2} spacing={10}>
                        <VStack align="stretch" spacing="20px">
                            <Box layerStyle="cardPrimary">
                                <Box p="30px">
                                    <Text
                                        color="textPrimary"
                                        fontSize="26px"
                                        fontWeight="600"
                                        mb="15px"
                                    >
                                        Summary
                                    </Text>
                                    <Text
                                        color="textSecondary"
                                        fontSize="20px"
                                        textAlign="center"
                                    >
                                        {filter.accountId
                                            ? 'Number of Own Projects'
                                            : 'Number Supported Projects'}
                                    </Text>
                                    <Text
                                        color="textYellow"
                                        fontSize="54px"
                                        fontWeight="700"
                                        textAlign="center"
                                    >
                                        {filter.accountId
                                            ? allProjectsQuery.data?.length
                                            : allSupportedProjectsQuery.data
                                                  ?.length}
                                        {}
                                    </Text>
                                    <SimpleGrid
                                        columns={5}
                                        border="2px solid #414346"
                                        borderRadius="5px"
                                        padding="10px 0"
                                    >
                                        <Box textAlign="center">
                                            <Text
                                                color="textSecondary"
                                                fontSize="14px"
                                            >
                                                Pending
                                            </Text>
                                            <Text
                                                color="textYellow"
                                                fontSize="40px"
                                                fontWeight="700"
                                            >
                                                {
                                                    pendingProjectsQuery.data
                                                        ?.length
                                                }
                                            </Text>
                                        </Box>
                                        <Box textAlign="center">
                                            <Text
                                                color="textSecondary"
                                                fontSize="14px"
                                            >
                                                Funding
                                            </Text>
                                            <Text
                                                color="textPrimary"
                                                fontSize="40px"
                                                fontWeight="700"
                                            >
                                                {
                                                    fundingProjectsQuery.data
                                                        ?.length
                                                }
                                            </Text>
                                        </Box>
                                        <Box textAlign="center">
                                            <Text
                                                color="textSecondary"
                                                fontSize="14px"
                                            >
                                                Vesting
                                            </Text>
                                            <Text
                                                color="textPrimary"
                                                fontSize="40px"
                                                fontWeight="700"
                                            >
                                                {
                                                    vestingProjectsQuery.data
                                                        ?.length
                                                }
                                            </Text>
                                        </Box>
                                        <Box textAlign="center">
                                            <Text
                                                color="textSecondary"
                                                fontSize="14px"
                                            >
                                                Forced stop
                                            </Text>
                                            <Text
                                                color="textRed"
                                                fontSize="40px"
                                                fontWeight="700"
                                            >
                                                0
                                            </Text>
                                        </Box>
                                        <Box textAlign="center">
                                            <Text
                                                color="textSecondary"
                                                fontSize="14px"
                                            >
                                                Done
                                            </Text>
                                            <Text
                                                color="textGreen"
                                                fontSize="40px"
                                                fontWeight="700"
                                            >
                                                {doneProjectsQuery.data?.length}
                                            </Text>
                                        </Box>
                                    </SimpleGrid>
                                </Box>
                            </Box>
                            <Button
                                variant="primary"
                                fontSize="26px"
                                fontWeight="600"
                                w="100%"
                                padding="30px 0"
                                onClick={
                                    ModalsController.controller
                                        .openCreateProjectModal
                                }
                                hidden={!filter.accountId}
                            >
                                Create a new project
                            </Button>
                        </VStack>
                        <VStack spacing="20px" align="stretch">
                            <HStack
                                spacing="5px"
                                layerStyle="cardSecondary"
                                padding="5px"
                            >
                                <Box
                                    flex="1"
                                    textAlign="center"
                                    textColor="textPrimary"
                                    fontSize="18px"
                                    cursor="pointer"
                                    p="5px"
                                    borderRadius="12px"
                                    bg={
                                        !filter.accountId
                                            ? undefined
                                            : 'tertiary'
                                    }
                                    onClick={() => {
                                        setProjectFilter({
                                            accountId,
                                            supported: undefined,
                                        });
                                        applyProjectFilter();
                                    }}
                                >
                                    Own
                                </Box>
                                <Box
                                    flex="1"
                                    textAlign="center"
                                    textColor="textPrimary"
                                    fontSize="18px"
                                    cursor="pointer"
                                    p="5px"
                                    borderRadius="12px"
                                    bg={
                                        !filter.accountId
                                            ? 'tertiary'
                                            : undefined
                                    }
                                    onClick={() => {
                                        setProjectFilter({
                                            accountId: undefined,
                                            supported: true,
                                        });
                                        applyProjectFilter();
                                    }}
                                >
                                    Supported
                                </Box>
                            </HStack>
                            <ProjectFilter
                                filter={filter}
                                setProjectFilter={setProjectFilter}
                                applyProjectFilter={applyProjectFilter}
                            />
                            <ListProjects
                                projects={projects}
                                isLoading={isLoading}
                                gridBreakpoints={{ base: 1 }}
                                fetchNextPage={fetchNextPage}
                                isFetchingNextPage={isFetchingNextPage}
                                hasNextPage={hasNextPage}
                            />
                        </VStack>
                    </SimpleGrid>
                </Box>
            </Layout>
        </>
    );
}
