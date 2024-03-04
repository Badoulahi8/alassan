package Models

type Action struct {
	Id        int
	Status    int
	CommentId int
	PostId    int
	UserId    int
}

type ActionData struct {
	UserId    int `json:"userId"`
	PostId    int `json:"postId"`
	CommentId int `json:"commentId"`
}
