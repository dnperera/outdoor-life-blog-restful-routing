var express  = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var app = express();
var ip = process.env.IP || '127.0.0.1';
var port = process.env.PORT || 3000;

//connect to db
mongoose.connect("mongodb://localhost/blog_app_restful");

//set up view Engine
app.set("view engine", "ejs");

//set up path to static assests
app.use(express.static("public"));

//set the body parser for request
app.use( bodyParser.urlencoded({extended: true}));

// define schema for the blog
var blogSchema = new mongoose.Schema({
	title:String,
	image:String,
	content:String,
	createdAt:{ type: Date, default: Date.now }
});

//create the model for mongo
var Blog = mongoose.model( "Blog",blogSchema );

// Blog.create({
// 	title:'Day Hike in Muir Woods National Park',
// 	image :'https://img.vimbly.com/images/full_photos/muir-woods-26.jpg',
// 	content:'Muir Woods National Monument is part of California’s Golden Gate National Recreation Area, north of San Francisco. It’s known for its towering old-growth redwood trees. Trails wind among the trees to Cathedral Grove and Bohemian Grove, and along Redwood Creek. The Ben Johnson and Dipsea trails climb a hillside for views of the treetops, the Pacific Ocean and Mount Tamalpais in adjacent Mount Tamalpais State Park.'
// },function( error, data ){
// 	if( error ) {
// 		console.log(error);
// 	} else {
// 		console.log('Blog post saved !');
// 		console.log(data);
// 	}
// });

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

//create post route 
app.post("/blogs" ,function (req, res) {
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

//show blog post
app.get("/blogs/:id", function( req,res ) {
	console.log(req.params.id);
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

app.listen( port,ip ,function (){
	console.dir(`Server is running at port ${ port }`);
});