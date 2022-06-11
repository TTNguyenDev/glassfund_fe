import React from 'react';
import { useQuery } from 'react-query';
import {
    Project,
    ProjectDescription,
    ProjectService,
} from '../../services/projectService';
import { Box, Flex, HStack, VStack, Image, Progress, Text } from '@chakra-ui/react';
import { IPFSUtils } from '../../utils/ipfsUtils';
import { Nullable } from '../../common';
import Avatar from 'react-avatar';
import moment from 'moment';
import { BsClock } from 'react-icons/bs';
import { MdOutlineDoubleArrow } from 'react-icons/md';
import Link from 'next/link';
import classes from './jobCard.module.less';

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
                className={classes.root}
                opacity={Date.now() > task.vestingEndTime ? 0.45 : 1}
            >
                {/*  
                    Header card
                */}
                <Box h="200px" pos="relative">
                    <Image
                        src={
                            description?.thumbnail ??
                            'https://previews.123rf.com/images/bridddy/bridddy1912/bridddy191200005/138386777-horizontal-vector-frosted-glass-blue-and-white-background-frozen-window-illustration-abstract-3d-bg-.jpg'
                        }
                        objectFit="cover"
                        h="100%"
                        w="100%"
                    />
                    {!!projectInfoQuery.data && (
                        <HStack
                            width="100%"
                            height="200px"
                            pos="absolute"
                            alignItems="top"
                            top='20px'
                            left='0'
                            justifyContent='space-between'
                            paddingEnd='20px'
                        >
                            <HStack className={classes.card_tag}>
                                <Text
                                    fontSize="40px"
                                    fontWeight="700"
                                    lineHeight="48px"
                                    textColor="var(--balloon-text-color)"
                                >
                                    11    
                                </Text>
                                <Text
                                    fontSize="14px"
                                    lineHeight="17px"
                                    fontWeight="500"
                                    textColor="var(--balloon-text-color)"
                                >
                                    days<br/>End Funding 
                                </Text>
                            </HStack>
                            
                            <Flex className={classes.process}>
                                <Text
                                    fontSize="18px"
                                    fontWeight="600"
                                    lineHeight="22px"
                                    textColor="var(--balloon-text-color)"
                                >
                                    {`${projectInfoQuery.data.funded}`}
                                </Text>
                                <Text
                                    fontSize="13px"
                                    fontWeight="500"
                                    textColor="var(--text-color)"
                                    margin="0"
                                >
                                    {`/${task.target}`}  
                                </Text>
                                <Image 
                                    borderRadius='full'
                                    boxSize='22px'
                                    marginLeft='5px'
                                    src="NearIcon.svg"/>
                            </Flex>
                        </HStack>
                    )}
                </Box>
                {!!projectInfoQuery.data && (
                    <Flex
                        w="100%"
                        alignItems="end"
                        flexDir="column"
                    > 
                        <Progress
                            value={Number(projectInfoQuery.data.funded)}
                            max={Number(task.target)}
                            size="sm"
                            colorScheme="yellow"
                            height="7px"
                            width="100%"
                            background="var(--sub-color)"
                        />
                    </Flex>
                )}
                <Box p="20px 30px">
                    <HStack
                        spacing='20px'
                        mb='20px'
                    >
                        <Image 
                            borderRadius='full'
                            boxSize='80px'
                            src="default_avatar.jpg"
                            objectFit='cover'
                            border='2px solid var(--main-color)'
                        />
                        <VStack
                            alignItems='start'
                            spacing='0'
                        >
                            <Text
                                fontSize="26px"
                                fontWeight="700"
                                textColor="white"
                            >
                                {task.title}
                            </Text>
                            <HStack
                                spacing="30px"
                                justifyContent="space-between"
                            >
                                <Text 
                                    fontSize="18px" 
                                    fontWeight="400"
                                    textColor="var(--text-color)"
                                >
                                    {task.accountId}
                                </Text>
                            </HStack>
                        </VStack>
                    </HStack>
                    <HStack border='2px solid var(--sub-color)' borderRadius='5px' padding='10px 0'>
                        <VStack alignItems='center' flex='1' spacing='10px'>
                            <Text
                                fontSize="14px"
                                fontWeight="400"
                                textColor="var(--text-color)"
                            >
                                Force stop
                            </Text>
                            <HStack
                                justifyContent="space-between"
                                alignItems='end'
                                w='fit-content'
                                h='fit-content'
                                spacing='0'
                            >{
                            console.log(task)
                            }
                                <Text 
                                    fontSize="40px" 
                                    lineHeight='40px'
                                    fontWeight="700"
                                    textColor="var(--error-color)"
                                    height='fit-content'
                                >
                                    0
                                </Text>
                                <Text 
                                    fontSize="20px" 
                                    fontWeight="400"
                                    textColor="var(--error-color)"
                                >
                                    /185
                                </Text>
                            </HStack>
                        </VStack>
                        <VStack alignItems='center' flex='1' spacing='10px'>
                            <Text
                                fontSize="14px"
                                fontWeight="400"
                                textColor="var(--text-color)"
                            >
                                Supporters
                            </Text>
                            <HStack
                                justifyContent="space-between"
                                alignItems='end'
                                w='fit-content'
                                h='fit-content'
                                spacing='0'
                            >
                                <Text 
                                    fontSize="40px" 
                                    lineHeight='40px'
                                    fontWeight="700"
                                    textColor="var(--balloon-text-color)"
                                    height='fit-content'
                                >
                                    185
                                </Text>
                            </HStack>
                        </VStack>
                        <VStack alignItems='center' flex='1' spacing='10px'>
                            <Text
                                fontSize="14px"
                                fontWeight="400"
                                textColor="var(--text-color)"
                            >
                                Your support
                            </Text>
                            <HStack
                                justifyContent="space-between"
                                alignItems='end'
                                w='fit-content'
                                h='fit-content'
                                spacing='5px'
                            >
                                <Text 
                                    fontSize="40px" 
                                    lineHeight='40px'
                                    fontWeight="700"
                                    textColor="var(--balloon-text-color)"
                                    height='fit-content'
                                >
                                    0
                                </Text>
                                <Text 
                                    fontSize="18px" 
                                    fontWeight="400"
                                    textColor="var(--balloon-text-color)"
                                >
                                    NEAR
                                </Text>
                            </HStack>
                        </VStack>
                    </HStack>
                    {/*
                    <Flex justifyContent="space-between" mb="10px">
                        <Flex
                            border={
                                Date.now() >= task.startedAt &&
                                Date.now() <= task.endedAt
                                    ? '1px solid var(--main-color)'
                                    : '0'
                            }
                            alignItems="center"
                            padding="7px 10px"
                            borderRadius="7px"
                        >
                            <Text
                                fontSize="15px"
                                fontWeight="700"
                                lineHeight="15px"
                                textColor={
                                    Date.now() >= task.startedAt &&
                                    Date.now() <= task.endedAt
                                        ? 'var(--main-color)'
                                        : 'var(--text-color)'
                                }
                            >
                                FUNDING
                            </Text>
                        </Flex>
                        <HStack alignItems="center">
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
                                ).format('DD/MM/YYYY HH:mm')}`}</Text>
                            </HStack>
                            <MdOutlineDoubleArrow color="#fff" size="20" />
                            <Text textColor="#d385ee">{`${moment(
                                task.endedAt
                            ).format('DD/MM/YYYY HH:mm')}`}</Text>
                        </HStack>
                    </Flex>
                    <Flex justifyContent="space-between" mb="20px">
                        <Flex
                            border={
                                Date.now() >= task.vestingStartTime &&
                                Date.now() <= task.vestingEndTime
                                    ? '1px solid var(--main-color)'
                                    : '0px'
                            }
                            borderWidth="1px"
                            alignItems="center"
                            padding="7px 10px"
                            borderRadius="7px"
                        >
                            <Text
                                fontSize="15px"
                                fontWeight="700"
                                lineHeight="15px"
                                textColor={
                                    Date.now() >= task.vestingStartTime &&
                                    Date.now() <= task.vestingEndTime
                                        ? 'var(--main-color)'
                                        : 'var(--text-color)'
                                }
                            >
                                VESTING
                            </Text>
                        </Flex>
                        <HStack alignItems="center">
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
                                ).format('DD/MM/YYYY HH:mm')}`}</Text>
                            </HStack>
                            <MdOutlineDoubleArrow color="#fff" size="20" />
                            <Text textColor="#d385ee">{`${moment(
                                task.vestingEndTime
                            ).format('DD/MM/YYYY HH:mm')}`}</Text>
                        </HStack>
                    </Flex>
                    <Text
                        fontSize="15px"
                        textColor="var(--text-color)"
                        noOfLines={2}
                        w="100%"
                    >
                        {description?.body.replace(/<(.|\n)*?>/g, ' ')}
                    </Text>
                    */}
                </Box>
            </Box>
        </Link>
    );
};
