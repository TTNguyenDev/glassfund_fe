import React from 'react';
import { useQuery } from 'react-query';
import {
    Project,
    ProjectDescription,
    ProjectService,
} from '../../services/projectService';
import { Box, Flex, HStack, Image, Progress, Text } from '@chakra-ui/react';
import { IPFSUtils } from '../../utils/ipfsUtils';
import { Nullable } from '../../common';
import Avatar from 'react-avatar';
import moment from 'moment';
import { BsClock } from 'react-icons/bs';
import { MdOutlineDoubleArrow } from 'react-icons/md';
import Link from 'next/link';

interface JobCardProps {
    task: Project;
}

export const JobCard: React.FunctionComponent<JobCardProps> = ({ task }) => {
    const projectInfoQuery = useQuery<Project>(
        ['project_info', task.projectId],
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
        <Link href={`/project/${task.projectId}`}>
            <Box
                borderRadius="2xl"
                overflow="hidden"
                bg="#1D365E"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                    transform: 'translateY(-5px)',
                }}
                opacity={Date.now() > task.vestingEndTime ? 0.4 : 1}
            >
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
                    <Text
                        fontSize="24px"
                        fontWeight="800"
                        textColor="white"
                        mb="15px"
                    >
                        {task.title}
                    </Text>
                    <HStack mb="15px" spacing="30px">
                        <HStack>
                            <Avatar
                                name={task.accountId}
                                round
                                size="30"
                                textSizeRatio={1.75}
                            />
                            <Text fontSize="16px" textColor="#6ba5c1">
                                {task.accountId}
                            </Text>
                        </HStack>
                        {!!projectInfoQuery.data && (
                            <HStack w="100%">
                                <Progress
                                    value={Number(projectInfoQuery.data.funded)}
                                    max={Number(task.target)}
                                    size="sm"
                                    borderRadius="3xl"
                                    colorScheme="pink"
                                    flex="1"
                                />
                                <Text
                                    textColor="white"
                                    fontSize="18px"
                                    fontWeight="600"
                                >{`${projectInfoQuery.data.funded}/${task.target} Ⓝ`}</Text>
                            </HStack>
                        )}
                    </HStack>
                    <Flex justifyContent="space-between" mb="10px">
                        <Flex
                            bg={
                                Date.now() >= task.startedAt &&
                                Date.now() <= task.endedAt
                                    ? 'white'
                                    : undefined
                            }
                            alignItems="center"
                            padding="0 10px"
                            borderRadius="3xl"
                        >
                            <Text
                                fontSize="16px"
                                fontWeight="800"
                                lineHeight="16px"
                                textColor="#5D9DDB"
                            >
                                FUNDING TIME
                            </Text>
                        </Flex>
                        <HStack mb="15px">
                            <HStack>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: '#d385ee',
                                    }}
                                >
                                    <BsClock size={16} />
                                </div>
                                <Text textColor="#d385ee">{`${moment(
                                    task.startedAt
                                ).format('DD/MM/YYYY hh:mm')}`}</Text>
                            </HStack>
                            <MdOutlineDoubleArrow color="#fff" size="20" />
                            <Text textColor="#d385ee">{`${moment(
                                task.endedAt
                            ).format('DD/MM/YYYY hh:mm')}`}</Text>
                        </HStack>
                    </Flex>
                    <Flex justifyContent="space-between" mb="20px">
                        <Flex
                            bg={
                                Date.now() >= task.vestingStartTime &&
                                Date.now() <= task.vestingEndTime
                                    ? 'white'
                                    : undefined
                            }
                            alignItems="center"
                            padding="0 10px"
                            borderRadius="3xl"
                        >
                            <Text
                                fontSize="16px"
                                fontWeight="800"
                                textColor="#5D9DDB"
                            >
                                VESTING TIME
                            </Text>
                        </Flex>
                        <HStack mb="15px">
                            <HStack>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: '#d385ee',
                                    }}
                                >
                                    <BsClock size={16} />
                                </div>
                                <Text textColor="#d385ee">{`${moment(
                                    task.vestingStartTime
                                ).format('DD/MM/YYYY hh:mm')}`}</Text>
                            </HStack>
                            <MdOutlineDoubleArrow color="#fff" size="20" />
                            <Text textColor="#d385ee">{`${moment(
                                task.vestingEndTime
                            ).format('DD/MM/YYYY hh:mm')}`}</Text>
                        </HStack>
                    </Flex>
                    <Text
                        fontSize="16px"
                        textColor="white"
                        noOfLines={2}
                        w="100%"
                    >
                        {description?.body.replace(/<(.|\n)*?>/g, ' ')}
                    </Text>
                </Box>
            </Box>
        </Link>
    );
};
