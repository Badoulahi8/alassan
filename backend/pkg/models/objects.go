package Models

import "time"

type Session struct {
	Token    string `json:"token"`
	Username string `json:"username"`
	IdUser   int    `json:"id"`
	User     Users
}

type Users struct {
	ID           int    `json:"id"`
	Email        string `json:"email"`
	Password     string `json:"password"`
	Username     string `json:"username"`
	FirstName    string `json:"firstName"`
	LastName     string `json:"lastName"`
	Dob          string `json:"dob"`
	Bio          string `json:"bio"`
	ProfilePhoto []byte `json:"profile_photo"`
	Profil       string `json:"profil"`
	Avatar       string
}

type Group struct {
	Id            int       `json:"id"`
	Name          string    `json:"name"`
	Group_Creator int       `json:"group_creator"`
	Creation_Date time.Time `json:"creation"`
	Description   string    `json:"description"`
	PostGroup     []PostDatas
}

type EventDetails struct {
	Id          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	DateTime    string `json:"dateTime"`
	GroupId     int    `json:"groupId"`
	Slug        string `json:"slug"`
	UserId      int    `json:"userid"`
}
type GroupDatas struct {
	Datas   interface{} `json:"datas"`
	Events  interface{} `json:"events"`
	Friends interface{} `json:"friends"`
}

type FriendsDatas struct {
	Followers  interface{} `json:"followers"`
	Followings interface{} `json:"followings"`
}

type JoinGroupRequest struct {
	GroupID      int    `json:"groupId"`
	GroupCreator string `json:"groupCreator"`
}

type Response struct {
	Status    string `json:"status"`
	GroupName string `json:"groupId"`
	Message   string `json:"message"`
}

type MembershipRequest struct {
	User      string `json:"user"`
	GroupName string `json:"groupName"`
}

type AddMemberRequest struct {
	User    int
	GroupID int
}

type JoinResp struct {
	User     string `json:"user"`
	Response string `json:"response"`
	Group    string `json:"group"`
}
