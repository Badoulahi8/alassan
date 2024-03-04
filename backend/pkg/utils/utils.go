package utils

import (
	"fmt"
	"strconv"
)

func AbregerNombreLikesOrComment(likes int) string {
	if likes < 1000 {
		return strconv.Itoa(likes) // Retourne le nombre tel quel s'il est inférieur à 1000
	} else if likes < 1000000 {
		return fmt.Sprintf("%.1fk", float64(likes)/1000) // Retourne une version abrégée avec "k" pour les milliers
	} else if likes < 1000000000 {
		return fmt.Sprintf("%.1fM", float64(likes)/1000000) // Retourne une version abrégée avec "M" pour les millions
	}
	// Si le nombre de likes est supérieur à 1 milliard, vous pouvez ajouter une logique supplémentaire si nécessaire
	return strconv.Itoa(likes)
}
