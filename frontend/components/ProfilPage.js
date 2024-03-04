'use client'
import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import {useDataHandler, FetchData, handleFollow} from "./DataHandlerProfil";
import PostCard from "./PostCard";
import ErrorPage from "./ErrorPage";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Textarea,
  Box,
  Image,
  Flex,
  Heading,
  Text,
  ButtonGroup,
  Radio,
  Lorem
} from '@chakra-ui/react'

// Fonction pour afficher les informations de profil
const ProfilInfo = ({ userInfo, isFollowing }) => {
  const { Id, FirstName, LastName, Email, NickName, Avatar, Profil } = userInfo;
  const connectedUser = localStorage.getItem('id')
  return (
    <Flex
      flexDirection={{ base: "column", md: "row" }}
      justifyContent="space-between"
      //alignItems={{ base: "center", md: "flex-start" }}
      alignItems="center"
      marginBottom={3}
      padding={4}
    >
      <Box>
        <Heading as="h2" fontSize="2xl" fontWeight="semibold" color="gray.200">{FirstName} {LastName}</Heading>
        {Profil === 'public' || Id == connectedUser || isFollowing ? (
            <>
              <Text fontWeight="semibold" color="gray.200">{Email}</Text>
              <Text fontWeight="semibold" color="gray.200">{NickName}</Text>
            </>
          ) : null}
      </Box>
      <Box>
        <Box
          width={{ base: "12", md: "24" }}
          height={{ base: "12", md: "24" }}
          borderRadius="full"
          bg="gray.200"
          overflow="hidden"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Image
            src={`../images/users/${Avatar !== `` ? Avatar : `default.png`}`}
            alt="Image de profil"
            width="full"
            height="full"
            objectFit="cover"
          />
        </Box>
      </Box>
    </Flex>
  );
};

const fetchData = async (userId,status,followId) => {
  const url = `http://localhost:8080/api/data/follow?id=${userId}&status=${status}&followId=${followId}`;
  try {
      const response = await fetch(url,{
        credentials:"include"
      });
      if (!response.ok) {
          throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      console.log('Data:', data);
  } catch (error) {
      console.error('Error fetching data:', error);
  }
};

const UsersFollow = ({ user }) => {
  const initialIsFollowing = user.IsFollowing;
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const router = useRouter()

  const handleFollow = async () => {
    if (user.Status == '1') {
      user.Status = '0';
    } else {
      user.Status = '1';
    }

    const url = `http://localhost:8080/api/data/follow?id=${user.Use.id}&status=${user.Status}&followId=${user.FollowId}`;
    await FetchData(url);
    setIsFollowing(!isFollowing);
  };

  const handleClik = async ()=>{
    var status = 1
    if (isFollowing) {
      status = 0
    }else if (user.Profil=='private') {
      status = 0
    }
    setIsFollowing(!isFollowing)
    const url = `http://localhost:8080/api/data/follow?id=${user.Use.Id}&status=${status}&profil=${user.Profil}`;
    await FetchData(url);
  }

  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleProfileClick = () => {
    router.push(`/profil?id=${user.Use.Id}`);
  };

  return (
    <Flex align="center" justify="space-between" p={2} borderBottom="1px solid" borderColor="gray.300">
        <Flex onClick={handleProfileClick} align="center" onClose={onClose}>
          <Image src={user.Use.avatar} alt={user.Use.FirstName} borderRadius="full" boxSize="30px" />
          <Box ml={2} mr={2}>
            <Text fontSize="sm">{user.Use.FirstName} {user.Use.LastName}</Text>
          </Box>
        </Flex>
      {!isFollowing ? (
        <Button
          variant="outline"
          _hover={{ bg: "purple.500", color: "white" }}
          size="sm"
          onClick={handleClik}
        >
          Follow
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => handleClik}>
          Following
        </Button>
      )}
    </Flex>
  );
};

