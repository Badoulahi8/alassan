import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Stack,
  Button,
  Image,
  AspectRatio,
} from "@chakra-ui/react";

const EventCard = ({ title, description, date }) => {
  
  function parseISOString(dateString) {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return null; 
    } else {
      return date; 
    }
  }
  const dateTime = parseISOString(date);

  const formatDate = (dateTime) => {
    if (!dateTime) return ""; 

    const options = { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" };
    return dateTime.toLocaleDateString(undefined, options);
  };

  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      m="2"
    >
      <Flex direction="column">
        <AspectRatio ratio={16 / 9}>
          <Image
            src="https://images.unsplash.com/photo-1535276811207-1bcae679870e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Event"
            objectFit="cover"
          />
        </AspectRatio>
        <Flex p="6" direction="column" alignItems="center">
          {/* Titre de l'événement */}
          <Heading as="h4" size="md" mt="1" textAlign="center">
            {title}
          </Heading>
          {/* Description de l'événement */}
          <Text
            mt={2}
            color="gray.600"
            fontSize="sm"
            lineHeight="normal"
            textAlign="center"
          >
            {description}
          </Text>
        </Flex>

        {/* Footer de la carte */}
        <Box borderTopWidth="1px" p="4">
          <Stack direction="row" spacing={6} justify="flex-end">
            <Text
              mt={2}
              color="gray.600"
              fontSize="sm"
              lineHeight="normal"
              textAlign="center"
            >
              {formatDate(dateTime)}
            </Text>
            {/* Bouton "Going" */}
            <Button size="sm" colorScheme="green">
              Going
            </Button>
            {/* Bouton "Not Going" */}
            <Button size="sm" colorScheme="red">
              Not Going
            </Button>
          </Stack>
        </Box>
      </Flex>
    </Box>
  );
};


export default EventCard;
