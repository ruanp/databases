CREATE DATABASE chat_db;
USE chat_db;
CREATE TABLE messages (
  id INT AUTO_INCREMENT,
  message TEXT(165),
  time TIMESTAMP,
  id_rooms INT,
  id_users INT,
  PRIMARY KEY (id)
);

CREATE TABLE rooms (
  id INT AUTO_INCREMENT,
  PRIMARY KEY (id)
);

CREATE TABLE users (
  id INT AUTO_INCREMENT,
  name TEXT(20),
  PRIMARY KEY (id)
);

CREATE TABLE messages_users (
  id INT AUTO_INCREMENT,
  id_messages INT,
  id_users INT,
  PRIMARY KEY (id)
);

CREATE TABLE rooms_messages (
  id INT AUTO_INCREMENT,
  id_rooms INT,
  id_messages INT,
  PRIMARY KEY (id)
);

ALTER TABLE messages ADD FOREIGN KEY (id_rooms) REFERENCES rooms (id);
ALTER TABLE messages ADD FOREIGN KEY (id_users) REFERENCES users (id);
ALTER TABLE messages_users ADD FOREIGN KEY (id_messages) REFERENCES messages (id);
ALTER TABLE messages_users ADD FOREIGN KEY (id_users) REFERENCES users (id);
ALTER TABLE rooms_messages ADD FOREIGN KEY (id_rooms) REFERENCES rooms (id);
ALTER TABLE rooms_messages ADD FOREIGN KEY (id_messages) REFERENCES messages (id);
