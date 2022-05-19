import React from 'react';
import Header from 'next/head';
import { Layout } from '../../components/layout';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Box, Button, Flex, HStack, Image, Text } from '@chakra-ui/react';
import {
    ProjectDescription,
    ProjectService,
} from '../../services/projectService';
import { BsClock } from 'react-icons/bs';
import { MdOutlineDoubleArrow } from 'react-icons/md';
import Avatar from 'react-avatar';
import { Nullable } from '../../common';
import { IPFSUtils } from '../../utils/ipfsUtils';
import { db } from '../../db';
import { ModalsController } from '../../utils/modalsController';
import { utils } from 'near-api-js';

export default function ProjectDetailsPage() {
    const router = useRouter();
    const projectId = router.query.projectId as string;

    const { data, isLoading } = useQuery(
        projectId,
        () => db.projects.where({ projectId }).first(),
        {
            enabled: !!projectId,
        }
    );

    const projectDescriptionQuery = useQuery<string>(
        ['project_description', projectId],
        () => IPFSUtils.getDataByCID(data!.description) as any,
        {
            enabled: !!data,
        }
    );

    const description: Nullable<ProjectDescription> = React.useMemo(
        () =>
            projectDescriptionQuery.data
                ? JSON.parse(projectDescriptionQuery.data)
                : null,
        [projectDescriptionQuery.data]
    );

    if (!data) return null;

    console.log(data);

    return (
        <>
            <Header>
                <title>{data ? data.title : projectId}</title>
            </Header>
            <Layout>
                <Box maxW="1600px" margin="auto">
                    <Box>
                        <Image
                            src={
                                description?.thumbnail ??
                                'https://previews.123rf.com/images/bridddy/bridddy1912/bridddy191200005/138386777-horizontal-vector-frosted-glass-blue-and-white-background-frozen-window-illustration-abstract-3d-bg-.jpg'
                            }
                            objectFit="cover"
                            w="100%"
                            h="400px"
                        />
                    </Box>
                    <Box p="15px">
                        <HStack justifyContent="space-between">
                            <Text
                                fontSize="24px"
                                fontWeight="800"
                                textColor="white"
                                mb="15px"
                            >
                                {data.title}
                            </Text>
                            <Button
                                onClick={() => {
                                    console.log(data.minimunDeposit);
                                    ModalsController.controller.setDataSupportProjectModal(
                                        {
                                            projectId,
                                            projectMinimumDeposit:
                                                Number.parseInt(
                                                    data.minimunDeposit
                                                ),
                                        }
                                    );
                                    ModalsController.controller.openSupportProjectModal();
                                }}
                            >
                                Suppport
                            </Button>
                        </HStack>
                        <HStack mb="15px">
                            <Avatar
                                name={data.accountId}
                                round
                                size="30"
                                textSizeRatio={1.75}
                            />
                            <Text fontSize="16px" textColor="#6ba5c1">
                                {data.accountId}
                            </Text>
                        </HStack>
                        <Flex justifyContent="space-between">
                            <Text
                                fontSize="16px"
                                fontWeight="800"
                                textColor="#5D9DDB"
                            >
                                FUNDING TIME
                            </Text>
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
                                        data.startedAt
                                    ).format('DD/MM/YYYY hh:mm')}`}</Text>
                                </HStack>
                                <MdOutlineDoubleArrow color="#fff" size="20" />
                                <Text textColor="#d385ee">{`${moment(
                                    data.endedAt
                                ).format('DD/MM/YYYY hh:mm')}`}</Text>
                            </HStack>
                        </Flex>
                        <Flex justifyContent="space-between">
                            <Text
                                fontSize="16px"
                                fontWeight="800"
                                textColor="#5D9DDB"
                            >
                                VESTING TIME
                            </Text>
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
                                        data.vestingStartTime
                                    ).format('DD/MM/YYYY hh:mm')}`}</Text>
                                </HStack>
                                <MdOutlineDoubleArrow color="#fff" size="20" />
                                <Text textColor="#d385ee">{`${moment(
                                    data.vestingEndTime
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
            </Layout>
        </>
    );
}
