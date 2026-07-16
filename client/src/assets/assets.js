import logo from './logo.svg'
import marvelLogo from './marvelLogo.svg'
import googlePlay from './googlePlay.svg'
import appStore from './appStore.svg'
import screenImage from './screenImage.svg'
import profile from './profile.png'

export const assets = {
    logo,
    marvelLogo,
    googlePlay,
    appStore,
    screenImage,
    profile
}

export const dummyTrailers = [
    {
        image: "https://img.youtube.com/vi/WpW36ldAqnM/maxresdefault.jpg",
        videoUrl: 'https://www.youtube.com/watch?v=WpW36ldAqnM'
    },
    {
        image: "https://img.youtube.com/vi/-sAOWhvheK8/maxresdefault.jpg",
        videoUrl: 'https://www.youtube.com/watch?v=-sAOWhvheK8'
    },
    {
        image: "https://img.youtube.com/vi/1pHDWnXmK7Y/maxresdefault.jpg",
        videoUrl: 'https://www.youtube.com/watch?v=1pHDWnXmK7Y'
    },
    {
        image: "https://img.youtube.com/vi/umiKiW4En9g/maxresdefault.jpg",
        videoUrl: 'https://www.youtube.com/watch?v=umiKiW4En9g'
    },
]

const dummyCastsData = [
    { "name": "Milla Jovovich", "profile_path": "https://image.tmdb.org/t/p/original/usWnHCzbADijULREZYSJ0qfM00y.jpg", },
    { "name": "Dave Bautista", "profile_path": "https://image.tmdb.org/t/p/original/snk6JiXOOoRjPtHU5VMoy6qbd32.jpg", },
    { "name": "Arly Jover", "profile_path": "https://image.tmdb.org/t/p/original/zmznPrQ9GSZwcOIUT0c3GyETwrP.jpg", },
    { "name": "Amara Okereke", "profile_path": "https://image.tmdb.org/t/p/original/nTSPtzWu6deZTJtWXHUpACVznY4.jpg", },
    { "name": "Fraser James", "profile_path": "https://image.tmdb.org/t/p/original/mGAPQG2OKTgdKFkp9YpvCSqcbgY.jpg", },
    { "name": "Deirdre Mullins", "profile_path": "https://image.tmdb.org/t/p/original/lJm89neuiVlYISEqNpGZA5kTAnP.jpg", },
    { "name": "Sebastian Stankiewicz", "profile_path": "https://image.tmdb.org/t/p/original/hLN0Ca09KwQOFLZLPIEzgTIbqqg.jpg", },
    { "name": "Tue Lunding", "profile_path": "https://image.tmdb.org/t/p/original/qY4W0zfGBYzlCyCC0QDJS1Muoa0.jpg", },
    { "name": "Jacek Dzisiewicz", "profile_path": "https://image.tmdb.org/t/p/original/6Ksb8ANhhoWWGnlM6O1qrySd7e1.jpg", },
    { "name": "Ian Hanmore", "profile_path": "https://image.tmdb.org/t/p/original/yhI4MK5atavKBD9wiJtaO1say1p.jpg", },
    { "name": "Eveline Hall", "profile_path": "https://image.tmdb.org/t/p/original/uPq4xUPiJIMW5rXF9AT0GrRqgJY.jpg", },
    { "name": "Kamila Klamut", "profile_path": "https://image.tmdb.org/t/p/original/usWnHCzbADijULREZYSJ0qfM00y.jpg", },
    { "name": "Caoilinn Springall", "profile_path": "https://image.tmdb.org/t/p/original/uZNtbPHowlBYo74U1qlTaRlrdiY.jpg", },
    { "name": "Jan Kowalewski", "profile_path": "https://image.tmdb.org/t/p/original/snk6JiXOOoRjPtHU5VMoy6qbd32.jpg", },
    { "name": "Pawel Wysocki", "profile_path": "https://image.tmdb.org/t/p/original/zmznPrQ9GSZwcOIUT0c3GyETwrP.jpg", },
    { "name": "Simon Lööf", "profile_path": "https://image.tmdb.org/t/p/original/cbZrB8crWlLEDjVUoak8Liak6s.jpg", },
    { "name": "Tomasz Cymerman", "profile_path": "https://image.tmdb.org/t/p/original/nTSPtzWu6deZTJtWXHUpACVznY4.jpg", }
]

