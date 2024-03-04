package utils

import (
	"bytes"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"

	"github.com/gofrs/uuid"
)

func CreateImagePath(dir, image string) (string, error) {

	regesp := regexp.MustCompile(`^data:image/([^;]+);base64,`)
	match := regesp.FindStringSubmatch(image)
	if len(match) != 2 {
		// fmt.Println("Format d'image non pris en charge")
		return "", errors.New("badImage")
	}
	//Supprimer le préfixe de l'image encodée
	base64Data := regesp.ReplaceAllString(image, "")
	decoded, err := base64.StdEncoding.DecodeString(base64Data)

	//Creer un nom de fichier pour les images
	nameImage, err := uuid.NewV7()
	if err != nil {
		return "", err
	}

	newNameImage := nameImage.String() + ".png"
	ImagePath := filepath.Join(dir, newNameImage)
	outputFile, err := os.Create(ImagePath)
	if err != nil {
		return "", err
	}
	defer outputFile.Close()

	// Copier le contenu de l'image téléchargée dans le fichier de sortie
	_, err = io.Copy(outputFile, bytes.NewReader([]byte(decoded)))
	if err != nil {
		fmt.Println("erreur lors de la copie de l'image dans le fichier", err)
		return "", err
	}

	return ImagePath, nil
}
