import LeftComponent from "@/components/LeftComponent";
import React from "react";
import { Flex, Box } from "@chakra-ui/react";

const Group = () => {
  return (
    <div className="min-h-screen flex justify-center">
      {/* <Header /> */}
      {/* <LeftComponent/> */}
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "center", md: "flex-start" }}
        justify="center"
        w="100%"
        flex="1"
        overflowY="auto"
        mt="30px"
      >
        <Box
          w={{ base: "100%", md: "60%" }}
          p={4}
          mx={{ md: 4 }}
          borderColor="gray.200"
          borderRadius="md"
          ml={{ md: 250 }}
        >
          <LeftComponent/>
        </Box>
      </Flex>
    </div>
  );
};

export default Group;
