import React from 'react';
import Header from 'next/head';
import { Layout } from '../components/layout';
import { useHomePage } from '../hooks/useHomePage';
import { Loader } from '../components/loader';
import { ListProjects } from '../components/listProjects';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Box, Text } from '@chakra-ui/react';
import { TaskFilter } from '../components/tasksFilter';
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

    return (
        <>
            <Header>
                <title>Home</title>
            </Header>
            <Layout>
                {app.data.cacheReady ? (
                    <Box layerStyle="wrapper">
                        <Text as="h2" layerStyle="headingPage">
                            All projects
                        </Text>
                        {authLoading && <Loader />}
                        <Box mb="30px">
                            <TaskFilter
                                filter={'All'}
                                setTaskFilter={filter}
                                applyTaskFilter={() => {}}
                            />
                        </Box>
                        <Box>
                            <ListProjects
                                projects={jobs}
                                isLoading={listJobsLoading}
                                fetchNextPage={fetchNextPage}
                                isFetchingNextPage={isFetchingNextPage}
                                hasNextPage={hasNextPage}
                            />
                        </Box>
                    </Box>
                ) : (
                    <Loader />
                )}
            </Layout>
        </>
    );
}
