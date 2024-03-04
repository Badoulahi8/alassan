'use client'

import { useRef, useEffect, useState } from "react"
import { useRouter } from "next/navigation";

import styles from "../app/styles/createpost.module.css"
import fetcher from "@/utils/fetcher";
import toBase64 from "@/utils/convert";


export default function PostForm(){
    
    const [dataUser, setDataUser] = useState(null); // Utilisation de useState pour stocker les données utilisateur
    
    const  getUserFollower = async() => {
        const response = await fetch("http://localhost:8080/api/createpost", {
            method: 'GET',
            credentials: 'include',
        })
        let data = await response.json()
        setDataUser(data)
        console.log(data);
    }

    //Remplacer l'input de type file par l'icone image
    const fileInputRef = useRef(null);
    const handleIconClick = () => {
        fileInputRef.current.click();
    };

    //Gestion du textarea
    const handleTextarea = () =>{
        const textarea = document.querySelector('textarea');
        textarea.addEventListener('input', () => {
            const maxLength = 2000;
            if (textarea.value.length > maxLength) {
                textarea.value = textarea.value.slice(0, maxLength); 
            }
            
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        });
    }
  
    const handleRemoveImage = () => {  // Supprimer l'image en mettant à jour l'état à null
        setFormData(prev => ({
            ...prev,
            image: null // Mettre à jour l'état avec le fichier sélectionné
        }));
    };

    //Recuperer les donnees du formulaire
    const [formData, setFormData] = useState({
        postText: "",
        image: null,
        postVisibility: "",
        userSelected: [],
    })

    const handleDataChange = (event) => {
        const { type, name, value } = event.target;
    
        // Si c'est une case à cocher
        if (type === "checkbox") {
            const isChecked = event.target.checked;
            const personId = parseInt(value); 
    
            if (isChecked) {
                // Ajouter l'ID de l'utilisateur sélectionné au tableau userSelected dans formData
                setFormData(prev => ({
                    ...prev,
                    userSelected: [...prev.userSelected, personId]
                }));
            } else {
                // Retirer l'ID de l'utilisateur désélectionné du tableau userSelected dans formData
                setFormData(prev => ({
                    ...prev,
                    userSelected: prev.userSelected.filter(id => id !== personId)
                }));
            }
        }
        // Si c'est un champ de fichier
        else if (type === "file") {
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
    const router = useRouter();

    const handleSubmit = async (event) =>{
        event.preventDefault()
        let imageName
        if (formData.image){
            imageName = formData.image.name
            formData.image = await toBase64(formData.image)
        }
        formData.imageName = imageName

        fetcher.post("/createpost", formData).then(response =>{
            if(response.status == 200){
                console.log("data sended")
            }else{
                console.log("error", response);
            }
        })
        console.log("formData", formData);
        router.push("/")
    }

    useEffect(() =>{
        getUserFollower()

    }, [])

    return (
        <>
            <div className={styles.globForm}>
                <div className={styles.headForm}> 
                    <p>New Post</p>
                </div>
                <div className={styles.divForm}>
                    {dataUser && (
                        <div className={styles.postForm}>
                            <img src={"../images/users/"+dataUser.UserInfo.Avatar} className={styles.userPhoto}/>
                            <span className={styles.userName}>{dataUser.UserInfo.username}</span>
                            <form onSubmit={handleSubmit} method="post" encType="multipart/form-data" id={styles.formPost}>
                                <textarea  id="post-content" onInput={handleTextarea} name="postText" rows="1" className={styles.textarea} placeholder="Enter your text here..." value={formData.postText || ""} onChange={handleDataChange} ></textarea>
                                <input type="file" name="image" accept="image/*" className={styles.imageInput} ref={fileInputRef} onChange={handleDataChange}/>
                                {formData.image && (
                                    <div className={styles.imageContainer}>
                                        <img src={URL.createObjectURL(formData.image)} alt="selected" className={styles.selectedImage} />
                                        <span className={styles.removeIcon} onClick={handleRemoveImage}>&times;</span>
                                    </div>
                                )}
                                <img src="../photo.png" className={styles.galerie} onClick={handleIconClick} />
                                <div className={styles.postVisibility}>
                                    <div className={styles.select}>
                                        <select name="postVisibility" onChange={handleDataChange} id={styles.selectOption}>
                                            <option value={"public"}>🌍 Public</option>
                                            <option value={"follower"}>👥 Followers</option>
                                            <option value={"choice"}>✅ Choose</option>
                                        </select>
                                        {formData.postVisibility === 'choice' && (
                                            <div className={styles.divChoice}>
                                                <ul className={styles.ulChoice}>
                                                {dataUser.Follower ? (dataUser.Follower.map(follower => (
                                                    <li key={follower.Use.Id}>
                                                        <label htmlFor={`person_${follower.Use.Id}`}>
                                                            <img src={"../images/users/"+follower.Use.Avatar} className={styles.userChoice} />
                                                            <span>{follower.Use.NickName}</span>
                                                        </label>
                                                        <input type="checkbox" name="userSelected" value={follower.Use.Id} onChange={handleDataChange} id={`person_${follower.Use.Id}`} className={styles.checkbox}/>
                                                    </li>
                                                ))): <span style={{color: "red"}}>You have not a follower</span>}
                                                </ul>
                                            </div>
                                        )}
                                        <button id={styles.publier} type="submit" onClick={handleSubmit}>Publish</button>
                                    </div>
                                </div>
                                    
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}