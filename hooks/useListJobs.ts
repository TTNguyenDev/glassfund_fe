import { useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import {
    FETCH_PROJECTS_LIMIT,
    ProjectService,
} from '../services/projectService';
import { RootState } from '../store';
import { ProjectFilterInput, useProjectFilter } from './useProjectFilter';

export type UseListJobsInput = ProjectFilterInput;

export const useListJobs = (payload?: UseListJobsInput) => {
    const { filter, setProjectFilter, applyProjectFilter } =
        useProjectFilter(payload);

    const app = useSelector((state: RootState) => state.app);

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery(
        ['projects', filter],
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
            enabled: app.data.cacheReady,
        }
    );

    const queryClient = useQueryClient();
    useEffect(() => {
        queryClient.invalidateQueries('projects');
    }, [filter]);

    useEffect(() => {
        fetchNextPage();
    }, []);

    const jobs = data
        ? data.pages.reduce((prev, current) => [...prev, ...current], [])
        : undefined;

    return {
        loading: isLoading,
        jobs,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        filter,
        setProjectFilter,
        applyProjectFilter,
    };
};
