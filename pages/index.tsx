import React from 'react';
import Header from 'next/head';
import { Layout } from '../components/layout';
import { useHomePage } from '../hooks/useHomePage';
import { Loader } from '../components/loader';
import { ListProjects } from '../components/listProjects';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Box, Text } from '@chakra-ui/react';
import { ProjectFilter } from '../components/tasksFilter';

export default function Home() {
    const {
        authLoading,
        jobs,
        listJobsLoading,
        fetchNextPage,
        isFetchingNextPage,
        hasNextPage,
        filter,
        setProjectFilter,
        applyProjectFilter,
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
                            <ProjectFilter
                                filter={filter}
                                setProjectFilter={setProjectFilter}
                                applyProjectFilter={applyProjectFilter}
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
