package Models

import (
	"time"
)

type Posts struct {
	Id           int
	Content      string `json:"postText"`
	Image        string `json:"image"`
	ImagePath    string `json:"imageName"`
	UserId       int
	Visibility   string `json:"postVisibility"`
	UserSelected []int  `json:"userSelected"`
	DatePosted   time.Time
}

type PostCategory struct {
	Id         int
	PostId     int
	CategoryId int
}

type PostDatas struct {
	Posts
	NickName    string
	UserName    string
	UserAvatar  string
	DatePosted  string
	IsLike      bool
	NumLikes    int
	NumComments string
	Comments    []CommentDatas
	UserInfos   User
}

type UserFollows struct {
	User     User
	FollowId int
	Status   int
}

type PostFormData struct {
	UserInfo  Users
	Follower []UserFollow
}
