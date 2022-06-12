import React from 'react';
import Header from 'next/head';
import { Layout } from '../components/layout';
import classes from './index.module.less';
import { useHomePage } from '../hooks/useHomePage';
import { Loader } from '../components/loader';
import { ListTasks } from '../components/listTasks';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { background, Box, Heading } from '@chakra-ui/react';
import {TaskFilter} from '../components/tasksFilter';
import { filter } from 'lodash';

export default function Home() {
    const {
        authLoading,
        jobs,
        listJobsLoading,
        fetchNextPage,
        isFetchingNextPage,
        hasNextPage,
    } = useHomePage();

    const app = useSelector((state: RootState) => state.app);
    console.log(jobs);
    return (
        <>
            <Header>
                <title>Home</title>
            </Header>
            <Layout>
                {app.data.cacheReady ? (
                    <Box
                        maxW="1240px"
                        margin="auto"
                        marginTop="30px"
                        padding="0 15px"
                    >
                        <Heading
                            display="inline-block"
                            fontSize="54px"
                            fontWeight="600"
                            background="var(--balloon-text-color)"
                            backgroundClip="text"
                            mb="20px"
                        >
                            All projects
                        </Heading>
                        {authLoading && <Loader />}
                        <div className={classes.wrapper}>
                            <div className={classes.top}>
                                <TaskFilter
                                    filter={'All'}
                                    setTaskFilter={filter}
                                    applyTaskFilter={() => {}}
                                />
                            </div>
                            <div className={classes.main}>
                                <ListTasks
                                    tasks={jobs}
                                    isLoading={listJobsLoading}
                                    fetchNextPage={fetchNextPage}
                                    isFetchingNextPage={isFetchingNextPage}
                                    hasNextPage={hasNextPage}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: 50 }} />
                    </Box>
                ) : (
                    <Loader />
                )}
            </Layout>
        </>
    );
}
