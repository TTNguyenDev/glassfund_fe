import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useListJobs } from './useListJobs';

export const useHomePage = () => {
    const auth = useSelector((state: RootState) => state.auth);

    const {
        loading: listJobsLoading,
        jobs,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        filter,
        setTaskFilter,
        applyTaskFilter,
    } = useListJobs();

    return {
        authLoading: auth.data.loading,
        logged: auth.data.logged,
        userId: auth.data.userId,
        listJobsLoading,
        jobs,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        filter,
        setTaskFilter,
        applyTaskFilter,
    };
};
