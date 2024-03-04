import React, { useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    FormControl,
    FormLabel,
    Input,
    Lorem
} from '@chakra-ui/react'

function InitialFocus() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <div className="w-full flex justify-center p-4">
                <Button onClick={onOpen} className="w-full rounded bg-gray-50 text-center mt-2">
                    Edit Profile
                </Button>
            </div>

            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-75">
                    <div className="max-w-md w-full">
                        <Modal isOpen={isOpen} onClose={onClose} isCentered>
                            <ModalOverlay />
                            <div className="bg-white p-8 rounded-lg shadow-md">
                                <ModalContent className="border top-1/3 left-2 right-1/2 -translate-y-1/2 -translate-x-1/2">
                                    <ModalHeader>Create your account</ModalHeader>
                                    <ModalCloseButton onClick={onClose} />
                                    <ModalBody pb={6}>
                                        <FormControl>
                                            <FormLabel>First name</FormLabel>
                                            <Input placeholder='First name' />
                                        </FormControl>
                                        <FormControl mt={4}>
                                            <FormLabel>Last name</FormLabel>
                                            <Input placeholder='Last name' />
                                        </FormControl>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button colorScheme='blue' mr={3}>
                                            Save
                                        </Button>
                                        <Button onClick={onClose}>Cancel</Button>
                                    </ModalFooter>
                                </ModalContent>
                            </div>
                        </Modal>
                    </div>
                </div>
            )}
        </>
    );
}

export default InitialFocus