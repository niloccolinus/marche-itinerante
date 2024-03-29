const { Post } = require("../models/postModel");
const fs = require("fs");
const del = require("del");
const cloudinary = require("cloudinary");

/* GET ALL POSTS */
const post_get_all = async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
};

/* GET POST BY ID */
const post_get_byID = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
};

/* CREATE POST */
const post_create = async (req, res) => {
  /* create a folder for future uploads */
  const numPosts = Number(req.query.numposts);
  fs.mkdir(
    __dirname + "./../views/static/uploads/posts" + `/post_${numPosts + 1}`,
    { recursive: true },
    () => {
      console.log("folder created");
    }
  );

  const newPost = new Post({
    title: req.body.title,
    date: req.body.date,
    content: req.body.content,
    author: req.body.author,
  });
  try {
    const savedPost = await newPost.save();
    res.status(200).redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).render("error", { message: err });
  }
};

/* UPDATE POST BY ID */
const post_update = async (req, res) => {
  try {
    await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        date: req.body.date,
        content: req.body.content,
        author: req.body.author,
      },
      { new: true }
    );
    res.status(200).redirect("/");
  } catch (err) {
    res.status(500).render("error", { message: err });
  }
};

/* DELETE POST BY ID */
const post_delete = async (req, res) => {
  try {
    const postIndex = Number(req.query.postindex) + 1;
    let selectedPost = await Post.findById(req.params.id);
    let imagesArray = selectedPost.images;
    imagesArray.forEach(async (image) => {
      console.log(image.publicId);
      await cloudinary.uploader.destroy(image.publicId, (err, res) => {
        console.log(err, res);
      });
    });

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).render("error", {
      message: "La suppression a échoué. Veuillez réessayer.",
    });
  }
};

module.exports = {
  post_get_all,
  post_get_byID,
  post_create,
  post_update,
  post_delete,
};
