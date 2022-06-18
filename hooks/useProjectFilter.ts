import React from 'react';

export type ProjectFilterInput = {
    defaultFilter?: any;
};

export type ProjectFilterOutput = {
    filter: any;
    setProjectFilter: (payload: Record<string, any>) => void;
    applyProjectFilter: () => void;
};

export const useProjectFilter = ({
    defaultFilter,
}: ProjectFilterInput = {}): ProjectFilterOutput => {
    const [filter, setFilter] = React.useState<Record<string, any>>(
        defaultFilter ?? {}
    );
    const filterRef = React.useRef(defaultFilter ?? {});
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
    return { filter, setProjectFilter, applyProjectFilter };
};
