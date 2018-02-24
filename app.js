var express  = require("express");
var bodyParser = require("body-parser");
var methodOverride = require('method-override')
var mongoose = require("mongoose");
var expressSanitizer = require('express-sanitizer');

var app = express();
var ip = process.env.IP || '127.0.0.1';
var port = process.env.PORT || 3000;

//connect to db
mongoose.connect("mongodb://localhost/blog_app_restful");

//set up view Engine
app.set("view engine", "ejs");

//set up path to static assests
app.use(express.static("public"));

// setup method overide for request
app.use(methodOverride("_method"))

//set the body parser for request
app.use( bodyParser.urlencoded({extended: true}));

// Mount express-sanitizer here
app.use(expressSanitizer()); // this line follows bodyParser() instantiations

// define schema for the blog
var blogSchema = new mongoose.Schema({
	title:String,
	image:String,
	content:String,
	createdAt:{ type: Date, default: Date.now }
});

//create the model for mongo
var Blog = mongoose.model( "Blog",blogSchema );

//RESTFULL Routes
app.get("/", function ( req, res ){
	res.redirect("/blogs")
});

app.get("/blogs",function(req,res) {
	Blog.find({},function ( error ,data ){
		if( error ) {
			console.log(error);
		} else {
			res.render("index", {blogs:data});
		}
	});
});

//new post route
app.get("/blogs/new" ,function( req,res ) {
	res.render("new");
});

//Create post route 
app.post("/blogs" ,function (req, res) {
	//sanatize the content
	req.body.blog.content = req.sanatize(req.body.blog.content);
	//save new blog to mongo
	Blog.create(req.body.blog , function( error,data ){
		if( error ) {
			res.render("new");
			console.log(error);
		} else {
			//redirect to index page
			res.redirect("/blogs")
		}
	});
});

//Show blog post
app.get("/blogs/:id", function( req,res ) {
	//Find and get selected blog post details.
	Blog.findById(req.params.id ,function( error, blogPost ) {
		if( error ) {
			res.redirect("/blogs");
			console.log(error);
		} else {
			//display details blog post
			res.render("show",{ blog:blogPost } );
		}
	});
});

//Edit blog post route
app.get("/blogs/:id/edit",function( req,res ){
	//Get the blog post related to given id
	Blog.findById(req.params.id , function( error,blogPost ){
		if(error){
			console.log( error);
			res.redirect("/blogs");
		} else {
			res.render( "edit" ,{ blog:blogPost});
		}
	});
});


//Update blog post route
app.put("/blogs/:id",function( req,res ){
	//sanatize the content
	req.body.blog.content = req.sanatize(req.body.blog.content);
	
	//Update the blog post in db
	Blog.findByIdAndUpdate( req.params.id,req.body.blog,function( error,updatedPost){
		if( error ) {
			console.log(error);
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/"+req.params.id);
		}
	});
});

//Delete blog post route
app.delete("/blogs/:id", function( req,res ){
	//Delete the post
	Blog.findByIdAndRemove(req.params.id, function( error){
		if( error) {
			console.log(error);
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});

app.listen( port,ip ,function (){
	console.dir(`Server is running at port ${ port }`);
});