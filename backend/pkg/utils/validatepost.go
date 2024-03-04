package utils

import (
	Models "backend/pkg/models"
	"errors"
	"net/http"
	"regexp"
	"strconv"
	"strings"
)

func ValidatePost(post Models.Posts) error {
	if len(post.Content) == 0 && len(post.Image) == 0 {
		return errors.New("The post must content an image or a text")
	} else if post.Visibility == "choice" && len(post.UserSelected) == 0 {
		return errors.New("You must Selected at least one User")
	} else if len(post.ImagePath) != 0 {
		fileformat := ""
		split := strings.Split(post.ImagePath, ".")
		if len(split) != 0 {
			fileformat = split[len(split)-1]
		}

		if strings.ToUpper(fileformat) != "PNG" && strings.ToUpper(fileformat) != "JPG" && strings.ToUpper(fileformat) != "JPEG" && strings.ToUpper(fileformat) != "GIF" {
			return errors.New("This Image Format isn't taken into account")
		}
	}
	return nil
}

func GetIdOfUrl(r *http.Request, str string) int {
	re := regexp.MustCompile(`^/` + str + `/([0-9]+)$`)
	matches := re.FindStringSubmatch(r.URL.Path)
	if len(matches) < 2 {
		return 0
	}
	id, _ := strconv.Atoi(matches[1])
	return id
}
