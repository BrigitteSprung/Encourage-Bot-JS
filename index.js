const Discord = require("discord.js")
const fetch = require("node-fetch")

const keepAlive = require("./server")

const Database = require("@replit/database")

const db = new Database()
const client = new Discord.Client()


const sadWords = ["sad", "depressed", "unhappy", "angry"]

const starterEncouragements = [
  "Cheer up!",
  "Hang in there.",
  "You are a great person / bot!"
]

db.get("encouragements").then(encouragements => {
  // first time this runs e could be null, later it could be 0
  if (!encouragements || encouragements.length < 1) {
    db.set("encouragements", starterEncouragements)
  }
})

db.get("responding").then(value => {
  if (value==null) {
    db.set("responding", true)
  }
})

function updateEncouragements(encouragingMessage) {
  db.get("encouragements").then(encouragements => {
    encouragements.push([encouragingMessage])
    db.set("encouragements", encouragements)
  })
}

function deleteEncouragement(index) {
  db.get("encouragements").then(encouragements => {
    if (encouragements.length > index) {
      encouragements.splice(index, 1)
      db.set("encouragements", encouragements)
    } 
  })
}

// This is an asynchronous call
function getQuote() {
  return fetch("https://zenquotes.io/api/random")
    .then(res => {
      return res.json()
    })
    .then(data => {
      // q = quote, a = author
      return data[0]["q"] + "-" + data[0]["a"]
    })
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", msg => {
  if (msg.author.bot) return

  if (msg.content === "$inspire") {
    getQuote().then(quote => msg.channel.send(quote))
  }

  db.get("responding").then(responding => {
      // Will send a single encouragement if the message contains a sad word
    if (responding && sadWords.some(word => msg.content.includes(word))) {
      // Get encouragements from our database
      db.get("encouragements").then(encouragements => {
        const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
        msg.reply(encouragement)
      }) 
    }
  })

  // Allow bot to use update function
  if (msg.content.startsWith("$new")) {
    // Split msg at $new. Has to have a space at the end.
    encouragingMessage = msg.content.split("$new ")[1]
    updateEncouragements(encouragingMessage)
    msg.channel.send("New encouraging message added.")
  }
   // Allow bot to use delete function
  if (msg.content.startsWith("$del")) {
    // Split msg at $new. Has to have a space at the end.
    index = parseInt (msg.content.split("$del ")[1])
    deleteEncouragement(index)
    msg.channel.send("Encouraging message deleted.")
  }
  // Get all encouragements
  if (msg.content.startsWith("$list")) {
    db.get("encouragements").then(encouragements => {
      msg.channel.send(encouragements)
    })
  }
  // Switch bot on and off
  if (msg.content.startsWith("$responding")){
    value = msg.content.split("$responding ")[1]
    if (value.toLowerCase() == "true"){
      db.set("responding", true)
      msg.channel.send("Responding is on.")
    } else {
      db.set("responding", false)
      msg.channel.send("Responding is off.")
    }
  }
})

// Makes it continually run.
// Monitored on UptimeRobot
keepAlive()
client.login(process.env.TOKEN)