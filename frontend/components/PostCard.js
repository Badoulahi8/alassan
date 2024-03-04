'use client'
import { Box, Flex, Image, Text, IconButton, Icon } from "@chakra-ui/react";
import { AiOutlineHeart, AiOutlineComment, AiFillHeart } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchWithBody } from "@/ComponentDatas/fetchDatas";


const PostCard = ({ post }) => {
  
  const router = useRouter()
  const [isLikePost, setIsLikePost] = useState(post.IsLike);
  const [numLikes, setNumLikes] = useState(post.NumLikes);

  const updateLike = async () => {
    var newIsLikePost;
    var newNumLikes;
    if (isLikePost) {
      newIsLikePost = false
      newNumLikes = numLikes - 1
    } else {
      newIsLikePost = true
      newNumLikes = numLikes + 1
    }
    setIsLikePost(newIsLikePost);
    setNumLikes(newNumLikes);

    const body = JSON.stringify({
      postId: post.Id,
      commentId: 0,
    })
    try {
      const datas = await fetchWithBody("action", body);
      if (datas.success) {
        console.log("SUCCESS: ", datas.message);
      } else {
        console.log("FAILED: ", datas.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={4} mb={4}>
      <Flex alignItems="center" mb={2}>
        <Box mr={2}>
          <Image
            src={`../images/users/${post.UserAvatar !== `` ? post.UserAvatar : `default.png`}`}
            alt={`user_community_image`}
            borderRadius="full"
            boxSize="50px"
          />
        </Box>
        <Text fontWeight="bold">{post.NickName}</Text>
      </Flex>
      <Text mt={2} textAlign="justify">
        {post.postText}
      </Text>
      {
        post.imageName !== `` ? (
          <Flex justifyContent={"center"} mt={2}>
            <Image
              src={`../images/posts/${post.imageName}`}
              boxSize="100%"
              height="auto"
            />
          </Flex>
        ) : (
          <></>
        )
      }
      <Flex alignItems="center" mt={4}>
        <IconButton
          aria-label="Like"
          icon={isLikePost ? (<AiFillHeart />) : (<AiOutlineHeart />)}
          colorScheme={isLikePost ? `red` : `gray`}
          variant="ghost"
          className={isLikePost ? `unlike` : `like`}
          size="lg"
          mr={2}
          onClick={updateLike}
        />
        <Text fontSize="sm" color="gray.600">
          {numLikes}
        </Text>
        <IconButton
          aria-label="Comment"
          icon={<AiOutlineComment />}
          colorScheme="gray"
          variant="ghost"
          size="lg"
          ml={4}
          mr={2}
          onClick={() => router.push(`/posts/${post.Id}`)}
        />
        <Text fontSize="sm" color="gray.600">
          {post.NumComments}
        </Text>
      </Flex>
    </Box>
  );
};
export default PostCard;