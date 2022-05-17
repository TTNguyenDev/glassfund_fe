import React, { useCallback, useEffect } from 'react';
import { Modal, DatePicker } from 'rsuite';
import { useCreateProject } from '../../hooks/useCreateProject';
import { ModalsController } from '../../utils/modalsController';
import * as dateFns from 'date-fns';
import {
    AspectRatio,
    Box,
    Button,
    Center,
    FormControl,
    FormErrorMessage,
    FormLabel,
    HStack,
    Image,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Stack,
    VStack,
} from '@chakra-ui/react';
import { Editor } from '../editor';
import { IPFSUtils } from '../../utils/ipfsUtils';
import { useMutation } from 'react-query';

type createProjectModalProps = {};

export const CreateProjectModal: React.FunctionComponent<
    createProjectModalProps
> = () => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        ModalsController.setController({
            openCreateProjectModal: handleOpen,
        });
    }, []);

    const { createProjectLoading, handleFormSubmit, createProjectForm } =
        useCreateProject();

    const handleEditorChange = useCallback((value: string) => {
        if (
            !value?.replace(/<(.|\n)*?>/g, '').trim() &&
            !value.includes('iframe') &&
            !value.includes('img')
        ) {
            createProjectForm.setValue('body', '');
        } else {
            createProjectForm.setValue('body', value);
        }
        createProjectForm.trigger('body');
    }, []);

    const fileInputRef = React.useRef<any>();

    const uploadFileMutation = useMutation(async () => {
        if (fileInputRef.current?.files) {
            const file = fileInputRef.current.files[0];
            await IPFSUtils.uploadFileToIPFS({
                file,
                onSuccess: async (url) => {
                    return createProjectForm.setValue('thumbnail', url);
                },
            });
        }
    });

    const openFileImport = useCallback(async () => {
        fileInputRef.current?.click();
    }, []);
    return (
        <Modal
            size="sm"
            backdrop="static"
            keyboard={false}
            open={open}
            onClose={handleClose}
            overflow={false}
        >
            <Modal.Header>
                <Modal.Title>Create new project</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleFormSubmit}>
                <Modal.Body>
                    <VStack spacing="1em" align="stretch">
                        <FormControl
                            isInvalid={
                                !!createProjectForm.formState.errors.title
                            }
                        >
                            <FormLabel htmlFor="title">Title</FormLabel>
                            <Input
                                {...createProjectForm.register('title', {
                                    required: 'This is required',
                                })}
                                placeholder="Title"
                            />
                            {createProjectForm.formState.errors.title && (
                                <FormErrorMessage>
                                    {
                                        createProjectForm.formState.errors.title
                                            .message
                                    }
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl
                            isInvalid={
                                !!createProjectForm.formState.errors.target
                            }
                        >
                            <FormLabel>Target Ⓝ</FormLabel>
                            <NumberInput
                                defaultValue={1}
                                min={0.01}
                                precision={2}
                                onChange={(value) =>
                                    createProjectForm.setValue('target', value)
                                }
                            >
                                <NumberInputField
                                    {...createProjectForm.register('target', {
                                        required: 'Targe is a required field',
                                    })}
                                />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            {createProjectForm.formState.errors.target && (
                                <FormErrorMessage>
                                    {
                                        createProjectForm.formState.errors
                                            .target.message
                                    }
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl
                            isInvalid={
                                !!createProjectForm.formState.errors
                                    .minimunDeposite
                            }
                        >
                            <FormLabel>Minimum Deposite Ⓝ</FormLabel>
                            <NumberInput
                                defaultValue={1}
                                min={0.01}
                                precision={2}
                                onChange={(value) =>
                                    createProjectForm.setValue(
                                        'minimunDeposite',
                                        value
                                    )
                                }
                            >
                                <NumberInputField
                                    {...createProjectForm.register(
                                        'minimunDeposite',
                                        {
                                            required:
                                                'Minimum deposite is a required field',
                                        }
                                    )}
                                />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            {createProjectForm.formState.errors
                                .minimunDeposite && (
                                <FormErrorMessage>
                                    {
                                        createProjectForm.formState.errors
                                            .minimunDeposite.message
                                    }
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl
                            isInvalid={
                                !!createProjectForm.formState.errors.startedAt
                            }
                        >
                            <FormLabel>Started At</FormLabel>
                            <Input
                                hidden
                                {...createProjectForm.register('startedAt', {
                                    required: 'Started at is a required field',
                                })}
                            />
                            <Box h="40px">
                                <DatePicker
                                    onChange={(value) => {
                                        createProjectForm.setValue(
                                            'startedAt',
                                            (value as Date).getTime()
                                        );
                                        createProjectForm.trigger('startedAt');
                                    }}
                                    format="yyyy-MM-dd HH:mm"
                                    style={{ width: '100%', marginBottom: -15 }}
                                    disabledDate={(date) =>
                                        dateFns.isBefore(
                                            date!,
                                            dateFns.subDays(new Date(), 1)
                                        )
                                    }
                                    disabledHours={(hour, date) => {
                                        if (
                                            dateFns.getDate(date) ===
                                            dateFns.getDate(new Date())
                                        ) {
                                            return (
                                                hour <
                                                dateFns.getHours(new Date())
                                            );
                                        }

                                        return false;
                                    }}
                                    disabledMinutes={(minute, date) => {
                                        if (
                                            dateFns.getDate(date) ===
                                                dateFns.getDate(new Date()) &&
                                            dateFns.getHours(date) ===
                                                dateFns.getHours(new Date())
                                        ) {
                                            return (
                                                minute <
                                                dateFns.getMinutes(new Date())
                                            );
                                        }

                                        return false;
                                    }}
                                />
                            </Box>
                            {createProjectForm.formState.errors.startedAt && (
                                <FormErrorMessage>
                                    {
                                        createProjectForm.formState.errors
                                            .startedAt.message
                                    }
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl
                            isInvalid={
                                !!createProjectForm.formState.errors.endedAt
                            }
                        >
                            <FormLabel>Started At</FormLabel>
                            <Input
                                hidden
                                {...createProjectForm.register('endedAt', {
                                    required: 'Started at is a required field',
                                })}
                            />
                            <Box h="40px">
                                <DatePicker
                                    onChange={(value) => {
                                        createProjectForm.setValue(
                                            'endedAt',
                                            (value as Date).getTime()
                                        );
                                        createProjectForm.trigger('endedAt');
                                    }}
                                    format="yyyy-MM-dd HH:mm"
                                    style={{ width: '100%', marginBottom: -15 }}
                                    disabledDate={(date) =>
                                        dateFns.isBefore(
                                            date!,
                                            dateFns.subDays(new Date(), 1)
                                        )
                                    }
                                    disabledHours={(hour, date) => {
                                        if (
                                            dateFns.getDate(date) ===
                                            dateFns.getDate(new Date())
                                        ) {
                                            return (
                                                hour <
                                                dateFns.getHours(new Date())
                                            );
                                        }

                                        return false;
                                    }}
                                    disabledMinutes={(minute, date) => {
                                        if (
                                            dateFns.getDate(date) ===
                                                dateFns.getDate(new Date()) &&
                                            dateFns.getHours(date) ===
                                                dateFns.getHours(new Date())
                                        ) {
                                            return (
                                                minute <
                                                dateFns.getMinutes(new Date())
                                            );
                                        }

                                        return false;
                                    }}
                                />
                            </Box>
                            {createProjectForm.formState.errors.endedAt && (
                                <FormErrorMessage>
                                    {
                                        createProjectForm.formState.errors
                                            .endedAt.message
                                    }
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl
                            isInvalid={
                                !!createProjectForm.formState.errors
                                    .vestingStartTime
                            }
                        >
                            <FormLabel>Vesting Started Time</FormLabel>
                            <Input
                                hidden
                                {...createProjectForm.register(
                                    'vestingStartTime',
                                    {
                                        required:
                                            'Vesting started time is a required field',
                                    }
                                )}
                            />
                            <Box h="40px">
                                <DatePicker
                                    onChange={(value) => {
                                        createProjectForm.setValue(
                                            'vestingStartTime',
                                            (value as Date).getTime()
                                        );
                                        createProjectForm.trigger(
                                            'vestingStartTime'
                                        );
                                    }}
                                    format="yyyy-MM-dd HH:mm"
                                    style={{ width: '100%', marginBottom: -15 }}
                                    disabledDate={(date) =>
                                        dateFns.isBefore(
                                            date!,
                                            dateFns.subDays(new Date(), 1)
                                        )
                                    }
                                    disabledHours={(hour, date) => {
                                        if (
                                            dateFns.getDate(date) ===
                                            dateFns.getDate(new Date())
                                        ) {
                                            return (
                                                hour <
                                                dateFns.getHours(new Date())
                                            );
                                        }

                                        return false;
                                    }}
                                    disabledMinutes={(minute, date) => {
                                        if (
                                            dateFns.getDate(date) ===
                                                dateFns.getDate(new Date()) &&
                                            dateFns.getHours(date) ===
                                                dateFns.getHours(new Date())
                                        ) {
                                            return (
                                                minute <
                                                dateFns.getMinutes(new Date())
                                            );
                                        }

                                        return false;
                                    }}
                                />
                            </Box>
                            {createProjectForm.formState.errors
                                .vestingStartTime && (
                                <FormErrorMessage>
                                    {
                                        createProjectForm.formState.errors
                                            .vestingStartTime.message
                                    }
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl
                            isInvalid={
                                !!createProjectForm.formState.errors
                                    .vestingEndTime
                            }
                        >
                            <FormLabel>Vesting Ended Time</FormLabel>
                            <Input
                                hidden
                                {...createProjectForm.register(
                                    'vestingEndTime',
                                    {
                                        required:
                                            'Vesting ended time is a required field',
                                    }
                                )}
                            />
                            <Box h="40px">
                                <DatePicker
                                    onChange={(value) => {
                                        createProjectForm.setValue(
                                            'vestingEndTime',
                                            (value as Date).getTime()
                                        );
                                        createProjectForm.trigger(
                                            'vestingEndTime'
                                        );
                                    }}
                                    format="yyyy-MM-dd HH:mm"
                                    style={{ width: '100%', marginBottom: -15 }}
                                    disabledDate={(date) =>
                                        dateFns.isBefore(
                                            date!,
                                            dateFns.subDays(new Date(), 1)
                                        )
                                    }
                                    disabledHours={(hour, date) => {
                                        if (
                                            dateFns.getDate(date) ===
                                            dateFns.getDate(new Date())
                                        ) {
                                            return (
                                                hour <
                                                dateFns.getHours(new Date())
                                            );
                                        }

                                        return false;
                                    }}
                                    disabledMinutes={(minute, date) => {
                                        if (
                                            dateFns.getDate(date) ===
                                                dateFns.getDate(new Date()) &&
                                            dateFns.getHours(date) ===
                                                dateFns.getHours(new Date())
                                        ) {
                                            return (
                                                minute <
                                                dateFns.getMinutes(new Date())
                                            );
                                        }

                                        return false;
                                    }}
                                />
                            </Box>
                            {createProjectForm.formState.errors
                                .vestingEndTime && (
                                <FormErrorMessage>
                                    {
                                        createProjectForm.formState.errors
                                            .vestingEndTime.message
                                    }
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl
                            isInvalid={
                                !!createProjectForm.formState.errors
                                    .vestingInterval
                            }
                        >
                            <FormLabel>Vesting Interval (month)</FormLabel>
                            <NumberInput
                                defaultValue={1}
                                min={1}
                                precision={0}
                                onChange={(value) =>
                                    createProjectForm.setValue(
                                        'vestingInterval',
                                        Number(value)
                                    )
                                }
                            >
                                <NumberInputField
                                    {...createProjectForm.register(
                                        'vestingInterval',
                                        {
                                            required:
                                                'Vesting interval is a required field',
                                        }
                                    )}
                                />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            {createProjectForm.formState.errors
                                .vestingInterval && (
                                <FormErrorMessage>
                                    {
                                        createProjectForm.formState.errors
                                            .vestingInterval.message
                                    }
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl
                            isInvalid={
                                !!createProjectForm.formState.errors.thumbnail
                            }
                        >
                            <FormLabel>Thumbnail</FormLabel>
                            <Stack
                                direction={{
                                    base: 'column',
                                    md: 'row',
                                }}
                            >
                                <Box flex={1}>
                                    <Input
                                        placeholder="Image url"
                                        {...createProjectForm.register(
                                            'thumbnail',
                                            {
                                                required:
                                                    'Thumbnail is required field',
                                            }
                                        )}
                                    />
                                    {createProjectForm.formState.errors
                                        .thumbnail && (
                                        <FormErrorMessage>
                                            {
                                                createProjectForm.formState
                                                    .errors.thumbnail.message
                                            }
                                        </FormErrorMessage>
                                    )}
                                </Box>
                                <HStack align="flex-start">
                                    <Button
                                        colorScheme="purple"
                                        borderColor="#FF4F5E"
                                        fontSize="12px"
                                        onClick={openFileImport}
                                        isLoading={uploadFileMutation.isLoading}
                                    >
                                        Upload
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        hidden
                                        onChange={async () => {
                                            await uploadFileMutation.mutateAsync();
                                            createProjectForm.trigger(
                                                'thumbnail'
                                            );
                                        }}
                                    />
                                </HStack>
                            </Stack>
                            {!!createProjectForm.watch('thumbnail') && (
                                <Center mt="15px">
                                    <AspectRatio
                                        ratio={16 / 9}
                                        maxW="400px"
                                        width="100%"
                                    >
                                        <Image
                                            src={createProjectForm.watch(
                                                'thumbnail'
                                            )}
                                        />
                                    </AspectRatio>
                                </Center>
                            )}
                        </FormControl>
                        <FormControl
                            isInvalid={
                                !!createProjectForm.formState.errors.body
                            }
                        >
                            <FormLabel mb={0}>Description</FormLabel>
                            <Input
                                hidden
                                {...createProjectForm.register('body', {
                                    required: 'Description is a required field',
                                })}
                            />
                            <Editor
                                onChange={handleEditorChange}
                                style={{
                                    padding: 0,
                                }}
                                placeholder="Description"
                            />
                            {createProjectForm.formState.errors.body && (
                                <FormErrorMessage>
                                    {
                                        createProjectForm.formState.errors.body
                                            .message
                                    }
                                </FormErrorMessage>
                            )}
                        </FormControl>
                    </VStack>
                </Modal.Body>
                <Modal.Footer>
                    <HStack justifyContent="end">
                        <Button
                            colorScheme="purple"
                            type="submit"
                            isLoading={createProjectLoading}
                        >
                            Create
                        </Button>
                        <Button onClick={handleClose}>Cancel</Button>
                    </HStack>
                </Modal.Footer>
            </form>
        </Modal>
    );
};
