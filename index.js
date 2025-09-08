const path = require("path");
const express = require("express");

const { connectToMongoDB } = require("./connection");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middleware/auth");
const Blog = require("./models/blog")

const app = express();

const PORT = 4002;

//routes
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

//connection
connectToMongoDB("mongodb://localhost:27017/blogify");

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve('public')));



app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));



app.get("/", async(req, res) => {

    const allBlogs = await Blog.find({});
    res.render("home", {
        user: req.user,
        blogs: allBlogs,
    });
})

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));