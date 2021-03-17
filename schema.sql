CREATE TABLE IF NOT EXISTS series(
  id serial primary key,
  name varchar(128) not null,
  aired date,
  inProduction boolean,
  tagline varchar(128),
  thumbnail varchar (255) not null,
  description varchar (1024),
  language varchar (64),
  network varchar (64),
  url varchar (255)
);

CREATE TABLE IF NOT EXISTS genres(  
    id serial primary key, 
    name varchar(128) not null
);

CREATE TABLE IF NOT EXISTS season(
    id serial primary key,
    name varchar(128) not null,
    seasonNo integer not null check ( seasonNo > 0),
    aired date,
    seasonPoster varchar (255),
    serie serial foreign key REFERENCES series (id)
);

CREATE TABLE IF NOT EXISTS episodes(
    id serial primary key,
     name varchar(128) not null,
     episodeNo integer not null check ( episodeNo > 0),
     aired date,
     description varchar (1024),
     season serial foreign key REFERENCES season(id)
);

CREATE TABLE IF NOT EXISTS users(
  id serial primary key,
  username character varying(255) NOT NULL unique,
  password character varying(255) NOT NULL unique, --ath check (len(password) > 8)
  email varchar(255) NOT NULL unique,
  admin boolean default false
);

CREATE TABLE series_genres (
  serie INTEGER NOT NULL,
  genre INTEGER NOT NULL,
  CONSTRAINT FK_seriesGenres_serie FOREIGN KEY (serie) REFERENCES series (id) ON DELETE CASCADE,
  CONSTRAINT FK_seriesGenres_genre FOREIGN KEY (genre) REFERENCES genres (id) ON DELETE CASCADE
);

-- Tengitafla fyrir notendur og sjónvarpsþætti
CREATE TABLE IF NOT EXISTS user_series(
  series serial foreign key REFERENCES series(id),
  user serial foreign key REFERENCES users(id),
  status varchar(64),
  rating integer check(rating < 6)
)
