import React from 'react';
import Header from 'next/head';
import { Layout } from '../../components/layout';
import classes from './account.module.less';
import { ListProjects } from '../../components/listProjects';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useInfiniteQuery } from 'react-query';
import {
    HStack,
    VStack,
    Text,
    Button,
    SimpleGrid,
    Box,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { Optional } from '../../common';
import {
    ProjectService,
    FETCH_PROJECTS_LIMIT,
} from '../../services/projectService';
import { TaskFilter } from '../../components/tasksFilter';
import { filter } from 'lodash';
import { ModalsController } from '../../utils/modalsController';

export default function AccountPage() {
    const app = useSelector((state: RootState) => state.app);
    const auth = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const accountId = router.query?.accountId as Optional<string>;
    const isOwner = React.useMemo(() => {
        return accountId === auth.data.userId;
    }, [auth.data.userId, accountId]);

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery(
        ['acount_projects'],
        ({ pageParam: { offset } = {} }) =>
            ProjectService.getListProjects({
                offset,
                filter: {
                    accountId,
                },
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

    const projects = data
        ? data.pages.reduce((prev, current) => [...prev, ...current], [])
        : undefined;

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
                                        Number of Own Projects
                                    </Text>
                                    <Text
                                        color="textYellow"
                                        fontSize="54px"
                                        fontWeight="700"
                                        textAlign="center"
                                    >
                                        5
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
                                                1
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
                                                2
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
                                                1
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
                                                1
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
                                                0
                                            </Text>
                                        </Box>
                                    </SimpleGrid>
                                </Box>
                            </Box>
                            <Button
                                color="#E2B714"
                                fontSize="26px"
                                fontWeight="600"
                                borderWidth="1px"
                                borderColor="#E2B714"
                                bg="#2C2E31"
                                w="100%"
                                padding="30px 0"
                                onClick={
                                    ModalsController.controller
                                        .openCreateProjectModal
                                }
                            >
                                Create a new project
                            </Button>
                        </VStack>
                        <VStack spacing="20px">
                            <TaskFilter
                                filter={'All'}
                                setTaskFilter={filter}
                                applyTaskFilter={() => {}}
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
