CREATE TABLE IF NOT EXISTS  Utilisateurs(
	adresseCourriel varchar(255),
    username varchar(255),
	motDePasse varchar(255),
	isClient bit not null,
	isAvocat bit null null,
	isAdmin bit default 0,
	idUser INTEGER PRIMARY KEY AUTOINCREMENT
);

-- drop table Utilisateurs

CREATE TABLE IF NOT EXISTS Documents(
	idDocument INTEGER primary key,
	user varchar(250),
	nom varchar(50),
	date varchar(3500) null
);

--drop table Documents
--delete from Documents
--select * from Documents

CREATE TABLE IF NOT EXISTS Communications(
	idCommunication INTEGER primary key,
	user varchar(250),
	destinataire varchar(3500),
	sujet varchar(3500),
	message varchar(3500),
	date varchar(3500) null
);

CREATE TABLE IF NOT EXISTS Factures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idUser INTEGER,
  montant TEXT,
  date_emission TEXT,
  statut TEXT,
  FOREIGN KEY (idUser) REFERENCES Utilisateurs(idUser)
);


--drop table Communications
--delete from Communications

insert into Utilisateurs values 
('admin@admin','admin','admin',0,0,1,0)

insert into Communications values 
(1,'admin@admin','admin@admin','test','premier message','2025-04-04')
