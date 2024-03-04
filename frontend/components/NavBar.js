"use client";
import { useRouter } from "next/navigation";
import styles from "../app/styles/navbar.module.css";
import cookie from "js-cookie";
import fetcher from "@/utils/fetcher";


export default function NavBar({ toggleChat }) {
  const router = useRouter();

  function handleclickProfil() {
    const userId = localStorage.getItem("id");
    console.log("user id", userId);

    const requestOptions = {
      credentials: "include",
    };
    fetch(`http://localhost:8080/profil?id=${userId}`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de la requête.");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Réponse du serveur :", data);
        router.push(`/profil?id=${userId}`)
      })
      .catch((error) => {
        console.error("Erreur :", error);
      });
  }

  return (
    <>
      <div className={styles.navBarDiv}>
        <div className={styles.container}>
          <div className={styles.app}>
            <div className={styles.home}>
              <button onClick={() => router.push("/")}>
                <img src="../home_icon.svg" />
              </button>
            </div>
            <div className={styles.groups}>
              <button onClick={() => router.push("/groups")}>
                <img src="../group.svg" />
              </button>
            </div>
            <div className={styles.search}>
              <button onClick={() => router.push("/")}>
                <img src="../search_icon.svg" />
              </button>
            </div>
            <div className={styles.note}>
              <button onClick={() => router.push("/createpost")}>
                <img src="../createpost_icon.svg" />
              </button>
            </div>
            <div className={styles.notification}>
              <button onClick={() => router.push("/notifications")}>
                <img src="../notification_icon.svg" />
              </button>
            </div>
            <div className={styles.user}>
              <button onClick={handleclickProfil}>
                <img src="../user_icon.svg" />
              </button>
            </div>
            <div> 
              <button onClick={toggleChat}>
                <img src="../chat.svg" />
              </button>
            </div>
          </div>
          <div className={styles.logout}>
            <Logout />
          </div>
        </div>
      </div>
    </>
  );
}

function Logout() {
  const router = useRouter();

  const handleLogout = async () => {
    let cookieValue = cookie.get("session_token")
    // console.log("cookieValue", cookieValue);
    cookie.remove("session_token");
    fetcher.post("/logout", cookieValue)
    router.push("/login");
  };

  return (
    <button onClick={handleLogout}>
      <img src="../logout_icon.svg" />
    </button>
  );
}
