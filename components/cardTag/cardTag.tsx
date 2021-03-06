import React from 'react';
import { Project } from '../../services/projectService';
import { HStack, Text } from '@chakra-ui/react';
import moment from 'moment';
import classes from './cardTag.module.less';

interface CardTagProps {
    project: Project;
}

export const CardTag: React.FunctionComponent<CardTagProps> = ({ project }) => {
    let state = '';
    let time = '';
    let unit = '';

    const dateCalculate = (to: number): { time: string; unit: string } => {
        let time = '';
        let unit = '';
        const units: moment.unitOfTime.Diff[] = [
            'years',
            'months',
            'days',
            'hours',
            'minutes',
        ];

        let now = moment(Date.now());
        let end = moment(to);
        let index = 0;

        while (time == '' && index < units.length) {
            let diff = end.diff(now, units[index]);
            if (diff > 0) {
                time = diff.toString();
                unit = units[index].toString();
            }
            index++;
        }
        if (time == '') {
            time = '1';
            unit = 'minutes';
        }
        return {
            time,
            unit,
        };
    };

    const now = Date.now();
    if (now < project.startedAt) {
        state = 'Start Funding';
        let cal = dateCalculate(project.startedAt);
        time = cal.time;
        unit = cal.unit;
    } else if (now < project.endedAt) {
        state = 'End Funding';
        let cal = dateCalculate(project.endedAt);
        time = cal.time;
        unit = cal.unit;
    } else if (now < project.vestingEndTime) {
        let startLastInterval =
            project.vestingEndTime - project.vestingInterval;
        if (now < startLastInterval) {
            let next: number =
                project.vestingStartTime + project.vestingInterval;
            while (now > next && next < project.vestingEndTime) {
                next += project.vestingInterval;
            }
            state = 'Next Interval';
            let cal = dateCalculate(next);
            time = cal.time;
            unit = cal.unit;
        } else {
            state = 'End Vesting';
            let cal = dateCalculate(project.vestingEndTime);
            time = cal.time;
            unit = cal.unit;
        }
    } else if (project.forceStopTs) {
        state = 'Force stop';
    } else {
        state = 'Complete';
    }

    return (
        <HStack
            className={classes.card_tag}
            bg={state === 'Force stop' ? '#CA4754' : undefined}
        >
            {(state != 'Complete' && state != 'Force stop' && (
                <>
                    <Text
                        fontSize="40px"
                        fontWeight="700"
                        lineHeight="48px"
                        textColor="var(--balloon-text-color)"
                    >
                        {time}
                    </Text>
                    <Text
                        fontSize="14px"
                        lineHeight="17px"
                        fontWeight="500"
                        textColor="var(--balloon-text-color)"
                    >
                        {unit}
                        <br />
                        {state}
                    </Text>
                </>
            )) || (
                <Text
                    fontSize="26px"
                    fontWeight="500"
                    textColor="var(--balloon-text-color)"
                >
                    {state}
                </Text>
            )}
        </HStack>
    );
};
