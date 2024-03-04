"use client";
import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  Text,
  Flex,
  Step,
  StepIndicator,
  StepStatus,
  StepTitle,
  StepDescription,
  StepSeparator,
  Stepper,
  StepIcon,
  StepNumber,
  Link,
  HStack,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, AddIcon } from "@chakra-ui/icons";
import { useRouter } from 'next/navigation'

const SignUpStepper = () => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [username, setUsername] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);
  const router = useRouter()

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setProfileImage(selectedImage);
    setImage(selectedImage);
  };

  const steps = [
    { title: "", description: "Step 1" },
    { title: "", description: "Step 2" },
    { title: "", description: "Step 3" },
  ];

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification des champs obligatoires
    if (!email || !password || !firstName || !lastName || !dob) {
      alert("Please fill in all required fields");
      return;
    }

    // Vérification de l'adresse e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("dob", dob);
    formData.append("profileImage", profileImage);
    formData.append("bio", bio);
    formData.append("username", username);

    // console.log(formData);
    const response = await fetch("http://localhost:8080/api/register", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    console.log(data);

    if (data.status != "Created") {
      alert("Username or email already taken | Go back and change it");
      return
    }
    alert("Registration successfully made! Please log in");
    router.push("/login")
  };

  return (
    <Box
      maxW="500px"
      mx="auto"
      mt="200px"
      p="20px"
      borderWidth="1px"
      borderRadius="lg"
    >
      <Heading as="h4" size="md" mb={8}>
        Please complete these steps to register
      </Heading>
      <VStack spacing={4} align="stretch">
        <Stepper index={step}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>
              <Box flexShrink="0">
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Box>
              <StepSeparator />
            </Step>
          ))}
        </Stepper>
        {step === 0 && (
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormLabel>Password</FormLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              mb={8}
            />
            <Text>
              Already have an account?{" "}
              <Link href="/login" color="blue.500">
                Login here
              </Link>
            </Text>
          </FormControl>
        )}
        {step === 1 && (
          <FormControl isRequired id="name">
            <FormLabel>First Name</FormLabel>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <FormLabel>Last Name</FormLabel>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <FormLabel>Username</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <FormLabel>Date of Birth</FormLabel>
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </FormControl>
        )}
        {step === 2 && (
          <VStack spacing={4} align="stretch">
            <FormControl id="profile">
              <FormLabel>Add a profile photo here ... </FormLabel>
              <Flex align="center">
                <Input
                  type="file"
                  accept="image/*"
                  id="image-upload"
                  onChange={handleImageChange}
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
                {image && <Text ml="2">{image.name}</Text>}
              </Flex>
            </FormControl>
            <FormControl id="bio">
              <FormLabel>Bio</FormLabel>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            </FormControl>
          </VStack>
        )}
        <HStack>
          <Button
            //leftIcon={<ChevronLeftIcon />}
            onClick={handlePreviousStep}
            disabled={step === 0}
          >
            Previous
          </Button>
          <Button
            //rightIcon={<ChevronRightIcon />}
            onClick={step < steps.length - 1 ? handleNextStep : handleSubmit}
          >
            {step < steps.length - 1 ? "Next" : "Submit"}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

const RegisterForm = () => {
  return <SignUpStepper />;
};

export default RegisterForm;
