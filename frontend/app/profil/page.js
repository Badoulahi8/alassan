import React from "react";
import ProfilPage from "../../components/ProfilPage";
import { Flex, Box } from "@chakra-ui/react";


const profil = () => {
  const userId = "3"
  return (
    <Box
      w={{ base: "100%", md: "60%" }}
      p={4}
      mx={{ md: 4 }}
      borderColor="gray.200"
      borderRadius="md"
      ml={{ md: 250 }}
      mt={"70px"}
      backgroundColor={"rgb(16,16,16)"}
    >
      <ProfilPage userId={userId} />
    </Box>
  );
};

export default profil;
