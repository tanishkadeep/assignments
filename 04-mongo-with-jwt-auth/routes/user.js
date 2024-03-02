const { Router } = require("express");
const router = Router();
const userMiddleware = require("../middleware/user");
const { User, Course } = require("../db");
const jwt = require("jsonwebtoken");
const {JWT_SECRET} = require("../config.js");

// User Routes
router.post('/signup', (req, res) => {
    // Implement user signup logic
    const username = req.body.username;
    const password = req.body.password;

    User.create({
        username,
        password,
    });

    res.json({ message: "User created successfully" });
});

router.post('/signin', async (req, res) => {
    // Implement user signup logic
    const username = req.body.username;
    const password = req.body.password;

    const user = await User.findOne({
        username,
        password
    })

    if(user){
        const token = jwt.sign({username}, JWT_SECRET);
        res.json({
            token
        });
    }
    else{
        res.status(411).json({
            msg : "Incorrect username or password"
        });
    }
});

router.get("/courses", async (req, res) => {
    // Implement listing all courses logic
    const response = await Course.find({});
  
    res.json({
      courses: response,
    });
  });

router.post('/courses/:courseId', userMiddleware, async (req, res) => {
    // Implement course purchase logic
    const courseId = req.params.courseId;
    const username = req.username;
    
    await User.updateOne(
    {
      username: username,
    },
    {
      $push: {
        purchasedCourses: courseId,
      },
    }
  );

  res.json({
    message: "Course purchased successfully",
  });
});

router.get("/purchasedCourses", userMiddleware, async (req, res) => {
    // Implement fetching purchased courses logic
    const user = await User.findOne({
      username: req.username,
    });
  
    const courses = await Course.find({
      _id: {
        $in: user.purchasedCourses,
      },
    });
  
    res.json({
      courses: courses,
    });
  });

module.exports = router