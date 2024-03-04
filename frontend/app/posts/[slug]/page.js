"use client";
import { fetchDatas } from "@/ComponentDatas/fetchDatas";
import CommentPage from "@/components/CommentPage";
import PostPage from "@/components/PostPage";
import { Box, Flex } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";

export default function Post({ params }) {
  const [post, setPost] = useState(null)
  const [user, setUser] = useState(null)
  const [comments, setComments] = useState([])
  useEffect(() => {
    const postId = params.slug;
    const onePost = async () => {
      try {
        const postData = await fetchDatas(`post/${postId}`);
        setComments(postData.Post.Comments);
        setPost(postData.Post);
        setUser(postData.User);
      } catch (error) {
        console.error(error);
        setPost({ error: true }); // Mettre à jour l'état avec une indication d'erreur
      }
    };
    onePost();
  }, [params.slug]);
  // Si post est null, retourner un indicateur de chargement
  if (post === null) {
    return <div>Chargement en cours...</div>;
  }

  // Si une erreur est survenue lors du chargement du post
  if (post.error) {
    return <div>Une erreur est survenue lors du chargement du post.</div>;
  }
  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      align={{ base: "center", md: "flex-start" }}
      justify="center"
      w="100%"
      flex="1"
      overflowY="auto"
      mt="60px"
    >
      <Box
        w={{ base: "100%", md: "60%" }}
        p={4}
        mx={{ md: 4 }}
        borderRadius="md"
        ml={{ md: 250 }}
      >
        {post ? (
          <PostPage
            post={post}
            user={user}
          />) : (
          <></>
        )
        }
        {comments && comments.map((comment, index) => (
          <CommentPage key={index}
            comment={comment}
          />
        ))}
      </Box>
      <Box
        w={{ base: "100%", md: "25%" }}
        p={4}
        ml={{ md: 4 }}
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
      >
        Contenu de la colonne droite
      </Box>
    </Flex>
  );
}