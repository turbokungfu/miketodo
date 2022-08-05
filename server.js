const express = require('express')//express parses json syntax
const app = express()//allows you to use express
const MongoClient = require('mongodb').MongoClient
const server = http.createServer(process.env.PORT || 2121) 
require('dotenv').config()

//naming database collection
let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'
//connecting to db console logging once connected

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })//allows you to use MongoDB's new connection mgmt sys.
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
    
//   
app.set('view engine', 'ejs')//able to view ejs files 
app.use(express.static('public'))//view css html
app.use(express.urlencoded({ extended: true })) //parses to strings
app.use(express.json())//parse .json - middleware

//get request to home page
app.get('/',async (request, response)=>{//
    const todoItems = await db.collection('todos').find().toArray()//find items and put them in array
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})//find incomplete items
    response.render('index.ejs', { items: todoItems, left: itemsLeft })//render the two files to ejs
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

app.post('/addTodo', (request, response) => {//create which will add todo item
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})//insertone item 
    .then(result => {//promisingto give result
        console.log('Todo Added')//returns console.log
        response.redirect('/')//reloads homepage
    })
    .catch(error => console.error(error))//returns if error
})

app.put('/markComplete', (request, response) => {//update to mark it as complete
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{//
        $set: {//updates or replaces a value 
            completed: true//makes it show completed
          }
    },{
        sort: {_id: -1},//sorts descending by id
        upsert: false//if item exists will update, if not will insert.
    })
    .then(result => {//if successful do this
        console.log('Marked Complete')//console.log
        response.json('Marked Complete')//send this message 
    })
    .catch(error => console.error(error))//error message

})

app.put('/markUnComplete', (request, response) => {//another update to mark incomplete.
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false//change from true to false
          }
    },{
        sort: {_id: -1},//resorts after the change
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.delete('/deleteItem', (request, response) => {//remove item from list
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})//delete item from list
    .then(result => {
        console.log('Todo Deleted')//send message
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))

})

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})