import React, { useCallback, useEffect } from 'react';
import { useCreateProject } from '../../hooks/useCreateProject';
import { ModalsController } from '../../utils/modalsController';
import DatePicker from 'react-datepicker';
import {
    Text,
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
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Grid,
    GridItem,
    useRadio,
    useRadioGroup,
} from '@chakra-ui/react';
import { Editor } from '../editor';
import { IPFSUtils } from '../../utils/ipfsUtils';
import { useMutation } from 'react-query';
import moment from 'moment';

type createProjectModalProps = {};

export const CreateProjectModal: React.FunctionComponent<
    createProjectModalProps
> = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        ModalsController.setController({
            openCreateProjectModal: onOpen,
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

    const options = [
        {
            label: '1 min',
            value: '1',
        },
        {
            label: '5 mins',
            value: '5',
        },
        {
            label: '1 month',
            value: '43200',
        },
        {
            label: '2 months',
            value: '86400',
        },
        {
            label: '6 months',
            value: '259200',
        },
    ];

    const { getRootProps, getRadioProps } = useRadioGroup({
        name: 'vestingInterval',
        defaultValue: '1',
        onChange: (value: any) => {
            createProjectForm.setValue('vestingInterval', value);
            createProjectForm.trigger('vestingInterval');
        },
    });

    const group = getRootProps();

    return (
        <Modal size="2xl" isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />

            <ModalContent bg="#323437">
                <ModalCloseButton color="white" />
                <ModalHeader></ModalHeader>
                <form onSubmit={handleFormSubmit}>
                    <ModalBody>
                        <Box mb="20px">
                            <Text
                                color="textYellow"
                                fontSize="26px"
                                fontWeight="600"
                                textAlign="center"
                                lineHeight="15px"
                            >
                                Create a project
                            </Text>
                            <Text
                                color="textSecondary"
                                fontSize="16px"
                                textAlign="center"
                            >
                                Build up your dream without money
                            </Text>
                        </Box>
                        <Grid templateColumns="repeat(6, 1fr)" gap="20px">
                            <GridItem colSpan={6}>
                                <FormControl
                                    isInvalid={
                                        !!createProjectForm.formState.errors
                                            .title
                                    }
                                >
                                    <FormLabel
                                        color="textSecondary"
                                        htmlFor="title"
                                    >
                                        Title
                                    </FormLabel>
                                    <Input
                                        {...createProjectForm.register(
                                            'title',
                                            {
                                                required: 'This is required',
                                            }
                                        )}
                                        placeholder="ex: GlassFund"
                                        bg="#2C2E31"
                                        borderRadius="10px"
                                        color="textPrimary"
                                        border="none"
                                    />
                                    {createProjectForm.formState.errors
                                        .title && (
                                        <FormErrorMessage>
                                            {
                                                createProjectForm.formState
                                                    .errors.title.message
                                            }
                                        </FormErrorMessage>
                                    )}
                                </FormControl>
                            </GridItem>
                            <GridItem colSpan={4}>
                                <FormControl
                                    isInvalid={
                                        !!createProjectForm.formState.errors
                                            .target
                                    }
                                >
                                    <FormLabel
                                        fontSize="14px"
                                        fontWeight="400"
                                        color="textSecondary"
                                    >
                                        Target Ⓝ
                                    </FormLabel>
                                    <NumberInput
                                        defaultValue={1}
                                        min={1}
                                        precision={0}
                                        onChange={(value) =>
                                            createProjectForm.setValue(
                                                'target',
                                                value
                                            )
                                        }
                                    >
                                        <NumberInputField
                                            {...createProjectForm.register(
                                                'target',
                                                {
                                                    required:
                                                        'Targe is a required field',
                                                }
                                            )}
                                            placeholder="ex: 10,000,000.00"
                                            bg="#2C2E31"
                                            borderRadius="10px"
                                            color="textPrimary"
                                            border="none"
                                        />
                                        <NumberInputStepper color="white">
                                            <NumberIncrementStepper border="none" />
                                            <NumberDecrementStepper border="none" />
                                        </NumberInputStepper>
                                    </NumberInput>
                                    {createProjectForm.formState.errors
                                        .target && (
                                        <FormErrorMessage>
                                            {
                                                createProjectForm.formState
                                                    .errors.target.message
                                            }
                                        </FormErrorMessage>
                                    )}
                                </FormControl>
                            </GridItem>
                            <GridItem colSpan={2}>
                                <FormControl
                                    isInvalid={
                                        !!createProjectForm.formState.errors
                                            .minimumDeposit
                                    }
                                >
                                    <FormLabel
                                        fontSize="14px"
                                        fontWeight="400"
                                        color="textSecondary"
                                    >
                                        Minimum Deposit Ⓝ
                                    </FormLabel>
                                    <NumberInput
                                        defaultValue={1}
                                        min={0.01}
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
                                            placeholder="ex: 1.00"
                                            bg="#2C2E31"
                                            borderRadius="10px"
                                            color="textPrimary"
                                            border="none"
                                        />
                                        <NumberInputStepper color="white">
                                            <NumberIncrementStepper border="none" />
                                            <NumberDecrementStepper border="none" />
                                        </NumberInputStepper>
                                    </NumberInput>
                                    {createProjectForm.formState.errors
                                        .minimumDeposit && (
                                        <FormErrorMessage>
                                            {
                                                createProjectForm.formState
                                                    .errors.minimumDeposit
                                                    .message
                                            }
                                        </FormErrorMessage>
                                    )}
                                </FormControl>
                            </GridItem>
                            <GridItem colSpan={2}>
                                <FormControl
                                    isInvalid={
                                        !!createProjectForm.formState.errors
                                            .startedAt
                                    }
                                >
                                    <FormLabel
                                        fontSize="14px"
                                        fontWeight="400"
                                        color="textSecondary"
                                    >
                                        Start funding time
                                    </FormLabel>
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
                                            createProjectForm.trigger(
                                                'startedAt'
                                            );
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
                                                bg="#2C2E31"
                                                borderRadius="10px"
                                                color="textPrimary"
                                                border="none"
                                            />
                                        }
                                    />
                                    {createProjectForm.formState.errors
                                        .startedAt && (
                                        <FormErrorMessage>
                                            {
                                                createProjectForm.formState
                                                    .errors.startedAt.message
                                            }
                                        </FormErrorMessage>
                                    )}
                                </FormControl>
                            </GridItem>
                            <GridItem colSpan={2}>
                                <FormControl
                                    isInvalid={
                                        !!createProjectForm.formState.errors
                                            .endedAt
                                    }
                                >
                                    <FormLabel
                                        fontSize="14px"
                                        fontWeight="400"
                                        color="textSecondary"
                                    >
                                        End funding time
                                    </FormLabel>
                                    <DatePicker
                                        selected={
                                            createProjectForm.watch('endedAt')
                                                ? new Date(
                                                      createProjectForm.watch(
                                                          'endedAt'
                                                      )
                                                  )
                                                : null
                                        }
                                        onChange={(date: Date) => {
                                            createProjectForm.setValue(
                                                'endedAt',
                                                date.getTime()
                                            );
                                            createProjectForm.trigger(
                                                'endedAt'
                                            );
                                        }}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        dateFormat="MMMM d, yyyy HH:mm"
                                        timeIntervals={5}
                                        filterDate={(date) => {
                                            return moment(
                                                createProjectForm.watch(
                                                    'startedAt'
                                                )
                                            )
                                                .subtract(1, 'd')
                                                .isBefore(moment(date));
                                        }}
                                        filterTime={(time) => {
                                            return (
                                                createProjectForm.watch(
                                                    'startedAt'
                                                ) < time.getTime()
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
                                                bg="#2C2E31"
                                                borderRadius="10px"
                                                color="textPrimary"
                                                border="none"
                                            />
                                        }
                                    />
                                    {createProjectForm.formState.errors
                                        .endedAt && (
                                        <FormErrorMessage>
                                            {
                                                createProjectForm.formState
                                                    .errors.endedAt.message
                                            }
                                        </FormErrorMessage>
                                    )}
                                </FormControl>
                            </GridItem>
                            <GridItem colSpan={2}>
                                <FormControl
                                    isInvalid={
                                        !!createProjectForm.formState.errors
                                            .vestingEndTime
                                    }
                                >
                                    <FormLabel
                                        fontSize="14px"
                                        fontWeight="400"
                                        color="textSecondary"
                                    >
                                        End vesting time
                                    </FormLabel>
                                    <DatePicker
                                        selected={
                                            createProjectForm.watch(
                                                'vestingEndTime'
                                            )
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
                                            createProjectForm.trigger(
                                                'vestingEndTime'
                                            );
                                        }}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        dateFormat="MMMM d, yyyy HH:mm"
                                        timeIntervals={5}
                                        filterDate={(date) => {
                                            return moment(
                                                createProjectForm.watch(
                                                    'endedAt'
                                                )
                                            )
                                                .subtract(1, 'd')
                                                .isBefore(moment(date));
                                        }}
                                        filterTime={(time) => {
                                            return (
                                                createProjectForm.watch(
                                                    'endedAt'
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
                                                bg="#2C2E31"
                                                borderRadius="10px"
                                                color="textPrimary"
                                                border="none"
                                            />
                                        }
                                    />
                                    {createProjectForm.formState.errors
                                        .vestingEndTime && (
                                        <FormErrorMessage>
                                            {
                                                createProjectForm.formState
                                                    .errors.vestingEndTime
                                                    .message
                                            }
                                        </FormErrorMessage>
                                    )}
                                </FormControl>
                            </GridItem>
                            <GridItem colSpan={6}>
                                <FormControl
                                    isInvalid={
                                        !!createProjectForm.formState.errors
                                            .vestingInterval
                                    }
                                >
                                    <FormLabel
                                        fontSize="14px"
                                        fontWeight="400"
                                        color="textSecondary"
                                    >
                                        Vesting Interval
                                    </FormLabel>
                                    <Input
                                        hidden
                                        {...createProjectForm.register(
                                            'vestingInterval',
                                            {
                                                required:
                                                    'Vesting interval is a required field',
                                                max: {
                                                    value:
                                                        (createProjectForm.watch(
                                                            'vestingEndTime'
                                                        ) -
                                                            createProjectForm.watch(
                                                                'endedAt'
                                                            )) /
                                                        60000,

                                                    message:
                                                        'Vesting interval must be less than vesting time',
                                                },
                                            }
                                        )}
                                    />
                                    <HStack {...group}>
                                        {options.map((option: any) => {
                                            const radio = getRadioProps({
                                                value: option.value,
                                            });
                                            return (
                                                <RadioCard
                                                    key={option.value}
                                                    {...radio}
                                                >
                                                    {option.label}
                                                </RadioCard>
                                            );
                                        })}
                                    </HStack>
                                    {/*<NumberInput
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
                                                    max: {
                                                        value:
                                                            (createProjectForm.watch(
                                                                'vestingEndTime'
                                                            ) -
                                                                createProjectForm.watch(
                                                                    'endedAt'
                                                                )) /
                                                            60000,

                                                        message:
                                                            'Vesting interval must be less than vesting time',
                                                    },
                                                }
                                            )}
                                            bg="#2C2E31"
                                            borderRadius="10px"
                                            color="textPrimary"
                                            border="none"
                                        />
                                        <NumberInputStepper color="white">
                                            <NumberIncrementStepper border="none" />
                                            <NumberDecrementStepper border="none" />
                                        </NumberInputStepper>
                                    </NumberInput>*/}
                                    {createProjectForm.formState.errors
                                        .vestingInterval && (
                                        <FormErrorMessage>
                                            {
                                                createProjectForm.formState
                                                    .errors.vestingInterval
                                                    .message
                                            }
                                        </FormErrorMessage>
                                    )}
                                </FormControl>
                            </GridItem>
                            <GridItem colSpan={6}>
                                <FormControl
                                    isInvalid={
                                        !!createProjectForm.formState.errors
                                            .thumbnail
                                    }
                                >
                                    <FormLabel
                                        fontSize="14px"
                                        fontWeight="400"
                                        color="textSecondary"
                                    >
                                        Thumbnail
                                    </FormLabel>
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
                                                bg="#2C2E31"
                                                borderRadius="10px"
                                                color="textPrimary"
                                                border="none"
                                            />
                                            {createProjectForm.formState.errors
                                                .thumbnail && (
                                                <FormErrorMessage>
                                                    {
                                                        createProjectForm
                                                            .formState.errors
                                                            .thumbnail.message
                                                    }
                                                </FormErrorMessage>
                                            )}
                                        </Box>
                                        <HStack align="flex-start">
                                            <Button
                                                variant="primary"
                                                fontSize="12px"
                                                onClick={openFileImport}
                                                isLoading={
                                                    uploadFileMutation.isLoading
                                                }
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
                            </GridItem>
                            <GridItem colSpan={6}>
                                <FormControl
                                    isInvalid={
                                        !!createProjectForm.formState.errors
                                            .body
                                    }
                                >
                                    <FormLabel
                                        fontSize="14px"
                                        fontWeight="400"
                                        color="textSecondary"
                                        mb="10px"
                                    >
                                        Description
                                    </FormLabel>
                                    <Input
                                        hidden
                                        {...createProjectForm.register('body', {
                                            required:
                                                'Description is a required field',
                                        })}
                                    />
                                    <Editor
                                        onChange={handleEditorChange}
                                        style={{
                                            padding: 0,
                                        }}
                                        placeholder="Description"
                                    />
                                    {createProjectForm.formState.errors
                                        .body && (
                                        <FormErrorMessage>
                                            {
                                                createProjectForm.formState
                                                    .errors.body.message
                                            }
                                        </FormErrorMessage>
                                    )}
                                </FormControl>
                            </GridItem>
                        </Grid>
                    </ModalBody>
                    <ModalFooter>
                        <HStack justifyContent="end">
                            <Button
                                variant="primary"
                                type="submit"
                                isLoading={createProjectLoading}
                            >
                                Create
                            </Button>
                            <Button onClick={onClose} variant="secondary">
                                Cancel
                            </Button>
                        </HStack>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

function RadioCard(props: any) {
    const { getInputProps, getCheckboxProps } = useRadio(props);

    const input = getInputProps();
    const checkbox = getCheckboxProps();
    console.log(props);

    return (
        <Box as="label">
            <input {...input} />
            <Box
                {...checkbox}
                cursor="pointer"
                borderRadius="12px"
                bg="secondary"
                p="10px 20px"
                color="textSecondary"
                fontSize="16px"
                _checked={{
                    color: 'textPrimary',
                    borderWidth: '1px',
                    borderColor: 'white',
                }}
            >
                {props.children}
            </Box>
        </Box>
    );
}
