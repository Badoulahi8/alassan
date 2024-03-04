package controllers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)


// Structure pour représenter chaque client WebSocket
type Client struct {
	Conn *websocket.Conn // La connexion WebSocket
	ID   int             // L'ID du client
}

// Message structure
type Message struct {
	Text             string `json:"text"`
	SenderId         int    `json:"senderId"`
	SenderName       string `json:"senderName"`
	RecipientId      int    `json:"recipientId"`
	DestinataireType string `json:"destinataireType"`
	GroupId          int    `json:"groupId"`
	Timestamp        string `json:"timestamp"`
}

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			// Fonction de vérification d'origine personnalisée si nécessaire
			return true
		},
	}

	// Map pour stocker les clients WebSocket
	clients   = make(map[*Client]bool)
	clientsMu sync.RWMutex // Mutex pour la synchronisation des accès à la carte des clients

	// Map pour stocker les messages actuels de chaque client
	clientMessages   = make(map[*Client]Message)
	clientMessagesMu sync.RWMutex // Mutex pour la synchronisation des accès à la carte des messages des clients

	// Channel pour diffuser les messages à tous les clients
	broadcast = make(chan Message)
)

// Gérer les connexions WebSocket
func HandleConnections(w http.ResponseWriter, r *http.Request) {
	// Mettre à niveau la connexion HTTP vers WebSocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	// Créer un nouvel objet Client pour représenter ce client WebSocket
	client := &Client{Conn: ws}

	// Ajouter le client à la carte des clients
	clientsMu.Lock()
	clients[client] = true
	clientsMu.Unlock()

	// Boucle de lecture des nouveaux messages depuis le client
	for {
		var msg Message
		// Lire le message JSON du WebSocket
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("Error: %v", err)
			clientsMu.Lock()
			delete(clients, client)
			clientsMu.Unlock()
			break
		}

		// Stocker les informations de message dans la carte des messages des clients
		clientMessagesMu.Lock()
		clientMessages[client] = msg
		clientMessagesMu.Unlock()

		// Imprimer les données reçues pour déboguer
		log.Printf("Message received: %+v", msg)

		// Diffuser le message à tous les clients
		broadcast <- msg
	}
}

// Gérer la diffusion des messages à tous les clients
func HandleMessages() {
    for {
        // Récupérer le prochain message de la file d'attente
        msg := <-broadcast
        // Insérer le message dans la base de données avec le nom de l'expéditeur
        err := InsertMessage(msg)
        if err != nil {
            log.Printf("Error inserting message: %v", err)
            continue
        }
        // Récupérer le Nickname de l'expéditeur
        senderName, err := GetNicknameByID(msg.SenderId)
        if err != nil {
            log.Printf("Error getting sender nickname: %v", err)
            senderName = "Unknown" // Utiliser "Unknown" si le Nickname n'est pas trouvé
        }
        // Parcourir tous les clients connectés et leur envoyer le message avec le SenderName correct
        clientsMu.RLock()
        for client := range clients {
            // Inclure le nom de l'expéditeur dans les données du message
            msgWithSenderName := Message{
                Text:             msg.Text,
                SenderId:         msg.SenderId,
                SenderName:       senderName,
                RecipientId:      msg.RecipientId,
                DestinataireType: msg.DestinataireType,
                GroupId:          msg.GroupId,
                Timestamp:        msg.Timestamp,
            }
            // Envoyer le message JSON à chaque client
            err := client.Conn.WriteJSON(msgWithSenderName)
            if err != nil {
                log.Printf("Error: %v", err)
                client.Conn.Close()
                clientsMu.RUnlock()
                clientsMu.Lock()
                delete(clients, client)
                clientsMu.Unlock()
                break
            }
        }
        clientsMu.RUnlock()
    }
}


// Handler pour récupérer les anciens messages entre deux utilisateurs ou d'un groupe
func GetOldMessagesHandler(w http.ResponseWriter, r *http.Request) {
	// Vérifier que la méthode de requête est POST
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Décodez les données JSON de la requête
	var requestData struct {
		SenderID         int    `json:"senderId"`
		RecipientID      int    `json:"recipientId"`
		DestinataireType string `json:"recipientType"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Récupérer les identifiants d'expéditeur, de destinataire et le type de destinataire de la requête
	senderID := requestData.SenderID
	recipientID := requestData.RecipientID
	recipientType := requestData.DestinataireType

	// Récupérer les anciens messages entre les utilisateurs ou d'un groupe
	messages, err := GetOldMessages(senderID, recipientID, recipientType)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Error fetching old messages", http.StatusInternalServerError)
		return
	}

	// Convertir les messages en JSON
	messagesJSON, err := json.Marshal(messages)
	if err != nil {
		http.Error(w, "Error encoding messages to JSON", http.StatusInternalServerError)
		return
	}

	// Définir le type de contenu de la réponse en JSON
	w.Header().Set("Content-Type", "application/json")

	// Envoyer les messages JSON en tant que réponse
	w.Write(messagesJSON)
}
