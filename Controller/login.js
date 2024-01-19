module.exports = (req,res)=>{
    const errors = [];
    res.render('login', { errors });
}