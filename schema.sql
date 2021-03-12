CREATE TABLE IF NOT EXISTS series(
  id serial primary key,
  name varchar(128) not null,
  aired date,
  inProduction boolean,
  tagline varchar(64),
  thumbnail varchar (255) not null,
  description varchar (1024),
  language varchar (64),
  network varchar (64),
  url varchar (255),
);

CREATE TABLE IF NOT EXISTS genre(  
    id serial primary key, 
    name varchar(128) not null,
);

-- tengitafla - series-genre

CREATE TABLE IF NOT EXISTS season(
    id serial primary key,
    name varchar(128) not null,
    seasonNo integer not null check (seasonNo > 0),
    aired date,
    seasonPoster varchar (255),
    serie serial FOREIGN KEY REFERENCES series (id),
);

CREATE TABLE IF NOT EXISTS episodes(
    id serial primary key,
     name varchar(128) not null,
     episodeNo integer not null check (seasonNo > 0),
     aired date,
     description varchar (1024),
     season serial FOREIGN KEY REFERENCES season(id), 
);

CREATE TABLE IF NOT EXISTS users(
  id serial primary key,
  username character varying(255) NOT NULL unique,
  password character varying(255) NOT NULL unique (password > 9),
  admin boolean default false,
);

-- Tengitafla fyrir notendur og sjónvarpsþætti

CREATE TABLE IF NOT EXISTS me(
  id serial primary key,
  password character varying(255) NOT NULL unique, password > 9,
  username character varying(255) NOT NULL,
  passwsord character varying(255) NOT NULL
);