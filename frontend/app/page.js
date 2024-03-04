import Home from '@/components/Home'
import './styles/chat.css';
import LoginForm from '@/components/LoginForm'
import { ChakraProvider} from "@chakra-ui/react";


// import { theme } from "./theme";

export default function MyApp({ Component, pageProps }) {
  let isLoggedIn = true

  return (
    // <ChakraProvider theme={theme}>
    <ChakraProvider>
    {
      isLoggedIn ? (
        <Home/>
      ) :(
        <LoginForm/>
      )
    }
    </ChakraProvider>
  )
}
