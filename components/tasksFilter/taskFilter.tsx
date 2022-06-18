import React, { useCallback } from 'react';
import { Button, Input } from 'rsuite';
import classes from './taskFilter.module.less';
import Select from 'react-select';

type TaskFilterProps = {
    filter: any;
    setProjectFilter: (payload: Record<string, any>) => void;
    applyProjectFilter: () => void;
};

export const SORT_SELECT_OPTIONS = [
    {
        label: 'All',
        value: undefined,
    },
    {
        label: 'Pending',
        value: 'pending',
    },
    {
        label: 'Funding',
        value: 'funding',
    },
    {
        label: 'Vesting',
        value: 'vesting',
    },
    {
        label: 'Done',
        value: 'done',
    },
];

export const ProjectFilter: React.FC<TaskFilterProps> = ({
    filter,
    setProjectFilter,
    applyProjectFilter,
}) => {
    const searchInputRef = React.useRef<any>();

    const handleBtnSearchClick = useCallback(() => {
        setProjectFilter({ title: searchInputRef.current.value });
        applyProjectFilter();
    }, []);

    return (
        <div className={classes.root}>
            <div style={{ height: '100%', margin: 0 }}>
                <Select
                    className={classes.sellect}
                    options={SORT_SELECT_OPTIONS}
                    isSearchable={false}
                    defaultValue={
                        filter?.sort
                            ? SORT_SELECT_OPTIONS.find(
                                  (o) => o.value === filter.sort
                              )
                            : SORT_SELECT_OPTIONS[0]
                    }
                    components={{
                        IndicatorSeparator: () => null,
                    }}
                    styles={{
                        container: (base) => ({
                            ...base,
                            height: '100%',
                        }),
                        singleValue: (base) => ({
                            ...base,
                            color: 'var(--text-color)',
                            fontWeight: '400',
                            fontSize: 18,
                        }),
                        control: (base, state) => ({
                            ...base,
                            minWidth: 140,
                            fontWeight: 400,
                            fontSize: 18,
                            border: 'none',
                            background: 'var(--sub-alt-color)',
                            borderRadius: 6,
                            cursor: 'pointer',
                            boxShadow: 'var(--primary-box-shadow-color)',
                            height: '100%',
                            padding: 0,
                            gap: 5,
                        }),
                        valueContainer: (base) => ({
                            ...base,
                            padding: '0 0 0 20px',
                        }),
                        menu: (base) => ({
                            ...base,
                            background: 'var(--sub-alt-color)',
                            color: 'var(text-color)',
                            padding: 0,
                            width: 120,
                        }),
                        option: (base, state) => ({
                            ...base,
                            background: state.isSelected
                                ? 'var(--sub-color)'
                                : state.isFocused
                                ? 'var(--background-color)'
                                : 'var(--sub-alt-color)',
                            color: 'var(--text-color)',
                            fontWeight: state.isSelected ? 600 : 500,
                            fontSize: '16px',
                        }),
                        menuList: (base) => ({
                            ...base,
                            padding: 0,
                        }),
                    }}
                    onChange={(option) => {
                        setProjectFilter({
                            type: option.value,
                        });
                        applyProjectFilter();
                    }}
                />
            </div>
            <Input
                placeholder="Search..."
                className={classes.search_text_field}
                ref={searchInputRef}
            />
            <div style={{ height: '100%' }}>
                <Button
                    style={{
                        padding: '0 20px',
                        height: '100%',
                        fontWeight: 500,
                        fontSize: 18,
                        background: 'var(--sub-alt-color)',
                        boxShadow: 'var(--primary-box-shadow-color)',
                        color: 'var(--text-color)',
                    }}
                    onClick={handleBtnSearchClick}
                >
                    Search
                </Button>
            </div>
        </div>
    );
};
