import React from 'react';
import { Grid, Row, Col, Panel, Stack } from 'rsuite';
import classes from './jobCard.module.less';
import { useRouter } from 'next/router';
import moment from 'moment';
import randomColor from 'randomcolor';
import { BsClock, BsPeople } from 'react-icons/bs';
import { Wrapper } from '../wrapper';
import { TaskService } from '../../services/jobService';
import { useQuery } from 'react-query';
import { HtmlIPFS } from '../htmlIPFS';
import { Project, ProjectService } from '../../services/projectService';
import { Box, Image, Text } from '@chakra-ui/react';

interface JobCardProps {
    task: Project;
}

export const JobCard: React.FunctionComponent<JobCardProps> = ({ task }) => {
    const router = useRouter();

    const handleViewDetails = () => {
        router.push(`/project/${task.id}`);
    };

    const bgBadgeCategory = React.useMemo(
        () =>
            randomColor({
                luminosity: 'dark',
            }),
        []
    );

    const taskQuery = useQuery(
        task.id,
        () => ProjectService.getProject(task.id),
        {
            enabled: !!task.id,
        }
    );

    return (
        <Box borderRadius="2xl" overflow="hidden" bg="#1D365E">
            <Box h="200px">
                <Image
                    src="https://www.acerislaw.com/wp-content/uploads/2018/11/Investor-State-Arbitration.jpg"
                    objectFit="cover"
                    h="100%"
                    w="100%"
                />
            </Box>
            <Box p="15px">
                <Text fontSize="24px" fontWeight="800" textColor="white">
                    {task.title}
                </Text>
            </Box>
        </Box>
    );
};
