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
    name varchar(128) unique not null
);

-- tengitafla - series-genre
CREATE TABLE series_genres (
  serie INTEGER NOT NULL,
  genre varchar(128) NOT NULL
  --CONSTRAINT FK_seriesGenres_serie FOREIGN KEY (serie) REFERENCES series (id) ON DELETE CASCADE,
  --CONSTRAINT FK_seriesGenres_genre FOREIGN KEY (genre) REFERENCES genres (name) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS season(
    id serial primary key,
    name varchar(128) not null,
    seasonNo integer not null check ( seasonNo > 0),
    aired date,
    overview varchar(1024),
    seasonPoster varchar (255),
    serieName varchar(128),
    FK_serie integer not null,
    CONSTRAINT FK_serie FOREIGN KEY (FK_serie) REFERENCES series (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS episodes(
    id serial primary key,
     name varchar(256) not null,
     episodeNo integer not null check ( episodeNo > 0),
     aired date,
     overview varchar (1024),
     seasonNumber integer check (seasonNumber > 0),
     FK_serie serial,
     CONSTRAINT FK_serie FOREIGN KEY (FK_serie) REFERENCES series(id) ON DELETE CASCADE
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
  CONSTRAINT FK_serie FOREIGN KEY (id) REFERENCES series(id) ON DELETE CASCADE,
  CONSTRAINT FK_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
  state varchar(64),
  rating INTEGER CHECK(rating < 6)
);


