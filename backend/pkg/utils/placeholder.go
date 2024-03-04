package utils

// GeneratePlaceholders génère une chaîne de caractères contenant le nombre nécessaire de marqueurs de paramètres de requête pour la clause IN
func GeneratePlaceholders(n int) string {
	placeholders := ""
	if n != 0 {
		placeholders += ","
	}
	for i := 0; i < n; i++ {
		if i != 0 {
			placeholders += ","
		}
		placeholders += "?"
	}
	return placeholders
}