// Fonction pour afficher le contenu principal
const ProfilContent = ({ userData }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef(null);
  const handleOpenModal = () => {
    onOpen();
  };

  let followersButton = null;
  var nbreFollowers;
  if (userData.followers) {
    nbreFollowers = userData.followers.length;
  }
  if (nbreFollowers > 0) {
    followersButton = (
      <Button justifyContent={"start"} pl={4} mt={3} ref={btnRef} onClick={handleOpenModal} colorScheme='teal' variant='link'>
        {nbreFollowers} Followers
      </Button>
    );
  }
  const connectedUser = localStorage.getItem('id')

  return (
    <Box width="full" display="flex" justifyContent="center" padding={4}>
      <Flex direction="column" width="full" color="gray.200">
        {followersButton}
        <Modal onClose={onClose} finalFocusRef={btnRef} isOpen={isOpen} scrollBehavior={'inside'}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Followers</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Tabs isFitted variant="enclosed">
                <TabList mb="1em" style={{ position: 'sticky', top: -10, background: 'dark', zIndex: 1 }}>
                  <Tab>Followers</Tab>
                  <Tab>Following</Tab>
                </TabList>
                <TabPanels>
                <TabPanel>
                  {userData && userData.followers && userData.followers.map((follower, index) => (
                    follower.Use.Id != connectedUser ? (
                      <UsersFollow key={index} user={follower} />
                    ) : null
                  ))}
                </TabPanel>
                  <TabPanel>
                    {/* Contenu des utilisateurs suivis */}
                    {userData && userData.following && userData.following.map((followedUser, index) => (
                      followedUser.Use.Id != connectedUser ? (
                        <UsersFollow key={index} user={followedUser} />
                      ) : null
                    ))}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
            <ModalFooter>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex>
    </Box>
  );
};


