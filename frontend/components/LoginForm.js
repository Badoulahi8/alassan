'use client'
import React, { useState } from "react";
import { Link, Input, Button, Box, Heading, Text } from '@chakra-ui/react';
import { useRouter } from "next/navigation";
import cookie from "js-cookie";


const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter()
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    console.log('Data to be sent:', formData);

    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await response.json();
      console.log(data)

      if (data.status == "success") {
        console.log('Login successful');
        cookie.set("session_token", data.token);
        localStorage.setItem('id', data.id);
        router.push('/')
      } else {
        console.error('Login failed');
        alert('Login failed!!!, Please try again')
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.800">
      <Box bg="gray.900" p={8} rounded="md" boxShadow="md" w="md">
        <Heading as="h2" size="xl" textAlign="center" mb={6} color="gray.200">Login</Heading>
        <form onSubmit={handleSubmit}>
          <Box mb={4}>
            <label htmlFor="email" className="text-gray-400 block mb-2">
              Email
            </label>
            <Input
              type="text"
              id="email"
              placeholder="Your email or username"
              bg="gray.800"
              border="1px"
              borderColor="gray.700"
              rounded="md"
              px={4}
              py={2}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>
          <Box mb={4}>
            <label htmlFor="password" className="text-gray-400 block mb-2">
              Password
            </label>
            <Input
              type="password"
              id="password"
              placeholder="Your password"
              bg="gray.800"
              border="1px"
              borderColor="gray.700"
              rounded="md"
              px={4}
              py={2}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Box>
          <Button
            type="submit"
            colorScheme="blue"
            rounded="md"
            py={2}
            w="100%"
            _hover={{ bg: 'blue.600' }}
            transitionDuration="300"
          >
            Login
          </Button>
        </form>
        <Text mt={2} color="gray.400" textAlign="center">
          If you want to register {""}
          <Link href='/register' color='blue.400' _hover={{ color: 'green.500' }}>
            click here.
          </Link>
        </Text>
      </Box>
    </Box>
  );
};

export default LoginForm;
