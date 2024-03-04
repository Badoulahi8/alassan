"use client";
export const dynamicParams = true;
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Textarea,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Spinner,
} from "@chakra-ui/react";
import { MdPerson, MdEvent, MdCreate } from "react-icons/md";
import EventCard from "@/components/EventCard";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { AddIcon } from "@chakra-ui/icons";
import ErrorPage from "@/components/ErrorPage";
import PostCard from "@/components/PostCard";
import fetcher from "@/utils/fetcher";
import toBase64 from "@/utils/convert";

const GroupHeader = ({ friends, groupName, groupDescription, slug }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    title: "",
    content: "",
  });
  // const [image, setImage] = useState(null);
  // const [profileImage, setProfileImage] = useState(null);

  // const handleImageChange = (e) => {
  //   const selectedImage = e.target.files[0];
  //   setProfileImage(selectedImage);
  //   setImage(selectedImage);
  // };

  const handleAddMember = async (idRequested, idGroup) => {
    try {
      const response = await fetch("http://localhost:8080/api/addGroupMember", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `groupId=${idGroup}&idRequested=${idRequested}`,
      });

      const data = await response.json();
      console.log(data);
      if (data.status == "Requested") {
        console.log("Successfully requested group");
      } else if (data.status == "Nope") {
        alert("He has already been added wait his response...");
        return;
      } else {
        console.error("Failed to add join group");
        alert("He is already member of the group");
        return;
      }
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const [formData, setFormData] = useState({
    postText: "",
    image: null,
    postVisibility: slug,
  })

  const handleDataChange = (event) => {
    
    const {type, name, value} = event.target
    if (type === "file") {
      const file = event.target.files[0];
      setFormData(prev => ({
          ...prev,
          image: file // Mettre à jour l'état avec le fichier sélectionné
      }));
    }else{
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }

  const handleSubmitPost = async(event) => {
    event.preventDefault()
    let imageName
    if (formData.image){
        imageName = formData.image.name
        formData.image = await toBase64(formData.image)
    }
    formData.imageName = imageName

    fetcher.post("/createpostgroup", formData).then(response =>{
        if(response.status == 200){
            console.log("data sended")
        }else{
            console.log("error", response);
        }
    })
    console.log("formDataPost", formData);
  };

  const handleEventDetailsChange = (e) => {
    const { name, value } = e.target;
    setEventDetails({ ...eventDetails, [name]: value });
  };

  const handleSubmitEvent = async () => {
    console.log("Event details:", eventDetails, slug);

    try {
      const eventDetailsWithSlug = { ...eventDetails, slug };
      const response = await fetch("http://localhost:8080/api/createEvent", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(eventDetailsWithSlug),
      });

      const data = await response.json();
      console.log("Response from server:", data);

      if (data.status != "Created") {
        alert("You are not allowed to access this");
      } else {
        alert("Event " + eventDetails.title + "Created Successfully");
        window.location.reload();
        setIsModalOpen(false);

        setEventDetails("");
        onClose();
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      w="100%"
      mt="60px"
      position="relative"
      overflow="hidden"
      background="linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"
      backgroundSize="cover"
      backgroundPosition="center"
      color="white"
      py="40px"
      px={{ base: "20px", md: "40px" }}
      textAlign="center"
      borderRadius={{ base: "0", md: "10px" }}
      mb={"50px"}
    >
      <Menu position="absolute" right="20px" top="20px" marginLeft={"700px"}>
        <MenuButton
          as={Button}
          rightIcon={<MdPerson />}
          mb={20}
          variant="outline"
          color="white"
        >
          Add Member
        </MenuButton>
        <MenuList>
          {friends &&
            friends.followers &&
            friends.followers.map((friend) => (
              <MenuItem key={friend.Use.Id} justifyContent="space-between">
                <Box>{friend.Use.FirstName}</Box>
                <Box>
                  <FaPlus
                    style={{ cursor: "pointer" }}
                    onClick={() => handleAddMember(friend.Use.Id, slug)}
                  />
                </Box>
              </MenuItem>
            ))}
        </MenuList>
      </Menu>
      <Heading as="h1" size="2xl" mb="2">
        {groupName}
      </Heading>
      <Heading as="h2" size="md" mb="4">
        {groupDescription}
      </Heading>
      <Flex justify="center" flexWrap="wrap" maxW="600px" m="0 auto">
        <Button
          leftIcon={<MdEvent />}
          onClick={() => setIsModalOpen(true)}
          colorScheme="blue"
          mr={{ base: "0", md: "4" }}
          mb={{ base: "4", md: "0" }}
        >
          Create Event
        </Button>
        <Button
          leftIcon={<MdCreate />}
          onClick={() => setIsPostModalOpen(true)}
          colorScheme="green"
        >
          Create Post
        </Button>
      </Flex>

      {/* Modal pour la création de post */}
      <Modal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              type="hidden"
              name="postVisibility"
              value={formData.postVisibility}
              onChange={handleDataChange}
              // mb={2}
            />
            <Textarea
              placeholder="Content"
              name="postText"
              value={formData.postText}
              onChange={handleDataChange}
              mb={2}
            />

            <FormControl id="profile">
              <FormLabel>Add an image in your post </FormLabel>
              <Flex align="center">
                <Input
                  type="file"
                  accept="image/*"
                  name="image"
                  id="image-upload"
                  onChange={handleDataChange}
                  display="none"
                />
                <label htmlFor="image-upload">
                  <Button
                    as="span"
                    colorScheme="teal"
                    rounded="full"
                    cursor="pointer"
                    mr="2"
                    p="0"
                    _hover={{ bg: "teal.500" }}
                  >
                    <AddIcon boxSize={4} />
                  </Button>
                </label>
                {formData.image && <Text ml="2">{formData.image.name}</Text>}
              </Flex>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={"10px"} onClick={() => setIsPostModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleSubmitPost}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Modal pour la création d'événement */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Title"
              name="title"
              value={eventDetails.title}
              onChange={handleEventDetailsChange}
              mb={2}
            />
            <Textarea
              placeholder="Description"
              name="description"
              value={eventDetails.description}
              onChange={handleEventDetailsChange}
              mb={2}
            />
            <Input
              type="datetime-local"
              name="dateTime"
              value={eventDetails.dateTime}
              onChange={handleEventDetailsChange}
              mb={2}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" onClick={handleSubmitEvent}>
              Create
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

const PostContainer = ({ groupPosts }) => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      w="100%"
      mt="60px"
      overflowX="auto"
    >
      <Box mt={8} w="100%">
        <Heading as="h2" size="lg" mb={4}>
          Group Posts
        </Heading>
        {groupPosts.map((post) => (
          <Box key={post.id} borderWidth="1px" borderRadius="lg" p={4} mb={4}>
            <Heading as="h3" size="md" mb={2}>
              {post.title}
            </Heading>
            <Box color="gray.500">{post.content}</Box>
          </Box>
        ))}
      </Box>
    </Flex>
  );
};

const GroupDetail = ({ params }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupEvents, setGroupEvents] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postGroup, setPostGroup] = useState([]) //ajout
  const [error, setError] = useState("");


  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const groupId = params.slug;
        const response = await fetch(
          `http://localhost:8080/api/groupsdata/${groupId}`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();

        console.log("group datas ", data);
        if (data.status == "nope" || !data) {
          setLoading(false);
        }
        setGroupName(data.datas.name);
        setGroupDescription(data.datas.description);
        setGroupEvents(data.events);
        setFriends(data.friends);
        setLoading(false);
        setPostGroup(data.datas.PostGroup)
      } catch (error) {
        setError(error.message);
      }
    };

    fetchGroupData();
  }, [params.slug]);

  if (error) {
    return <ErrorPage message={error} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {loading ? (
        <Spinner
          size="xl"
          color="red"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ) : (
        <>
          <GroupHeader
            groupName={groupName}
            groupDescription={groupDescription}
            slug={params.slug}
            friends={friends}
          />
          <Tabs isFitted variant="enclosed">
            <TabList mb="1em">
              <Tab>Posts</Tab>
              <Tab>Events</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {postGroup && (postGroup.map(post =>(
                    <PostCard post={post} key={post.Id}/>
                  ))
                )}
              </TabPanel>
              <TabPanel>
                <Flex flexWrap="wrap" justifyContent="center">
                  {groupEvents &&
                    groupEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        title={event.title}
                        description={event.description}
                        date={event.dateTime}
                      />
                    ))}
                </Flex>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default GroupDetail;