function Table({ data }) {
  const biographie = data.User.AboutMe;
  const Posts = data.Posts;
  const variants = ["solid", "underlined", "bordered", "light"];
  const [one, setOne] = useState('one');
  console.log("Qlq cho ",Posts);
  return (
    <Box className="w-full flex flex-wrap gap-4 text-gray-200">
      <Tabs className="w-full">
        <TabList className="w-full">
          <Tab className="w-1/3">Posts</Tab>
          <Tab className="w-1/3">Photos</Tab>
          <Tab className="w-1/3">A propos de moi</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
          {Posts && Posts.map((post, index) => (
              <PostCard key={index}
                post={post}
              />
            ))}
          </TabPanel>
          <TabPanel>
          <Flex className="w-1/3 h-auto max-h-60 overflow-y-auto">
              <Box className="h-30">
                <Image
                  src="https://bit.ly/dan-abramov"
                  alt="Dan Abramov"
                  className="object-cover w-full h-full"
                />
              </Box>
            </Flex>
            
          </TabPanel>
          <TabPanel>
            <p>{biographie}</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

const ModalEditProfil = ({data}) => {
  var profil=false;
  const { Id, FirstName, LastName, AboutMe, Nickname, Profil } = data.User;
  if (Profil=='public') {
    profil=false
  }
  const isfollowing = data.IsFollowing
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState(FirstName +" "+ LastName);
  const [aboutMe, setAboutMe] = useState(AboutMe);
  const [checked, setChecked] = useState(profil);
  const [isPrivateProfile, setIsPrivateProfile] = useState(false); // Nouveau state pour la valeur du commutateur
  const connectedUser = localStorage.getItem('id')

  const onSubmit = async (event) => {
    event.preventDefault();
    const url = `http://localhost:8080/api/data/updateProfil?id=${Id}&aboutMe=${aboutMe}&profil=${isPrivateProfile}`;
    await FetchData(url)
    onClose();
    setName(FirstName + " "+ LastName);
    setAboutMe(AboutMe);
    if (Profil=='priate') {
      setChecked(true);
    }
  };

  const initialIsFollowing = isfollowing
  console.log('isfollowinng ', initialIsFollowing);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const handleClik = async ()=>{
    var status = 1
    if (isFollowing) {
      setIsFollowing(!isFollowing)
      status = 0
    }else if (Profil=='private') {
      status = 0
    }
    const url = `http://localhost:8080/api/data/follow?id=${Id}&status=${status}&profil=${Profil}`;
    await FetchData(url);
  }
  return (
    <>
    {Id == connectedUser ? (
        <div className="w-full flex justify-center p-4">
          <Button onClick={onOpen} className="w-full rounded bg-gray-50 text-center mt-2">
            Edit Profile
          </Button>
        </div>
      ) : (
        isFollowing ? (
          <div className="w-full flex p-4">
            <Button onClick={handleClik} className="rounded bg-gray-50 text-center mt-2">
              Following
            </Button>
          </div>
        ) : (
          <div className="w-full flex p-4">
            <Button onClick={handleClik} className="rounded bg-gray-50 text-center mt-2">
              Follow
            </Button>
          </div>
        )
      )}

      
      <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={undefined} finalFocusRef={undefined}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={onSubmit}>
            <ModalHeader>Edit Profile</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  placeholder="First name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>AboutMe</FormLabel>
                <Textarea
                  name="biographie"
                  placeholder="AboutMe"
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                />
              </FormControl>
              <FormControl mt={4} display='flex' alignItems='center' justifyContent='space-between'>
                <FormLabel htmlFor='profil-prive' mb='0'>
                  Profil privé
                </FormLabel>
                <Switch
                  id='profil-prive'
                  checked={checked}
                  onChange={(e) => {
                    setChecked(!checked);
                    setIsPrivateProfile(e.target.checked); // Mettre à jour isPrivateProfile avec la valeur du commutateur
                  }}
                />
                <input type="hidden" name="isPrivateProfile" value={isPrivateProfile ? 'private' : 'public'} /> {/* Champ caché pour la valeur du commutateur */}
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button type="submit" colorScheme="blue" mr={3}>
                Save
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

// Fonction principale pour afficher la page de profil
const ProfilPage = () => {
  const [data, setData] = useState("");
  const [error, setError] = useState(null);
  const params= useSearchParams()
  const id = params.get('id')
  // console.log("voici notre object",id);
  useEffect(() => {
    if (id) {
      const requestOptions = {
        credentials: "include",
      };
      
      fetch(`http://localhost:8080/profil?id=${id}`, requestOptions)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error during the get request.");
          }
          return response.json();
        })
        .then((responseData) => {
          setData(responseData);
        })
        .catch((error) => {
          setError(error.message);
        });
    }
  }, [id]);

  if (error) {
    // Display error message or navigate to an error page
    return <ErrorPage message={error} />;
  }

  if(!data){
    return <p>loading...</p>
  }

  // const user = data.User
  console.log(data);
  const connectedUser = localStorage.getItem('id')

  return (
    <Flex
      minH="85vh"
      w="full"
      justify="center"
    >
      <Box
        bg="rgb(16,16,16)"
        w={{ base: "full", sm: "11/12", lg: "3/4", xl: "1/2" }}
        p={4}
        rounded="md"
        shadow="md"
        h="auto"
        flex={{ sm: 1 }}
        flexDir="column"
        justify={{ sm: "space-between" }}
        overflowY={"auto"}
      >
        <Box>
        {data.User.Profil === 'public' || id == connectedUser || data.IsFollowing ? (
            <>
              <ProfilInfo userInfo={data.User} isFollowing={data.IsFollowing }/>
              <ProfilContent userData={data} />
              <ModalEditProfil data={data} />
              <Table data={data} />
            </>
          ) : (
            <>
              <ProfilInfo userInfo={data.User} />
              <ProfilContent userData={data} />
              <ModalEditProfil data={data} />
            </>
          )}
        </Box>
      </Box>
    </Flex>
  );
};

export default ProfilPage