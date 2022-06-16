import React from 'react';
import classes from './listProjects.module.less';
import { ProjectCard } from '../projectCard';
import { Loader } from '../loader';
import { Optional } from '../../common';
import { Project } from '../../services/projectService';
import { Box, Button, SimpleGrid } from '@chakra-ui/react';

type ListProjectsProps = {
    projects: Optional<Project[]>;
    isLoading: boolean;
    gridBreakpoints?: Record<string, number>;
    fetchNextPage: any;
    isFetchingNextPage: boolean;
    hasNextPage: Optional<boolean>;
};

export const ListProjects: React.FC<ListProjectsProps> = ({
    projects,
    isLoading,
    gridBreakpoints,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
}) => {
    return (
        <Box>
            {isLoading || !projects ? (
                <Loader />
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="40px">
                    {projects &&
                        !!projects.length &&
                        projects.map((project: Project) => (
                            <ProjectCard project={project} key={project.id} />
                        ))}
                </SimpleGrid>
            )}
            {projects && !!projects.length && (
                <Box textAlign="center" padding="30px 0">
                    <Button
                        size="md"
                        onClick={fetchNextPage}
                        isLoading={isFetchingNextPage}
                        isDisabled={!hasNextPage}
                    >
                        View More
                    </Button>
                </Box>
            )}
        </Box>
    );
};
