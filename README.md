Verkefnið keyrir á Heroku: https://nesflix-h1.herokuapp.com/

# Uppsetning

1. Búa til gagnagrunn, t.d. createdb nesflix
2. Búa til Cloudinary aðgang
3. Afrita .env_example í .env og setja upplýsingar fyrir a. Gagnagrunn b. Cloudinary
4. Keyra eftirfarandi skipanir:

```
npm install
npm run setup
npm run dev
```
Ath. að enn hefur ekki tekist að inserta öll gögn í gagnagrunn. Líklega erum við ekki að vinna rétt með client. Öll serie koma inn, flest season, en einungis um 90-100 episodes.

# Notendaupplýsingar

Tveir notendur eru búnir til í setup:

```
username: admin
password: 123

username: jennsara
password: 123
```
admin hefur réttindi stjórnanda en jennsara er venjulegur notandi.

# Vefþjónustur

Hægt er að senda beiðnir skv. forskrift á öll route skilgreind í index.js

T.d. skilar POST request á '/users/login' með body-inu {"username":"admin", "password":"123"}:
```
{
    "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@admin.com",
        "admin": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NDE5OTY0LCJleHAiOjE2MTcwMjQ3NjR9.me-rE6-MpVBbY7ctoEbld26YrC4-EHxt5Vix_zIrASc",
    "expiresIn": 604800
}
```
Í Postman er hægt að setja gildi token sem Type: Bearer token í Auth flipanum til að geta sent beiðnir sem admin.

Þá er t.d. hægt að senda POST request sem admin á '/tv' með body 

{ "name":"testSerie", "aired":"2000-12-12", "inProduction":true, "tagline":"test tagline", "thumbnail":"nice.jpg", "description":"test description", "language":"is", "network":"blablanetwork", "url":"bla.is"} 

til að búa til nýtt serie og það skilar:
```
{
    "id": 21,
    "name": "testSerie",
    "aired": "2000-12-12T00:00:00.000Z",
    "inproduction": true,
    "tagline": "test tagline",
    "thumbnail": "nice.jpg",
    "description": "test description",
    "language": "is",
    "network": "blablanetwork",
    "url": "bla.is"
}
```
