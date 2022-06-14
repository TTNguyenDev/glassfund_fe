import React from 'react';
import Header from 'next/head';
import { Layout } from '../../components/layout';
import classes from './account.module.less';
import { Col, Container, Row } from 'rsuite';
import { ListTasks } from '../../components/listTasks';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useInfiniteQuery } from 'react-query';
import { Box, Flex, HStack, VStack, Text, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { Optional } from '../../common';
import {
    ProjectService,
    FETCH_PROJECTS_LIMIT,
} from '../../services/projectService';
import { TaskFilter } from '../../components/tasksFilter';
import { filter } from 'lodash';

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
                <Container className={classes.container}>
                    <Heading
                        display="inline-block"
                        fontSize="54px"
                        fontWeight="600"
                        background="var(--balloon-text-color)"
                        backgroundClip="text"
                        mb="40px"
                        ml="20px"
                    >
                       My profile 
                    </Heading>
                    <Row gutter={30}>
                        {/*<Col
                            xs={24}
                            sm={24}
                            md={5}
                            style={{ marginBottom: 20 }}
                        >
                            <div className={classes.left}>
                                <Wrapper
                                    className={classes.owner_info}
                                    style={{ marginBottom: 20 }}
                                >
                                    {profile.data.info && (
                                        <AccountInfoCard
                                            accountId={
                                                profile.data.info.accountId
                                            }
                                            editable
                                        />
                                    )}
                                    <Divider />
                                    <Stack
                                        direction="column"
                                        spacing={5}
                                        alignItems="stretch"
                                        style={{
                                            padding: 10,
                                        }}
                                    >
                                        <Button
                                            style={{ width: '100%' }}
                                            appearance="subtle"
                                            active
                                        >
                                            Tasks
                                        </Button>
                                        <Button
                                            style={{ width: '100%' }}
                                            appearance="subtle"
                                        >
                                            Settings
                                        </Button>
                                    </Stack>
                                </Wrapper>
                            </div>
                        </Col>*/}
                        <Col xs={24} sm={24} md={24}>
                            <div className={classes.wrapper}>
                                <HStack
                                    w='100%'
                                    align='start'
                                >
                                    <VStack
                                        flex='1'
                                    >
                                        <VStack
                                            className={classes.wrapbox}
                                        >
                                            <HStack 
                                                justify='space-between'
                                                w='100%'
                                            >
                                                <Text>
                                                    Email
                                                </Text>
                                                <Text>
                                                    Hello
                                                </Text>
                                            </HStack>
                                        </VStack>
                                        <VStack
                                            className={classes.wrapbox}
                                        >
                                            <HStack>
                                                <Text>
                                                    Email
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </VStack>
                                    <VStack
                                        flex='1'
                                    >
                                        <VStack
                                            className={classes.wrapbox}
                                        >
                                            <HStack>
                                                <Text>
                                                    Email
                                                </Text>
                                            </HStack>
                                        </VStack>
                                        <TaskFilter
                                            filter={'All'}
                                            setTaskFilter={filter}
                                            applyTaskFilter={() => {}}
                                        />
                                        {/* LIST TASK as switch (own/supported) */}
                                    </VStack>
                                </HStack>
                                <div className={classes.main}>
                                    <ListTasks
                                        isCreatable={isOwner}
                                        tasks={jobs}
                                        isLoading={isLoading}
                                        gridBreakpoints={{
                                            lg: 12,
                                            md: 12,
                                            sm: 24,
                                            xs: 24,
                                        }}
                                        fetchNextPage={fetchNextPage}
                                        isFetchingNextPage={isFetchingNextPage}
                                        hasNextPage={hasNextPage}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </Layout>
        </>
    );
}
