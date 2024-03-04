"use client";
import React, {useEffect, useState} from "react";
import { Flex, Box } from "@chakra-ui/react";
import PostCard from "./PostCard";
import { fetchDatas } from "@/ComponentDatas/fetchDatas";
import Chat from "./Chat";
import NavBar from "./NavBar"; // Importez votre composant NavBar

const Home = () => {
  const [posts, setPosts] = useState([])
  const [showChat, setShowChat] = useState(false);
  const toggleChat = () => {
    setShowChat(!showChat);
  };
  const url = "posts"

  useEffect(() => {
    const allPosts = async () => {
      try {
        const postsData = await fetchDatas(url);
        setPosts(postsData);
      } catch (error) {
        console.error(error);
      }
    };
    allPosts();
  }, []);
  return (
    <div className="min-h-screen flex justify-center">
      <NavBar toggleChat={toggleChat} /> 
      <Content posts={posts} showChat={showChat} flex="1" />
      <Footer />
    </div>
  );
};
export const Content = ({ showChat, posts }) => {
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
        {posts && posts.map((post, index) => (
          <PostCard key={index} post={post} />
        ))}
      </Box>
      {showChat && (
        <Box
          w={{ base: "100%", md: "25%" }}
          p={4}
          ml={{ md: 4 }}
          borderColor="gray.200"
          borderRadius="md"
        >
          <Chat />
        </Box>
      )}
    </Flex>
  );
};


export const Footer = () => {
  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      w="100%"
      p={4}
      bg="gray.600"
    >
      Pied de page de votre application
    </Box>
  );
};

export default Home;
