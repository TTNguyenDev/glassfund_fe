import React from 'react';
import { Panel } from 'rsuite';
import classes from './cardCreateTask.module.less';
import { BsPlusLg, BsPlusSquareDotted } from 'react-icons/bs';
import { Wrapper } from '../wrapper';
import { ModalsController } from '../../utils/modalsController';

interface CardCreateTaskProps {}

export const CardCreateTask: React.FunctionComponent<
    CardCreateTaskProps
> = ({}) => {
    return (
        <>
            <Wrapper
                className={classes.root}
                onClick={ModalsController.controller.openCreateProjectModal}
            >
                <Panel>
                    <div
                        style={{
                            display: 'flex',
                            flexFlow: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <div
                            style={{
                                marginBottom: 10,
                                color: 'var(--text-color)',
                            }}
                        >
                            <BsPlusSquareDotted size={45} />
                        </div>
                        <div
                            style={{
                                fontWeight: 600,
                                fontSize: '1.15em',
                                color: 'var(--text-color)',
                            }}
                        >
                            Create New Project
                        </div>
                    </div>
                </Panel>
            </Wrapper>
        </>
    );
};
