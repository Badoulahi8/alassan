package Models

import "time"

type Comment struct {
	Id        int
	Content   string `json:"commentText"`
	Image     string `json:"image"`
	ImagePath string `json:"imageName"`
	Date      time.Time
	PostId    int `json:"postId"`
	UserId    int `json:"userId"`
}

type CommentDatas struct {
	Comment
	DateFormat string
	NickName   string
	AvatarUser string
	NumLikes   int
	IsLike     bool
}