export const dummyShowsData = [
    {
        "_id": "324544",
        "id": 324544,
        "title": "In the Lost Lands",
        "trailer_url": "https://www.youtube.com/watch?v=FQv2ZepzXl4",
        "overview": "A queen sends the powerful and feared sorceress Gray Alys to the ghostly wilderness of the Lost Lands in search of a magical power, where she and her guide, the drifter Boyce, must outwit and outfight both man and demon.",
        "poster_path": "https://image.tmdb.org/t/p/original/dDlfjR7gllmr8HTeN6rfrYhTdwX.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/op3qmNhvwEvyT7UFyPbIfQmKriB.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 14, "name": "Fantasy" },
            { "id": 12, "name": "Adventure" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-02-27",
        "original_language": "en",
        "tagline": "She seeks the power to free her people.",
        "vote_average": 6.4,
        "vote_count": 15000,
        "runtime": 102,
    },
    {
        "_id": "1232546",
        "id": 1232546,
        "title": "Until Dawn",
        "trailer_url": "https://www.youtube.com/watch?v=Wj5itOAq4n0",
        "overview": "One year after her sister Melanie mysteriously disappeared, Clover and her friends head into the remote valley where she vanished in search of answers. Exploring an abandoned visitor center, they find themselves stalked by a masked killer and horrifically murdered one by one...only to wake up and find themselves back at the beginning of the same evening.",
        "poster_path": "https://image.tmdb.org/t/p/original/juA4IWO52Fecx8lhAsxmDgy3M3.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/icFWIk1KfkWLZnugZAJEDauNZ94.jpg",
        "genres": [
            { "id": 27, "name": "Horror" },
            { "id": 9648, "name": "Mystery" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-04-23",
        "original_language": "en",
        "tagline": "Every night a different nightmare.",
        "vote_average": 6.405,
        "vote_count": 18000,
        "runtime": 103,
    },
    {
        "_id": "552524",
        "id": 552524,
        "title": "Lilo & Stitch",
        "trailer_url": "https://www.youtube.com/watch?v=VWqJifMMgZE",
        "overview": "The wildly funny and touching story of a lonely Hawaiian girl and the fugitive alien who helps to mend her broken family.",
        "poster_path": "https://image.tmdb.org/t/p/original/mKKqV23MQ0uakJS8OCE2TfV5jNS.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg",
        "genres": [
            { "id": 10751, "name": "Family" },
            { "id": 35, "name": "Comedy" },
            { "id": 878, "name": "Science Fiction" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-05-17",
        "original_language": "en",
        "tagline": "Hold on to your coconuts.",
        "vote_average": 7.117,
        "vote_count": 27500,
        "runtime": 108,
    },
    {
        "_id": "668489",
        "id": 668489,
        "title": "Havoc",
        "trailer_url": "https://www.youtube.com/watch?v=bKeobsw79Nw",
        "overview": "When a drug heist swerves lethally out of control, a jaded cop fights his way through a corrupt city's criminal underworld to save a politician's son.",
        "poster_path": "https://image.tmdb.org/t/p/original/ubP2OsF3GlfqYPvXyLw9d78djGX.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/65MVgDa6YjSdqzh7YOA04mYkioo.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 80, "name": "Crime" },
            { "id": 53, "name": "Thriller" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-04-25",
        "original_language": "en",
        "tagline": "No law. Only disorder.",
        "vote_average": 6.537,
        "vote_count": 35960,
        "runtime": 107,
    },
    {
        "_id": "950387",
        "id": 950387,
        "title": "A Minecraft Movie",
        "trailer_url": "https://www.youtube.com/watch?v=wJO_vIDZn-I",
        "overview": "Four misfits find themselves struggling with ordinary problems when they are suddenly pulled through a mysterious portal into the Overworld: a bizarre, cubic wonderland that thrives on imagination. To get back home, they'll have to master this world while embarking on a magical quest with an unexpected, expert crafter, Steve.",
        "poster_path": "https://image.tmdb.org/t/p/original/yFHHfHcUgGAxziP1C3lLt0q2T4s.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/2Nti3gYAX513wvhp8IiLL6ZDyOm.jpg",
        "genres": [
            { "id": 10751, "name": "Family" },
            { "id": 35, "name": "Comedy" },
            { "id": 12, "name": "Adventure" },
            { "id": 14, "name": "Fantasy" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-03-31",
        "original_language": "en",
        "tagline": "Be there and be square.",
        "vote_average": 6.516,
        "vote_count": 15225,
        "runtime": 101,
    },
    {
        "_id": "575265",
        "id": 575265,
        "title": "Mission: Impossible - The Final Reckoning",
        "trailer_url": "https://www.youtube.com/watch?v=fsQgc9pCyDU",
        "overview": "Ethan Hunt and team continue their search for the terrifying AI known as the Entity — which has infiltrated intelligence networks all over the globe — with the world's governments and a mysterious ghost from Hunt's past on their trail. Joined by new allies and armed with the means to shut the Entity down for good, Hunt is in a race against time to prevent the world as we know it from changing forever.",
        "poster_path": "https://image.tmdb.org/t/p/original/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/1p5aI299YBnqrEEvVGJERk2MXXb.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 12, "name": "Adventure" },
            { "id": 53, "name": "Thriller" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-05-17",
        "original_language": "en",
        "tagline": "Our lives are the sum of our choices.",
        "vote_average": 7.042,
        "vote_count": 19885,
        "runtime": 170,
    },
    {
        "_id": "986056",
        "id": 986056,
        "title": "Thunderbolts*",
        "trailer_url": "https://www.youtube.com/watch?v=Oe61Le-kmow",
        "overview": "After finding themselves ensnared in a death trap, seven disillusioned castoffs must embark on a dangerous mission that will force them to confront the darkest corners of their pasts.",
        "poster_path": "https://image.tmdb.org/t/p/original/m9EtP1Yrzv6v7dMaC9mRaGhd1um.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/rthMuZfFv4fqEU4JVbgSW9wQ8rs.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 878, "name": "Science Fiction" },
            { "id": 12, "name": "Adventure" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-04-30",
        "original_language": "en",
        "tagline": "Everyone deserves a second shot.",
        "vote_average": 7.443,
        "vote_count": 23569,
        "runtime": 127,
    },{
        "_id": "1232546",
        "id": 1232546,
        "title": "Until Dawn",
        "trailer_url": "https://www.youtube.com/watch?v=Wj5itOAq4n0",
        "overview": "One year after her sister Melanie mysteriously disappeared, Clover and her friends head into the remote valley where she vanished in search of answers. Exploring an abandoned visitor center, they find themselves stalked by a masked killer and horrifically murdered one by one...only to wake up and find themselves back at the beginning of the same evening.",
        "poster_path": "https://image.tmdb.org/t/p/original/juA4IWO52Fecx8lhAsxmDgy3M3.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/icFWIk1KfkWLZnugZAJEDauNZ94.jpg",
        "genres": [
            { "id": 27, "name": "Horror" },
            { "id": 9648, "name": "Mystery" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-04-23",
        "original_language": "en",
        "tagline": "Every night a different nightmare.",
        "vote_average": 6.405,
        "vote_count": 18000,
        "runtime": 103,
    },
    {
        "_id": "872906",
        "id": 872906,
        "title": "Jawan",
        "trailer_url": "https://www.youtube.com/watch?v=COv52Qyctws",
        "overview": "A high-octane action thriller which outlines the emotional journey of a man who is set to rectify the wrongs in society. A prison warden recruits a band of women to fight injustice, while confronting a ruthless arms dealer and a ghost from his own past.",
        "poster_path": "https://image.tmdb.org/t/p/original/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 53, "name": "Thriller" },
            { "id": 80, "name": "Crime" }
        ],
        "casts": dummyCastsData,
        "release_date": "2023-09-07",
        "original_language": "hi",
        "tagline": "Ready to meet your father.",
        "vote_average": 7.0,
        "vote_count": 21000,
        "runtime": 169,
    },
    {
        "_id": "864692",
        "id": 864692,
        "title": "Pathaan",
        "trailer_url": "https://www.youtube.com/watch?v=iMWUxC3COwQ",
        "overview": "An Indian agent races against a doomsday clock as a ruthless mercenary, with a bruised past, makes an offer he can't refuse. Pathaan must come out of exile to stop a deadly plot that threatens the nation.",
        "poster_path": "https://image.tmdb.org/t/p/original/arf00BkwvXo0CFKbaD9OpqdE4Nu.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/arf00BkwvXo0CFKbaD9OpqdE4Nu.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 12, "name": "Adventure" },
            { "id": 53, "name": "Thriller" }
        ],
        "casts": dummyCastsData,
        "release_date": "2023-01-25",
        "original_language": "hi",
        "tagline": "A spy who never gives up.",
        "vote_average": 6.0,
        "vote_count": 18500,
        "runtime": 146,
    },
    {
        "_id": "1112426",
        "id": 1112426,
        "title": "Stree 2",
        "trailer_url": "https://www.youtube.com/watch?v=KVnheXywIbY",
        "overview": "The town of Chanderi is under a new terror: a supernatural entity that abducts its women. Vicky and his friends must once again confront the unknown to protect their home in this horror-comedy sequel.",
        "poster_path": "https://image.tmdb.org/t/p/original/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg",
        "genres": [
            { "id": 27, "name": "Horror" },
            { "id": 35, "name": "Comedy" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-08-15",
        "original_language": "hi",
        "tagline": "Sarkate ka aatank.",
        "vote_average": 7.2,
        "vote_count": 12000,
        "runtime": 149,
    },
    {
        "_id": "801688",
        "id": 801688,
        "title": "Kalki 2898-AD",
        "trailer_url": "https://www.youtube.com/watch?v=kQDd1AhGIHk",
        "overview": "In a dystopian future set in the year 2898 AD, a bounty hunter and a band of rebels rise to defend a pregnant woman whose unborn child is prophesied to end a tyrannical empire, blending mythology with science fiction on an epic scale.",
        "poster_path": "https://image.tmdb.org/t/p/original/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg",
        "genres": [
            { "id": 878, "name": "Science Fiction" },
            { "id": 28, "name": "Action" },
            { "id": 12, "name": "Adventure" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-06-27",
        "original_language": "hi",
        "tagline": "The beginning of the end.",
        "vote_average": 7.0,
        "vote_count": 16000,
        "runtime": 181,
    },
    {
        "_id": "1196943",
        "id": 1196943,
        "title": "Chhaava",
        "trailer_url": "https://www.youtube.com/watch?v=77vRyWNqZjM",
        "overview": "The story of Chhatrapati Sambhaji Maharaj, who led the Maratha resistance against Aurangzeb's Mughal forces. A sweeping historical epic of valour, sacrifice and an empire's defiant fight for freedom.",
        "poster_path": "https://image.tmdb.org/t/p/original/ubRsrzb6NRW8YhVTJ6jG1kpNvCi.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/ubRsrzb6NRW8YhVTJ6jG1kpNvCi.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 18, "name": "Drama" },
            { "id": 36, "name": "History" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-02-14",
        "original_language": "hi",
        "tagline": "The lion's roar.",
        "vote_average": 7.3,
        "vote_count": 11000,
        "runtime": 161,
    },
    {
        "_id": "579974",
        "id": 579974,
        "title": "RRR",
        "trailer_url": "https://www.youtube.com/watch?v=f_vbAtFSEc0",
        "overview": "A fictional history of two legendary revolutionaries and their journey away from home before they began fighting for their country in the 1920s. A tale of friendship, fire and revolution against the British Raj.",
        "poster_path": "https://image.tmdb.org/t/p/original/u0XUBNQWlOvrh0Gd97ARGpIkL0.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/i0Y0wP8H6SRgjr6QmuwbtQbS24D.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 18, "name": "Drama" },
            { "id": 12, "name": "Adventure" }
        ],
        "casts": dummyCastsData,
        "release_date": "2022-03-24",
        "original_language": "te",
        "tagline": "Rise. Roar. Revolt.",
        "vote_average": 7.8,
        "vote_count": 32000,
        "runtime": 187,
    },
    {
        "_id": "337339",
        "id": 337339,
        "title": "Baahubali 2: The Conclusion",
        "trailer_url": "https://www.youtube.com/watch?v=G62HrubdD6o",
        "overview": "When Shiva, the son of Baahubali, learns about his heritage, he begins to look for answers. His story is juxtaposed with past events that unfolded in the Mahishmati Kingdom, culminating in an epic battle for the throne.",
        "poster_path": "https://image.tmdb.org/t/p/original/21sC2assImQIYCEDA84Qh9d1RsK.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/whNjsTOUVg2lZLCKgGhnACnmV8E.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 18, "name": "Drama" },
            { "id": 14, "name": "Fantasy" }
        ],
        "casts": dummyCastsData,
        "release_date": "2017-04-28",
        "original_language": "te",
        "tagline": "Why did Kattappa kill Baahubali?",
        "vote_average": 7.5,
        "vote_count": 20000,
        "runtime": 167,
    },
    {
        "_id": "1078600",
        "id": 1078600,
        "title": "12th Fail",
        "trailer_url": "https://www.youtube.com/watch?v=qtcrQomcrIA",
        "overview": "Based on a true story, an honest young man from a village in the Chambal valley fights corruption and crushing poverty to clear one of the toughest exams in the country and become an IPS officer.",
        "poster_path": "https://image.tmdb.org/t/p/original/eebUPRI4Z5e1Z7Hev4JZAwMIFkX.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/6RV2o8PBCEyw9ylOWViV1CtULIF.jpg",
        "genres": [
            { "id": 18, "name": "Drama" }
        ],
        "casts": dummyCastsData,
        "release_date": "2023-10-27",
        "original_language": "hi",
        "tagline": "Restart.",
        "vote_average": 8.0,
        "vote_count": 5200,
        "runtime": 147,
    },
    {
        "_id": "550227",
        "id": 550227,
        "title": "Gully Boy",
        "trailer_url": "https://www.youtube.com/watch?v=JfbxcD6biOk",
        "overview": "A coming-of-age story of an aspiring street rapper from the slums of Mumbai, who finds his voice and rises above his circumstances through hip-hop, hope and raw talent.",
        "poster_path": "https://image.tmdb.org/t/p/original/4RE7TD5TqEXbPKyUHcn7CSeMlrJ.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/gcZbciueHH7WmD03GcVZX7LYqmR.jpg",
        "genres": [
            { "id": 18, "name": "Drama" },
            { "id": 10402, "name": "Music" }
        ],
        "casts": dummyCastsData,
        "release_date": "2019-02-14",
        "original_language": "hi",
        "tagline": "Apna time aayega.",
        "vote_average": 7.7,
        "vote_count": 8300,
        "runtime": 154,
    },
    {
        "_id": "296942",
        "id": 296942,
        "title": "Bajrangi Bhaijaan",
        "trailer_url": "https://www.youtube.com/watch?v=4nwAra0mz_Q",
        "overview": "A devoted man with a magnanimous heart takes a young mute Pakistani girl, separated from her mother in India, on a cross-border journey to reunite her with her family.",
        "poster_path": "https://image.tmdb.org/t/p/original/vhlliI7HZZlWfo5d6CiyfBAGLrW.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/n9QCm8uagvmXH476u5qFQsW8HkU.jpg",
        "genres": [
            { "id": 35, "name": "Comedy" },
            { "id": 18, "name": "Drama" }
        ],
        "casts": dummyCastsData,
        "release_date": "2015-07-17",
        "original_language": "hi",
        "tagline": "A heart that knows no borders.",
        "vote_average": 7.7,
        "vote_count": 11500,
        "runtime": 163,
    },
    {
        "_id": "24238",
        "id": 24238,
        "title": "Sholay",
        "trailer_url": "https://www.youtube.com/watch?v=zzTUvWfvlBg",
        "overview": "After his family is murdered by a notorious bandit, a former police officer enlists the services of two outlaws to capture the ruthless dacoit in this timeless classic of Indian cinema.",
        "poster_path": "https://image.tmdb.org/t/p/original/ya9bwgqA4eNl5bQ9QqS0jcmRoBS.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/8aYAfAPolsRFrHbP1rafeSgg2Ew.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 12, "name": "Adventure" },
            { "id": 18, "name": "Drama" }
        ],
        "casts": dummyCastsData,
        "release_date": "1975-08-15",
        "original_language": "hi",
        "tagline": "The greatest star cast ever assembled.",
        "vote_average": 8.0,
        "vote_count": 4200,
        "runtime": 204,
    },
    {
        "_id": "316042",
        "id": 316042,
        "title": "Baahubali: The Beginning",
        "trailer_url": "https://www.youtube.com/watch?v=3NQRhE772b0",
        "overview": "In the kingdom of Mahishmati, a young man raised by tribal villagers learns of his royal lineage and the epic struggle for the throne, setting him on a path to reclaim his legacy.",
        "poster_path": "https://image.tmdb.org/t/p/original/9BAjt8nSSms62uOVYn1t3C3dVto.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/e9ZEuHGHZ06AToHlfN1L7nejJ7W.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 18, "name": "Drama" },
            { "id": 14, "name": "Fantasy" }
        ],
        "casts": dummyCastsData,
        "release_date": "2015-07-10",
        "original_language": "te",
        "tagline": "The rise of a legend.",
        "vote_average": 7.3,
        "vote_count": 14000,
        "runtime": 159,
    },
    {
        "_id": "1096763",
        "id": 1096763,
        "title": "Gadar 2",
        "trailer_url": "https://www.youtube.com/watch?v=gq_8E9QVWCE",
        "overview": "Set against the backdrop of the 1971 Indo-Pak war, Tara Singh crosses the border once again into Pakistan to bring his son home, in an emotional saga of love, family and sacrifice.",
        "poster_path": "https://image.tmdb.org/t/p/original/brCBYKGQaxZZcwmFF6OIxZLdKVU.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/51jVHbIvlRhX6BaMq4YTZKN5DXe.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 18, "name": "Drama" }
        ],
        "casts": dummyCastsData,
        "release_date": "2023-08-11",
        "original_language": "hi",
        "tagline": "The katha continues.",
        "vote_average": 6.5,
        "vote_count": 3600,
        "runtime": 170,
    },
    {
        "_id": "1058637",
        "id": 1058637,
        "title": "Rocky Aur Rani Kii Prem Kahaani",
        "trailer_url": "https://www.youtube.com/watch?v=6mdxy3zohEk",
        "overview": "A flamboyant Punjabi man and a refined Bengali journalist fall in love, then swap families for three months to prove their bond can survive their wildly different worlds.",
        "poster_path": "https://image.tmdb.org/t/p/original/vTQIqlxUkOuyf2UKhlM2OUaFGKz.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/bPrIYmPFFf7iOnbroy3bpN8iiK1.jpg",
        "genres": [
            { "id": 35, "name": "Comedy" },
            { "id": 18, "name": "Drama" },
            { "id": 10749, "name": "Romance" }
        ],
        "casts": dummyCastsData,
        "release_date": "2023-07-28",
        "original_language": "hi",
        "tagline": "Opposites attract.",
        "vote_average": 6.8,
        "vote_count": 3100,
        "runtime": 168,
    },
    {
        "_id": "1258971",
        "id": 1258971,
        "title": "Laapataa Ladies",
        "trailer_url": "https://www.youtube.com/watch?v=hGM87LCJxRc",
        "overview": "In rural India, two young brides are accidentally swapped on a train journey, sparking a warm, funny and unexpectedly moving chain of events that upends everyone's lives.",
        "poster_path": "https://image.tmdb.org/t/p/original/yXt07MYeiyQRzS69PMHy0BPjCGP.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/uUVXEEyMsyWxrcbmAppUCYg6egV.jpg",
        "genres": [
            { "id": 35, "name": "Comedy" },
            { "id": 18, "name": "Drama" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-03-01",
        "original_language": "hi",
        "tagline": "Two brides, one journey, endless surprises.",
        "vote_average": 8.2,
        "vote_count": 2400,
        "runtime": 122,
    },
    {
        "_id": "656908",
        "id": 656908,
        "title": "Ramayana",
        "status": "coming_soon",
        "trailer_url": "https://www.youtube.com/watch?v=3-wSEehDBVk",
        "overview": "An ancient epic follows a young prince and princess whose marriage and exile mark the beginning of a legendary journey, as Ram confronts the demon king Ravana in the grandest retelling of India's timeless story.",
        "poster_path": "https://image.tmdb.org/t/p/original/f3yZZw7zIsWo6m9xJStfjDauIZX.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/yHVZncPRZr63mezRX20IyKLrSkv.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 14, "name": "Fantasy" },
            { "id": 18, "name": "Drama" }
        ],
        "casts": dummyCastsData,
        "release_date": "2026-11-08",
        "original_language": "hi",
        "tagline": "Our truth. Our history.",
        "vote_average": 0,
        "vote_count": 0,
        "runtime": 180,
    },
    {
        "_id": "1145110",
        "id": 1145110,
        "title": "King",
        "status": "coming_soon",
        "trailer_url": "https://www.youtube.com/watch?v=Uu2QK9Z9X5E",
        "overview": "A mentor and disciple embark on a perilous journey, pushing their survival skills to the limit against overwhelming odds — Shah Rukh Khan's most anticipated action avatar yet.",
        "poster_path": "https://image.tmdb.org/t/p/original/74fHULlTBMGGLusfFBVAkMAZbce.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/tInyP783MTHruydmJMSo7mfag1U.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 53, "name": "Thriller" }
        ],
        "casts": dummyCastsData,
        "release_date": "2026-12-24",
        "original_language": "hi",
        "tagline": "It's showtime.",
        "vote_average": 0,
        "vote_count": 0,
        "runtime": 165,
    },
    {
        "_id": "1213243",
        "id": 1213243,
        "title": "Toxic: A Fairy Tale for Grown-Ups",
        "status": "coming_soon",
        "trailer_url": "https://www.youtube.com/watch?v=cXymbHU5i-U",
        "overview": "Yash stars in a dual role in this period gangster epic — one of the most expensive Indian films ever made — alongside Kiara Advani and Nayanthara.",
        "poster_path": "https://image.tmdb.org/t/p/original/fJBAfLiNfovSAb6KjkIndpF3Sm7.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/tBRSSfgqOAq7YlG8udcoJIBm2FG.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 53, "name": "Thriller" }
        ],
        "casts": dummyCastsData,
        "release_date": "2026-08-26",
        "original_language": "kn",
        "tagline": "A fairy tale for grown-ups.",
        "vote_average": 0,
        "vote_count": 0,
        "runtime": 195,
    },
    {
        "_id": "920708",
        "id": 920708,
        "title": "Varanasi",
        "status": "coming_soon",
        "trailer_url": "https://www.youtube.com/watch?v=0oIvIwJ3qKg",
        "overview": "S.S. Rajamouli's time-spanning epic follows Rudhra's perilous adventures across timelines and continents as ancient Varanasi stands on the brink of catastrophe, with Mahesh Babu in a dual role.",
        "poster_path": "https://image.tmdb.org/t/p/original/9XHgX5XEQt95nwZIlp2yiMaw65D.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/iZbZjYflt859q8hR7bsvApeDLr5.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 12, "name": "Adventure" },
            { "id": 14, "name": "Fantasy" }
        ],
        "casts": dummyCastsData,
        "release_date": "2027-04-07",
        "original_language": "te",
        "tagline": "The divine justice.",
        "vote_average": 0,
        "vote_count": 0,
        "runtime": 180,
    },
    {
        "_id": "881903",
        "id": 881903,
        "title": "Spirit",
        "status": "coming_soon",
        "trailer_url": "https://www.youtube.com/watch?v=d5i1QHVqRjY",
        "overview": "Sandeep Reddy Vanga directs Prabhas as a brutal but honest IPS officer on a mission to dismantle a drug ring, with Triptii Dimri and Vivek Oberoi.",
        "poster_path": "https://image.tmdb.org/t/p/original/5N3e8nCYZdOyEyh1IuQDdkKF9sQ.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/yzu6Gb2fbC8GPxSKIn9BAHt9hFw.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 80, "name": "Crime" },
            { "id": 18, "name": "Drama" }
        ],
        "casts": dummyCastsData,
        "release_date": "2027-03-05",
        "original_language": "te",
        "tagline": "A wounded lion is still a lion.",
        "vote_average": 0,
        "vote_count": 0,
        "runtime": 170,
    }
]

// Offline fallback showtimes — generated relative to "today" so the booking UI
// always shows live, selectable future dates even without a backend.
export const dummyDateTimeData = (() => {
    const data = {}
    const hours = [13, 16, 19] // 1 PM, 4 PM, 7 PM local
    for (let day = 1; day <= 5; day++) {
        const d = new Date()
        d.setDate(d.getDate() + day)
        const dateKey = d.toISOString().split('T')[0]
        data[dateKey] = hours.map((h, i) => {
            const t = new Date(d)
            t.setHours(h, 0, 0, 0)
            return { time: t.toISOString(), showId: `sample-${dateKey}-${i}` }
        })
    }
    return data
})()

export const dummyDashboardData = {
    "totalBookings": 14,
    "totalRevenue": 1517,
    "totalUser": 5,
    "activeShows": [
        {
            "_id": "68352363e96d99513e4221a4",
            "movie": dummyShowsData[0],
            "showDateTime": "2025-06-30T02:30:00.000Z",
            "showPrice": 59,
            "occupiedSeats": {
                "A1": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "B1": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "C1": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok"
            },
        },
        {
            "_id": "6835238fe96d99513e4221a8",
            "movie": dummyShowsData[1],
            "showDateTime": "2025-06-30T15:30:00.000Z",
            "showPrice": 81,
            "occupiedSeats": {},
        },
        {
            "_id": "6835238fe96d99513e4221a9",
            "movie": dummyShowsData[2],
            "showDateTime": "2025-06-30T03:30:00.000Z",
            "showPrice": 81,
            "occupiedSeats": {},
        },
        {
            "_id": "6835238fe96d99513e4221aa",
            "movie": dummyShowsData[3],
            "showDateTime": "2025-07-15T16:30:00.000Z",
            "showPrice": 81,
            "occupiedSeats": {
                "A1": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "A2": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "A3": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "A4": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok"
            },
        },
        {
            "_id": "683682072b5989c29fc6dc0d",
            "movie": dummyShowsData[4],
            "showDateTime": "2025-06-05T15:30:00.000Z",
            "showPrice": 49,
            "occupiedSeats": {
                "A1": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "A2": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "A3": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "B1": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "B2": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok",
                "B3": "user_2xO4XPCgWWwWq9EHuQxc5UWqIok"
            },
            "__v": 0
        },
        {
            "_id": "68380044686d454f2116b39a",
            "movie": dummyShowsData[5],
            "showDateTime": "2025-06-20T16:00:00.000Z",
            "showPrice": 79,
            "occupiedSeats": {
                "A1": "user_2xl7eCSUHddibk5lRxfOtw9RMwX",
                "A2": "user_2xl7eCSUHddibk5lRxfOtw9RMwX"
            }
        }
    ]
}


export const dummyBookingData = [
    {
        "_id": "68396334fb83252d82e17295",
        "user": { "name": "GreatStack", },
        "show": {
            _id: "68352363e96d99513e4221a4",
            movie: dummyShowsData[0],
            showDateTime: "2025-06-30T02:30:00.000Z",
            showPrice: 59,
        },
        "amount": 98,
        "bookedSeats": ["D1", "D2"],
        "isPaid": false,
    },
    {
        "_id": "68396334fb83252d82e17295",
        "user": { "name": "GreatStack", },
        "show": {
            _id: "68352363e96d99513e4221a4",
            movie: dummyShowsData[0],
            showDateTime: "2025-06-30T02:30:00.000Z",
            showPrice: 59,
        },
        "amount": 49,
        "bookedSeats": ["A1"],
        "isPaid": true,
    },
    {
        "_id": "68396334fb83252d82e17295",
        "user": { "name": "GreatStack", },
        "show": {
            _id: "68352363e96d99513e4221a4",
            movie: dummyShowsData[0],
            showDateTime: "2025-06-30T02:30:00.000Z",
            showPrice: 59,
        },
        "amount": 147,
        "bookedSeats": ["A1", "A2","A3"],
        "isPaid": true,
    },
]