'use client'
import { Flex, Text } from "@chakra-ui/react";

const ErrorPage = ({ message }) => {
  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="gray.100"
      direction="column"
    >
      <Text color="red.500" fontSize="2xl" mb={4}>
        Error
      </Text>
      <Text color="red.500">{message}</Text>
    </Flex>
  );
};

export default ErrorPage;