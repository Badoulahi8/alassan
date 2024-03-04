import PostForm from "@/components/PostForm";
import { Flex, Box } from "@chakra-ui/react";


export default function Page(){
    return (
        <Box
          p={4}
          mx={{ md: 4 }}
          borderColor="gray.200"
          borderRadius="md"
          mt={"60px"}
        >
          <PostForm />
        </Box>
      );
}