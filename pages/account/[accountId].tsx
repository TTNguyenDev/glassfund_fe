import React from 'react';
import Header from 'next/head';
import { Layout } from '../../components/layout';
import { ListProjects } from '../../components/listProjects';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useInfiniteQuery } from 'react-query';
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
import { set } from 'date-fns';

export default function AccountPage() {
    const app = useSelector((state: RootState) => state.app);
    const auth = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const accountId = router.query?.accountId as Optional<string>;
    const isOwner = React.useMemo(() => {
        return accountId === auth.data.userId;
    }, [auth.data.userId, accountId]);

    const [filter, setFilter] = React.useState<Record<string, any>>({});
    const filterRef = React.useRef({});
    const setProjectFilter = React.useCallback(
        (records: Record<string, any>) => {
            filterRef.current = {
                ...filterRef.current,
                ...records,
            };
        },
        [filter]
    );
    const applyProjectFilter = React.useCallback(() => {
        setFilter({ ...filterRef.current });
    }, []);

    React.useEffect(() => {
        if (accountId) {
            filterRef.current = {
                accountId,
            };
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
