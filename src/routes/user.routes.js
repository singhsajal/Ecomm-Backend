
const { registerUser } = require("../controllers/user.controller")
const { loginUser } = require("../controllers/user.controller")
const { logout } = require("../controllers/user.controller")
const { changeCurrentPassword } = require("../controllers/user.controller")
const { updateAccountDetails } = require("../controllers/user.controller")
const { refreshAccessToken } = require("../controllers/user.controller")
const { femaleCount } = require("../controllers/user.controller")
const express = require("express")
const app = express();
const router = express.Router()
router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", logout)
router.post("/changePassword", changeCurrentPassword)
router.post("/UpdateAccountDetails", updateAccountDetails)
router.post("/refreshAccessToken", refreshAccessToken)
router.get("/femaleCount", femaleCount)
//console.log(registerUser())
module.exports = router





// const express = require('express');
// const { registerUser } = require('../controllers/user.controller');

// const app = express();

// const router = express.Router();

// router.post('/register',registerUser)

// module.exports = router;