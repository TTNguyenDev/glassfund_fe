import React from 'react';
import { useRouter } from 'next/router';
import randomColor from 'randomcolor';
import { useQuery } from 'react-query';
import {
    Project,
    ProjectDescription,
    ProjectService,
} from '../../services/projectService';
import { Box, Image, Text } from '@chakra-ui/react';
import { IPFSUtils } from '../../utils/ipfsUtils';
import { Nullable } from '../../common';

interface JobCardProps {
    task: Project;
}

export const JobCard: React.FunctionComponent<JobCardProps> = ({ task }) => {
    const projectQuery = useQuery(
        task.projectId,
        () => ProjectService.getProject(task.projectId),
        {
            enabled: !!task.projectId,
        }
    );

    const projectDescriptionQuery = useQuery<string>(
        ['project_description', task.projectId],
        () => IPFSUtils.getDataByCID(task.description) as any,
        {
            enabled: !!task.description,
        }
    );
    const description: Nullable<ProjectDescription> = React.useMemo(
        () =>
            projectDescriptionQuery.data
                ? JSON.parse(projectDescriptionQuery.data)
                : null,
        [projectDescriptionQuery.data]
    );
    return (
        <Box borderRadius="2xl" overflow="hidden" bg="#1D365E">
            <Box h="200px">
                <Image
                    src={
                        description?.thumbnail ??
                        'https://previews.123rf.com/images/bridddy/bridddy1912/bridddy191200005/138386777-horizontal-vector-frosted-glass-blue-and-white-background-frozen-window-illustration-abstract-3d-bg-.jpg'
                    }
                    objectFit="cover"
                    h="100%"
                    w="100%"
                />
            </Box>
            <Box p="15px">
                <Text fontSize="24px" fontWeight="800" textColor="white">
                    {task.title}
                </Text>
                <Text fontSize="16px" textColor="white" noOfLines={2} w="100%">
                    {description?.body.replace(/<(.|\n)*?>/g, ' ')}
                </Text>
            </Box>
        </Box>
    );
};
