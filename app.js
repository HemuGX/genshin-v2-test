const env = require('dotenv').config()
const express = require ("express");
const ejs = require ("ejs")
const bodyParser = require ("body-parser");
const mongoose = require("mongoose")
const session = require("express-session")
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose")


const app = express()

// SESSION
const oneDay = 1000 * 60 * 60 * 24;

app.use(session({
    secret: "My password",
    resave: false,
    cookie: {
        maxAge: oneDay
    },
    saveUninitialized: false

}))

app.use(passport.initialize());
app.use(passport.session())

// MONGOOSE

mongoose.connect(process.env.DB)

const userSchema = new mongoose.Schema({
    username: String,
    password:String,
})
const daysScehma = new mongoose.Schema ({
  day: String
})

const characterSchema = new mongoose.Schema({
  name: String,
  vision:String,
  talentBooks: String,
  image: String
})

const talentbookSchema = new mongoose.Schema({
    name: String,
    characters: [characterSchema],
    talent_book_image: String,
    days_active: [String]
})





userSchema.plugin(passportLocalMongoose)
const User = mongoose.model("User", userSchema)
const Character = mongoose.model("Character", characterSchema)
const Book = mongoose.model("Book", talentbookSchema)
const Day = mongoose.model("Day", daysScehma)


app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({
    extended: true
}))

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req,res)=> {
    res.send('Hey')
})

// app.get("/",(req,res) => {
//   let options = {
//     weekday: 'long',
//     timeZone: 'Asia/Baku'
// };
// const day = new Date().toLocaleString("en-US", options)

// if(day === "Monday" || day === "Thursday") {

// Book.find({"days_active": "Monday" || "Thursday"},(err,foundBooks) => {
//   if(!err) {
//     res.render("home",{talentBooks: foundBooks,talentCharacters:foundBooks.characters})
//   }
//  })


// } else if(day === "Friday" || day === "Tuesday") {


//   Book.find({"days_active": "Friday" || "Tuesday"},(err,foundBooks) => {
//   if(!err) {
//     console.log(foundBooks[0].characters)
//     res.render("home",{talentBooks: foundBooks,talentCharacters:foundBooks[1].characters})
//   }
//  })

// } else if (day === "Wednesday" || day === "Saturday") {
//   Book.find({"days_active": "Wednesday" || "Saturday"},(err,foundBooks) => {
//     if(!err) {
//       res.render("home",{talentBooks: foundBooks,talentCharacters:foundBooks.characters})
//     }
//    })
// }
// else {
//   console.log("Error")
// }
// })


app.get("/register", (req, res) => {
    if (req.isAuthenticated()) {
      res.redirect("/")
    } else {
      res.render("register")
    }
  })

app.post("/register", (req, res) => {
    User.register({
      username: req.body.username
    }, req.body.password, (err, newUser) => {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/")
        })
      }
    })
  })



  app.get("/login", (req, res) => {


    if (req.isAuthenticated()) {
      
      res.redirect("/")
      console.log("logged in");
    } else {
      res.render("login")
    }
  
  })
  
  
  app.post("/login", (req, res) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password
    })
  
    req.login(user, (err) => {
      if (!err) {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/")
        })
      }
    })
  })
//////LOG OUT//////


app.get("/logout", (req, res) => {
  req.logout(function(err) {
    if(err) {
      console.log(err);
    } else {
      res.redirect("/")
    }
  })

})

app.post("/add-character",(req,res) => {
  const newCharName = req.body.new_character_name
  const newCharVision =  req.body.new_character_vision
  const newCharImage = req.body.new_character_image
  const newCharTalentBook =  req.body.new_character_talent_book
  const newCharacter = new Character({
    name: newCharName,
    vision: newCharVision,
    books: newCharTalentBook,
    image: newCharImage
    
  })

  console.log(req.body)


  newCharacter.save()
  res.status(204).send();
})
app.post("/add-talent-book",(req,res) => {
  
  const selectedCharacters = req.body.characters
  // const characters = []

  if(Array.isArray(selectedCharacters)) {
    selectedCharacters.forEach((character) => {
      Character.findOne({name: character},(err,foundCharacter) => {
        characters.push(foundCharacter)

        const newTalBookName = req.body.new_talent_book_name
        const newTalBookImage = req.body.new_talent_book_image
        const newTalBookDays = req.body.days_active
     
  
      if(characters.length === selectedCharacters.length) {
        const newTalBookName = req.body.new_talent_book_name
        const newTalBookImage = req.body.new_talent_book_image
        const newTalBookDays = req.body.days_active
        const newBook = new Book ({
          name: newTalBookName,
          characters: characters,
          talent_book_image: newTalBookImage,
          days_active: newTalBookDays
          
        })
  
        newBook.save()
      } else {
       console.log("Not Equal")
      }
    })
    })
  } else {
        const newTalBookName = req.body.new_talent_book_name
        const newTalBookImage = req.body.new_talent_book_image
        const newTalBookDays = req.body.days_active
    Character.findOne({name: selectedCharacters},(err,foundCharacter) => {
      characters.push(foundCharacter)
      const newBook = new Book ({
        name: newTalBookName,
        characters: characters,
        talent_book_image: newTalBookImage,
        days_active: newTalBookDays
        
      })

      newBook.save()
  })
    
  }
  res.status(204).send();
})
app.get("/admin",(req,res) => {
  Book.find({},function(err,foundBooks) {
    if(!err) {
      Character.find({},function(err,foundCharacters) {
        if(!err) {
          Day.find({},(err,foundDays) => {
            if(!err) {
              res.render("admin",{books:foundBooks,characters:foundCharacters,days:foundDays})
            }
          })
          // console.log(foundCharacters)
          
        }
        
      })
      
    }
  })
   
})

app.get("/primogems",(req,res) => {
    res.render("primogems")
})




app.listen(process.env.PORT||3000,(req,res) => {
    console.log("Server is running!");
})