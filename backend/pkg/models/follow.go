package Models

type UserFollow struct {
	Use         User
	FollowId    int
	Status      int
	IsFollowing bool
}

/*/
type Follow struct {
	User      User
	Followers []UserFollow `json:"followers"`
	Following []UserFollow `json:"following"`
}/*/

type Follow struct {
	ID        int64 `json:"id"`
	Follower  int64 `json:"follower"`
	Following int64 `json:"following"`
	Type      int   `json:"type"`
}
