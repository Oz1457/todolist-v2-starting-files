//jshint esversion:6
 
const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash");
 
const mongoose = require("mongoose");
const { strict } = require("assert");
const app = express();

require('dotenv').config();
const uri = process.env.MONGODB_URI;

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
 
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

// this code connects your server to a localhost
// mongoose.connect("mongodb://127.0.0.1:27018/todolistDB" );

// this code connects your code to mongoDB's atlas cluster that you made
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

// mongoose (Schema)
const itemsSchema = {
  name: String,
};

const listSchema = {
  name: String,
  items:[itemsSchema]
};

// mongooes (model)
const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List" ,listSchema);


const item1 = new Item({
  name: "Welcome to your TO do list",
});
const item2 = new Item({
  name: "Hit the + to your ToDoList",
});
const item3 = new Item({
  name: "<-- hit this to delete an item",
});
 
const defaultItems = [item1, item2, item3];
 
app.get("/", function (req, res) {
 
 
  //printing all store values in terminal (In my case Hyper Terminal)
  Item.find({})
    .then(foundItem => {
      if (foundItem.length === 0) {
        return Item.insertMany(defaultItems);
      } else {
        return foundItem;
      }
    })
    .then(savedItem => {
      res.render("list", {
        listTitle: "Today",
        newListItems: savedItem
      });
    })
    .catch(err => console.log(err));
 
});



app.get("/:customListName", function (req,res) {
  const customList = _.capitalize(req.params.customListName);

  List.findOne({name : customList})
    .then(function(foundList) {
      if (!foundList) {

        console.log("doesn't exist");

        const list = new List ({
          name: customList,
          items: defaultItems
        });

        return list.save();

      } else {
        console.log("exist");
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    })
    .then(function(savedList) {
      res.redirect("/" + savedList.name);
    })
    .catch(function(err) {
      console.log(err);
    });
});
 
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item ({
    name : itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name : listName})
    .then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});



app.post("/delete", async (req, res) =>{
  const checkedItemId = req.body.delete;
  const listName = req.body.listName;

  if (listName === "Today"){
    try {
      await Item.deleteOne({_id: checkedItemId});
    }
    catch (error) {
      console.error(error);
    }
    finally {
      res.redirect("/");
    }
  }else{
    List.findOneAndUpdate({name : listName}, {$pull:{items : {_id : checkedItemId}}})
    .then(function(foundList){
      res.redirect("/" + listName);
    })
  }

});

app.get("/work", function (req, res) {
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});
 
app.get("/about", function (req, res) {
  res.render("about");
});
 
app.listen(PORT, function () {
  console.log("Server started on port 3000");
});