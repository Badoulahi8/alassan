CREATE TABLE MembershipRequests (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    GroupID INTEGER,
    GroupCreator INTEGER,
    UserId INTEGER,
    RequestDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);