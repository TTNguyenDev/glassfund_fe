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
    Heading,
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

    const jobs = data
        ? data.pages.reduce((prev, current) => [...prev, ...current], [])
        : undefined;

    return (
        <>
            <Header>
                <title>My Account</title>
            </Header>
            <Layout activeKey="one">
                <Box maxW="1600px" margin="auto" padding="0 20px">
                    <Heading
                        mt="15px"
                        mb="15px"
                        fontSize="54px"
                        fontWeight="600"
                        color="#fff"
                    >
                        My profile
                    </Heading>
                    <SimpleGrid columns={2} spacing={10}>
                        <VStack>
                            <VStack className={classes.wrapbox}>
                                <HStack justify="space-between" w="100%">
                                    <Text>Email</Text>
                                    <Text>Hello</Text>
                                </HStack>
                            </VStack>
                            <VStack className={classes.wrapbox}>
                                <HStack>
                                    <Text>Email</Text>
                                </HStack>
                            </VStack>
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
                        <VStack>
                            <VStack className={classes.wrapbox}>
                                <HStack>
                                    <Text>Email</Text>
                                </HStack>
                            </VStack>
                            <TaskFilter
                                filter={'All'}
                                setTaskFilter={filter}
                                applyTaskFilter={() => {}}
                            />
                            <ListProjects
                                projects={jobs}
                                isLoading={isLoading}
                                gridBreakpoints={{
                                    lg: 24,
                                    md: 24,
                                    sm: 24,
                                    xs: 24,
                                }}
                                isPadding={false}
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
