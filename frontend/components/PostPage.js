'use client'
import { useRef, useState } from "react"
import { Box, Flex, Image, Text, IconButton, Modal, ModalOverlay, ModalContent, useDisclosure } from "@chakra-ui/react";
import { AiOutlineHeart, AiOutlineComment, AiFillEdit, AiFillHeart } from "react-icons/ai";
import fetcher from "@/utils/fetcher";
import toBase64 from "@/utils/convert";
import styles from "../app/styles/createpost.module.css"
// import { useRouter } from "next/navigation";

const PostPage = ({ post, user }) => {

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={4} mb={4}>
      <Flex alignItems="center" mb={2}>
        <Box mr={2}>
          <Image
            src={`../images/users/${post.UserAvatar !== `` ? post.UserAvatar : `default.png`}`}
            alt={`user_community_image`}
            borderRadius="full"
            boxSize="50px"
          />
        </Box>
        <Text fontWeight="bold">{post.NickName}</Text>
      </Flex>
      <Text mt={2} textAlign="justify">
        {post.postText}
      </Text>
      {
        post.imageName !== `` ? (
          <Flex justifyContent={"center"} mt={2}>
            <Image
              src={`../images/posts/${post.imageName}`}
              boxSize="100%"
              height="auto"
            />
          </Flex>
        ) : (
          <></>
        )
      }
      <Flex alignItems="center" mt={4}>
        <IconButton
          aria-label="Like"
          icon={post.IsLike ? (<AiFillHeart />) : (<AiOutlineHeart />)}
          colorScheme={post.IsLike ? `red` : `gray`}
          variant="ghost"
          size="lg"
        />
        <Text fontSize="sm" color="gray.600">
          {post.NumLikes}
        </Text>
        <IconButton
          aria-label="Comment"
          icon={<AiOutlineComment />}
          colorScheme="gray"
          variant="ghost"
          size="lg"
          ml={4}
        />
        <Text fontSize="sm" color="gray.600">
          {post.NumComments}
        </Text>
        <Flex ml={"20px"} alignItems="center" justifyContent={"right"}>
          <ModalCreateComment user={user} PostId={post.Id} />
        </Flex>
      </Flex>
    </Box>
  );
};
export default PostPage;

const ModalCreateComment = ({ user, PostId }) => {

  const { isOpen, onOpen, onClose } = useDisclosure();

  //Remplacer l'input de type file par l'icone image
  const fileInputRef = useRef(null);
  const handleIconClick = () => {
    fileInputRef.current.click();
  };

  /*/Gestion du textarea
  useEffect(() => {
      const textarea = document.querySelector('textarea');
      textarea.addEventListener('input', () => {
          const maxLength = 500;
          if (textarea.value.length > maxLength) {
              textarea.value = textarea.value.slice(0, maxLength); 
          }
          
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
      });
  }, []);/*/


  const handleRemoveImage = () => {  // Supprimer l'image en mettant à jour l'état à null
    setFormData(prev => ({
      ...prev,
      image: null // Mettre à jour l'état avec le fichier sélectionné
    }));
  };

  //Recuperer les donnees du formulaire
  const [formData, setFormData] = useState({
    CommentText: "",
    postId: PostId,
    userId: user.Id,
    image: null,
    postVisibility: "",
  })

  const handleDataChange = (event) => {
    const { type, name, value } = event.target;

    // Si c'est un champ de fichier
    if (type === "file") {
      const file = event.target.files[0];
      setFormData(prev => ({
        ...prev,
        image: file // Mettre à jour l'état avec le fichier sélectionné
      }));
    }
    // Pour les autres champs
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  const handleSubmit = async (event) => {
    // const router = useRouter();
    event.preventDefault()
    let imageName
    if (formData.image) {
      imageName = formData.image.name
      formData.image = await toBase64(formData.image)
    }
    formData.imageName = imageName

    fetcher.post("/createcomment", formData).then(response => {
      if (response.status == 200) {
        console.log("data sended")
      } else {
        console.log("error", response.status);
      }
    })
    console.log("formData", formData);
    // router.push("/")
    setFormData({
      CommentText: "",
      image: null,
      postVisibility: "",
    })
  }

  return (
    <>
      <IconButton
        aria-label="Like"
        icon={<AiFillEdit />}
        colorScheme="gray"
        variant="ghost"
        size="lg"
        mr={2}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={undefined} size="xl" finalFocusRef={undefined}>
        <ModalOverlay />
        <ModalContent>
          <div className={styles.divForm}>
            <div className={styles.postForm}>
              <img src={`../images/users/${user.Avatar}`} className={styles.userPhoto} />
              <span className={styles.userName}>{user.NickName}</span>
              <form onSubmit={handleSubmit} method="post" encType="multipart/form-data" id={styles.formPost}>
                <textarea id="post-content" name="CommentText" rows="1" className={styles.textarea} placeholder="Enter your comment here..." value={formData.CommentText || ""} onChange={handleDataChange} ></textarea>
                <input type="file" name="image" accept="image/*" className={styles.imageInput} ref={fileInputRef} onChange={handleDataChange} />
                {formData.image && (
                  <div className={styles.imageContainer}>
                    <img src={URL.createObjectURL(formData.image)} alt="selected" className={styles.selectedImage} />
                    <span className={styles.removeIcon} onClick={handleRemoveImage}>&times;</span>
                  </div>
                )}
                <img src="../photo.png" className={styles.galerie} onClick={handleIconClick} />
                <div className={styles.postVisibility}>
                  <div className={styles.select}>
                    <button id={styles.publier} type="submit" onClick={handleSubmit}>Publish</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};
