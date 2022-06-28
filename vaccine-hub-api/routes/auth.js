const express = require("express")
const router = express.Router()

router.post("/login", async (req, res, next) =>{
    try {
    // take the users email & password and attempting to authenticate them
    } catch(err) {
     next(err)
    }
})

router.post("/register", async(req, res, next) => {
    try {
    // add code later
    } catch(err){
        next(err)
    }

})
module.exports = router