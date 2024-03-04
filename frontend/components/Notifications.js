"use client";
import React from "react";
import { useState, useEffect } from "react";

import {
  Box,
  Flex,
  Divider,
  Image,
  Text,
  Button,
  ButtonGroup,
} from "@chakra-ui/react";

const FollowRequestNotification = ({ user }) => (
  <Flex
    align="center"
    justify="center"
    p={2}
    borderBottom="1px solid"
    borderColor="gray.300"
  >
    <Image
      src={user.image}
      alt={user.name}
      borderRadius="full"
      boxSize="30px"
    />
    <Box ml={2} mr={2}>
      <Text fontSize="sm">{user.name} sent you a follow request.</Text>
    </Box>
    <Divider orientation="vertical" h="20px" />
    <ButtonGroup ml={2} mt={1}>
      <Button
        variant="outline"
        _hover={{ bg: "purple.500", color: "white" }}
        size="sm"
      >
        Accept
      </Button>
      <Button
        variant="outline"
        _hover={{ bg: "purple.500", color: "white" }}
        size="sm"
      >
        Decline
      </Button>
    </ButtonGroup>
  </Flex>
);

const GroupInvitationNotification = ({ group }) => (
  <Flex
    align="center"
    justify="center"
    p={2}
    borderBottom="1px solid"
    borderColor="gray.300"
  >
    <Image
      src={group.image}
      alt={group.name}
      borderRadius="full"
      boxSize="30px"
    />
    <Box ml={2} mr={2}>
      <Text fontSize="sm">
        You received an invitation to join the group {group.name}.
      </Text>
    </Box>
    <Divider orientation="vertical" h="20px" />
    <ButtonGroup ml={2} mt={1}>
      <Button
        variant="outline"
        _hover={{ bg: "purple.500", color: "white" }}
        size="sm"
      >
        Accept
      </Button>
      <Button
        variant="outline"
        _hover={{ bg: "purple.500", color: "white" }}
        size="sm"
      >
        Decline
      </Button>
    </ButtonGroup>
  </Flex>
);

const EventCreatedNotification = ({ user, event }) => (
  <Flex
    align="center"
    justify="center"
    p={2}
    borderBottom="1px solid"
    borderColor="gray.300"
  >
    <Image
      src={user.image}
      alt={user.name}
      borderRadius="full"
      boxSize="30px"
    />
    <Box ml={2} mr={2}>
      <Text fontSize="sm">
        {user.name} just created an event: {event.title}.
      </Text>
    </Box>
    <Divider orientation="vertical" h="20px" />
    <ButtonGroup ml={2} mt={1}>
      <Button
        variant="outline"
        _hover={{ bg: "purple.500", color: "white" }}
        size="sm"
      >
        View Event
      </Button>
    </ButtonGroup>
  </Flex>
);

const Notification = () => {
  const [joinGroupData, setJoinGroupData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/joingroup", {
          credentials: "include",
        });
        const data = await response.json();
        console.log(data);
        setJoinGroupData(data);
      } catch (error) {
        console.error("Error fetching join group data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box
      maxWidth="80%"
      maxH="400px"
      overflowY="auto"
      position="absolute"
      top="10%"
      left="50%"
      transform="translate(-50%, 50%)"
      mt={"100px"}
    >
      {joinGroupData &&
        joinGroupData.map((notification, index) => (
          <GroupJoinRequest
            key={index}
            user={notification.user}
            group={notification.groupName}
          />
        ))}
    </Box>
  );
};

const GroupJoinRequest = ({ user, group }) => {
  const handleResponse = async (response) => {
    try {
      const res = await fetch("http://localhost:8080/api/joinGroupResp", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: user,
          group: group,
          response: response,
        }),
      });
      const data = await res.json();
      if(data.status == "Added"){
        console.log("Added");
      }else if(data.status == "Declined"){
        console.log("Declined");
      }else{
        alert("You are members of this group")
      }
    } catch (error) {
      console.error("Error sending response:", error);
    }
  };

  return (
    <Flex
      align="center"
      justify="center"
      p={2}
      borderBottom="1px solid"
      borderColor="gray.300"
    >
      <Box ml={2} mr={2}>
        <Text fontSize="sm">
          {user} would like to join {group} group
        </Text>
      </Box>
      <Divider orientation="vertical" h="20px" />
      <ButtonGroup ml={2} mt={1}>
        <Button
          variant="outline"
          _hover={{ bg: "green.500", color: "white" }}
          size="sm"
          onClick={() => handleResponse("accept")}
        >
          Accept
        </Button>
        <Button
          variant="outline"
          _hover={{ bg: "red.500", color: "white" }}
          size="sm"
          onClick={() => handleResponse("decline")}
        >
          Decline
        </Button>
      </ButtonGroup>
    </Flex>
  );
};


export default Notification;
