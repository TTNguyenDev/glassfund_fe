import React, { useCallback, useEffect } from 'react';
import { Modal } from 'rsuite';
import { useCreateProject } from '../../hooks/useCreateProject';
import { ModalsController } from '../../utils/modalsController';
import DatePicker from 'react-datepicker';
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
import moment from 'moment';

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
    const [startDate, setStartDate] = React.useState(new Date());
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
                                min={1}
                                precision={0}
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
                                    .minimumDeposit
                            }
                        >
                            <FormLabel>Minimum Deposit Ⓝ</FormLabel>
                            <NumberInput
                                defaultValue={1}
                                min={1}
                                precision={2}
                                onChange={(value) =>
                                    createProjectForm.setValue(
                                        'minimumDeposit',
                                        value
                                    )
                                }
                            >
                                <NumberInputField
                                    {...createProjectForm.register(
                                        'minimumDeposit',
                                        {
                                            required:
                                                'Minimum deposit is a required field',
                                        }
                                    )}
                                />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            {createProjectForm.formState.errors
                                .minimumDeposit && (
                                <FormErrorMessage>
                                    {
                                        createProjectForm.formState.errors
                                            .minimumDeposit.message
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
                            <DatePicker
                                selected={
                                    createProjectForm.watch('startedAt')
                                        ? new Date(
                                              createProjectForm.watch(
                                                  'startedAt'
                                              )
                                          )
                                        : null
                                }
                                onChange={(date: Date) => {
                                    createProjectForm.setValue(
                                        'startedAt',
                                        date.getTime()
                                    );
                                    createProjectForm.trigger('startedAt');
                                }}
                                showTimeSelect
                                timeFormat="HH:mm"
                                dateFormat="MMMM d, yyyy HH:mm"
                                timeIntervals={5}
                                filterDate={(date) => {
                                    return moment(new Date())
                                        .subtract(1, 'd')
                                        .isBefore(moment(date));
                                }}
                                filterTime={(time) => {
                                    return Date.now() < time.getTime();
                                }}
                                customInput={
                                    <Input
                                        {...createProjectForm.register(
                                            'startedAt',
                                            {
                                                required:
                                                    'Started at is a required field',
                                            }
                                        )}
                                    />
                                }
                            />
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
                            <FormLabel>Ended At</FormLabel>
                            <DatePicker
                                selected={
                                    createProjectForm.watch('endedAt')
                                        ? new Date(
                                              createProjectForm.watch('endedAt')
                                          )
                                        : null
                                }
                                onChange={(date: Date) => {
                                    createProjectForm.setValue(
                                        'endedAt',
                                        date.getTime()
                                    );
                                    createProjectForm.trigger('endedAt');
                                }}
                                showTimeSelect
                                timeFormat="HH:mm"
                                dateFormat="MMMM d, yyyy HH:mm"
                                timeIntervals={5}
                                filterDate={(date) => {
                                    return moment(
                                        createProjectForm.watch('startedAt')
                                    )
                                        .subtract(1, 'd')
                                        .isBefore(moment(date));
                                }}
                                filterTime={(time) => {
                                    return (
                                        createProjectForm.watch('startedAt') <
                                        time.getTime()
                                    );
                                }}
                                customInput={
                                    <Input
                                        {...createProjectForm.register(
                                            'endedAt',
                                            {
                                                required:
                                                    'Ended at is a required field',
                                            }
                                        )}
                                        placeholder="Ended At"
                                    />
                                }
                            />
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
                            <FormLabel>Vesting Start Time</FormLabel>
                            <DatePicker
                                selected={
                                    createProjectForm.watch('vestingStartTime')
                                        ? new Date(
                                              createProjectForm.watch(
                                                  'vestingStartTime'
                                              )
                                          )
                                        : null
                                }
                                onChange={(date: Date) => {
                                    createProjectForm.setValue(
                                        'vestingStartTime',
                                        date.getTime()
                                    );
                                    createProjectForm.trigger(
                                        'vestingStartTime'
                                    );
                                }}
                                showTimeSelect
                                timeFormat="HH:mm"
                                dateFormat="MMMM d, yyyy HH:mm"
                                timeIntervals={5}
                                filterDate={(date) => {
                                    return moment(
                                        createProjectForm.watch('endedAt')
                                    )
                                        .subtract(1, 'd')
                                        .isBefore(moment(date));
                                }}
                                filterTime={(time) => {
                                    return (
                                        moment(
                                            createProjectForm.watch('endedAt')
                                        )
                                            .seconds(0)
                                            .milliseconds(0)
                                            .valueOf() <= time.getTime()
                                    );
                                }}
                                customInput={
                                    <Input
                                        {...createProjectForm.register(
                                            'vestingStartTime',
                                            {
                                                required:
                                                    'Vesting start time is a required field',
                                            }
                                        )}
                                        placeholder="Vesting Start Time"
                                    />
                                }
                            />
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
                            <FormLabel>Vesting End Time</FormLabel>
                            <DatePicker
                                selected={
                                    createProjectForm.watch('vestingEndTime')
                                        ? new Date(
                                              createProjectForm.watch(
                                                  'vestingEndTime'
                                              )
                                          )
                                        : null
                                }
                                onChange={(date: Date) => {
                                    createProjectForm.setValue(
                                        'vestingEndTime',
                                        date.getTime()
                                    );
                                    createProjectForm.trigger('vestingEndTime');
                                }}
                                showTimeSelect
                                timeFormat="HH:mm"
                                dateFormat="MMMM d, yyyy HH:mm"
                                timeIntervals={5}
                                filterDate={(date) => {
                                    return moment(
                                        createProjectForm.watch(
                                            'vestingStartTime'
                                        )
                                    )
                                        .subtract(1, 'd')
                                        .isBefore(moment(date));
                                }}
                                filterTime={(time) => {
                                    return (
                                        createProjectForm.watch(
                                            'vestingStartTime'
                                        ) < time.getTime()
                                    );
                                }}
                                customInput={
                                    <Input
                                        {...createProjectForm.register(
                                            'vestingEndTime',
                                            {
                                                required:
                                                    'Vesting ended time is a required field',
                                            }
                                        )}
                                        placeholder="Vesting End Time"
                                    />
                                }
                            />
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
                            <FormLabel>Vesting Interval (minute)</FormLabel>
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
