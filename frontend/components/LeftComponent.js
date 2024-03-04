"use client";
import React, { useState, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Button,
  Text,
  Link,
  Flex,
  Box,
  Avatar,
  Skeleton,
  Stack
} from "@chakra-ui/react";
import { MdGroup } from "react-icons/md";

function AddGroupPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [groups, setGroups] = useState([]);

  const fetchGroups = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/groups");
      const data = await response.json();
      const groupNames = data.map((group) => group.name);

      setGroups(groupNames);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  const handleSubmit = async () => {
    console.log("Submitting data:", groupName, description);

    try {
      const formData = new FormData();
      formData.append("groupName", groupName);
      formData.append("description", description);

      const response = await fetch("http://localhost:8080/api/groups", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      console.log("Response from server:", data);

      setGroups([...groups, data.newGroup]);

      setGroupName("");
      setDescription("");
      onClose();

      alert("Group " + groupName + "Created Success");
      window.location.reload();
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  return (
    <>
      <Text>
        Or create it{" "}
        <Link
          color="blue.400"
          _hover={{ color: "purple.500" }}
          onClick={onOpen}
        >
          here
        </Link>
      </Text>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Group Name</FormLabel>
              <Input
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleSubmit}>
              Confirm
            </Button>
            <Button colorScheme="red" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default function LeftComponent() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleJoinGroup = async (groupId, groupCreator) => {
    console.log(`Joined group with id ${groupId}, creator ${groupCreator}`);

    try {
      const response = await fetch("http://localhost:8080/api/joingroup", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `groupId=${groupId}&groupCreator=${groupCreator}`,
      });

      const data = await response.json();
      console.log(data);
      if (data.status == "Requested") {
        console.log("Successfully requested group");
      } else {
        console.error("Failed to request join group");
        alert("You are a member of the group");
      }
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/groups");
      const data = await response.json();
      setGroups(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const addGroup = (newGroup) => {
    setGroups([...groups, newGroup]);
  };

  return (
    <Box
      w={{ base: "100%", md: "60%" }}
      h={{ base: "100%", md: "60%" }}
      p={4}
      mr={{ md: 4 }}
      borderWidth="1px"
      borderRadius="md"
      mt={{ base: 10 }}
    >
      <h2>Join communities</h2>
      <Box mb="1rem" />
      {/* Utilisation du Spinner pour afficher le chargement */}
      {loading ? (
        <Stack>
          <Skeleton height="40px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
        </Stack>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {groups && groups.length > 0 ? (
            groups.map((group) => (
              <li
                key={group.id}
                style={{
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid",
                  borderColor: "gray.200",
                  paddingBottom: "8px",
                  justifyContent: "space-between",
                }}
              >
                <Flex flexDirection={"row"}>
                  <Avatar icon={<MdGroup />} bg="black" size="sm" mr={2} />
                  <Link
                    href={`/groups/${group.id}`}
                    color="blue.400"
                    _hover={{ color: "purple.500" }}
                  >
                    <Text noOfLines={1}>{group.name}</Text>
                  </Link>
                </Flex>
                <Button
                  size="sm"
                  color="white"
                  onClick={() => handleJoinGroup(group.id, group.group_creator)}
                >
                  Join
                </Button>
              </li>
            ))
          ) : (
            <li>No groups available</li>
          )}
          <AddGroupPopup addGroup={addGroup} />
        </ul>
      )}
    </Box>
  );
}
