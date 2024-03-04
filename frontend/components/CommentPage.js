'use client'
import { Box, Flex, Image, Text, IconButton, Icon } from "@chakra-ui/react";
import { AiOutlineHeart, AiOutlineComment } from "react-icons/ai";

const CommentPage = ({ comment }) => {

  return (
    <Box borderWidth="1px" mb={2} backgroundColor={"rgb(91, 99, 126)"} borderRadius="lg" overflow="hidden" pt={4} pl={4} pr={4} boxSize={"80%"}>
      <Flex alignItems="center" >
        <Box mr={2}>
          <Image
          src={`../images/users/${comment.AvatarUser !== `` ? comment.AvatarUser : `default.png`}`}
            alt={`user_community_image`}
            borderRadius="full"
            boxSize="20px"
          />
        </Box>
        <Text fontWeight="bold" fontSize={"10px"}>{comment.NickName}</Text>
      </Flex>
      <Text textAlign="justify" ml={"20px"} fontSize={12}>
        {comment.commentText}
      </Text>
      <Flex ml={"20px"} alignItems="center" justifyContent={"right"}>
      <IconButton
      color={"red"}
          aria-label="Like"
          icon={<AiOutlineHeart />}
          colorScheme="gray"
          variant="ghost"
          size="lg"
          mr={2}
        />
        <Text fontSize={10} fontWeight="bold" color="gray.300">
          10
        </Text>
      </Flex>
    </Box>
  );
};
export default CommentPage;