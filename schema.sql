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

-- tengitafla - series-genre
CREATE TABLE series_genres (
  serie INTEGER NOT NULL,
  genre INTEGER NOT NULL,
  CONSTRAINT FK_seriesGenres_serie FOREIGN KEY (serie) REFERENCES series (id) ON DELETE CASCADE,
  CONSTRAINT FK_seriesGenres_genre FOREIGN KEY (genre) REFERENCES genres (id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS season(
    id serial primary key,
    name varchar(128) not null,
    seasonNo integer not null check ( seasonNo > 0),
    aired date,
    description varchar(1024),
    seasonPoster varchar (255),
    serieName varchar(128),
    CONSTRAINT FK_serie FOREIGN KEY (serie) REFERENCES series (id)
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
  password character varying(255) NOT NULL unique, 
  email varchar(255) NOT NULL unique,
  admin boolean default false
);

CREATE TABLE IF NOT EXISTS users_series(
  id serial primary key,
  CONSTRAINT FK_serie FOREIGN KEY (serie) REFERENCES series(id),
  CONSTRAINT FK_user FOREIGN KEY (user) REFERENCES users(id)
  state varchar(64),
  rating INTEGER CHECK(rating < 6)
)


