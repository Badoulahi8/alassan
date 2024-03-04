
CREATE TABLE IF NOT EXISTS User (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    FirstName VARCHAR(50),
    LastName VARCHAR(30),
    Nickname VARCHAR(30),
    Avatar VARCHAR(40),
    DateofBirth DATE,
    AboutMe VARCHAR(250),
    Email VARCHAR(100),
    Password VARCHAR(50),
    Profil VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS Category (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Libelle VARCHAR(50),
    Icon VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS Post (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Content TEXT,
    ImagePath VARCHAR(100),
    Date DATETIME,
    UserId INTEGER,
    VisibilityPost VARCHAR(50),
    FOREIGN KEY (UserId) REFERENCES User(Id)
);

CREATE TABLE IF NOT EXISTS PostVisibility (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    PostId INTEGER,
    Visibility INTEGER,
    FOREIGN KEY (PostId) REFERENCES Post(Id),
    FOREIGN KEY (Visibility) REFERENCES User(Id)
);

CREATE TABLE IF NOT EXISTS PostCategory (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    PostId INTEGER,
    CategoryId INTEGER,
    FOREIGN KEY (PostId) REFERENCES Post(Id),
    FOREIGN KEY (CategoryId) REFERENCES Category(Id)
);

CREATE TABLE IF NOT EXISTS Comment (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Content TEXT,
    ImagePath VARCHAR(100),
    Date DATETIME,
    PostId INTEGER,
    UserId INTEGER,
    FOREIGN KEY (PostId) REFERENCES Post(Id),
    FOREIGN KEY (UserId) REFERENCES User(Id)
);

CREATE TABLE IF NOT EXISTS Action (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Status INTEGER,
    UserId INTEGER,
    PostId INTEGER,
    CommentId INTEGER,
    FOREIGN KEY (UserId) REFERENCES User(Id),
    FOREIGN KEY (PostId) REFERENCES Post(Id),
    FOREIGN KEY (CommentId) REFERENCES Comment(Id)
);

CREATE TABLE IF NOT EXISTS Chat (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    SenderId INTEGER,
    TargetId INTEGER,
    Content TEXT,
    CreatedDate DATE,
    CreatedTime TIME,
    FOREIGN KEY (SenderId) REFERENCES User(Id),
    FOREIGN KEY (TargetId) REFERENCES User(Id)
);

CREATE TABLE IF NOT EXISTS Event (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Title VARCHAR(100),
    Description TEXT,
    UserId INTEGER,
    GroupId INTEGER,
    Date DATE
);

CREATE TABLE IF NOT EXISTS EventMember (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId INTEGER,
    EventId INTEGER
);

CREATE TABLE IF NOT EXISTS Follow (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Follower INTEGER,
    Following INTEGER,
    Type INTEGER
);

CREATE TABLE IF NOT EXISTS Groups (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(50),
    Group_Creator TEXT,
    Creation_Date DATE,
    Description TEXT
);

CREATE TABLE IF NOT EXISTS memberGroup (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId INTEGER,
    GroupId INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
	"token"	text NOT NULL,
	"id"	integer NOT NULL,
	PRIMARY KEY("token")
    FOREIGN KEY("id") REFERENCES User(Id)
);

CREATE TABLE IF NOT EXISTS MembershipRequests (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    GroupID INTEGER,
    GroupName TEXT,
    GroupCreator INTEGER,
    RequesterID INTEGER,
    RequesterName TEXT,
    RequestDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

    CREATE TABLE IF NOT EXISTS groupMembers (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        GroupID INTEGER,
        UserID INTEGER,
        FOREIGN KEY (GroupID) REFERENCES Groups(Id),
        FOREIGN KEY (UserID) REFERENCES User(Id)
    );

-- -- SQLite
-- -- Insertion des 5 utilisateurs
-- INSERT INTO User (FirstName, LastName, Nickname, Avatar, DateofBirth, AboutMe, Email, Password, Profil)
-- VALUES 
--     ('John', 'Doe', 'john_doe', 'avatar1.jpg', '1990-01-01', 'About John Doe', 'john@example.com', 'password1', 'user'),
--     ('Jane', 'Smith', 'jane_smith', 'avatar2.jpg', '1992-05-15', 'About Jane Smith', 'jane@example.com', 'password2', 'user'),
--     ('Alice', 'Johnson', 'alice_johnson', 'avatar3.jpg', '1988-11-20', 'About Alice Johnson', 'alice@example.com', 'password3', 'user'),
--     ('Bob', 'Brown', 'bob_brown', 'avatar4.jpg', '1995-03-10', 'About Bob Brown', 'bob@example.com', 'password4', 'user'),
--     ('Emily', 'Davis', 'emily_davis', 'avatar5.jpg', '1997-08-25', 'About Emily Davis', 'emily@example.com', 'password5', 'user');

-- -- Insertion des relations de suivi (chacun suit tous les autres)
-- INSERT INTO Follow (Follower, Following, Type)
-- SELECT 
--     u1.Id AS FollowerId, 
--     u2.Id AS FollowingId,
--     1 AS Type -- Remarque : '1' peut être un type spécifique de relation de suivi selon votre schéma
-- FROM User u1
-- CROSS JOIN User u2
-- WHERE u1.Id != u2.Id;

CREATE TABLE IF NOT EXISTS AddMemberRequests (
    RequestID INTEGER  PRIMARY KEY AUTOINCREMENT,
    GroupID INTEGER,
    RequesterID INTEGER,
    RequestedID INTEGER,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (GroupID) REFERENCES Groups(GroupID),
    FOREIGN KEY (RequesterID) REFERENCES User(UserID),
    FOREIGN KEY (RequestedID) REFERENCES User(UserID)
);

CREATE TABLE IF NOT EXISTS Message (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Expediteur INTEGER,
    Destinataire INTEGER,
    DestinataireType TEXT, -- "Friend" ou "Group"
    GroupeID INTEGER, -- Si DestinataireType est "Group", alors cet ID est l'ID du groupe
    Contenue TEXT,
    Date DATETIME,
    Lu BOOLEAN DEFAULT 0,
    FOREIGN KEY (Expediteur) REFERENCES User(id),
    FOREIGN KEY (Destinataire) REFERENCES User(id),
    FOREIGN KEY (GroupeID) REFERENCES Groups(id)
);

