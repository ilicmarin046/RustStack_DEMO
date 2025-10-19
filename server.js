require('dotenv').config();
const express=require('express');
const session=require('express-session');
const fetch=require('node-fetch');
const SteamStrategy=require('passport-steam').Strategy;
const passport=require('passport');
const app=express();

app.use(session({secret:'ruststacksecret',resave:false,saveUninitialized:true}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user,done)=>done(null,user));
passport.deserializeUser((obj,done)=>done(null,obj));

passport.use(new SteamStrategy({
  returnURL:'http://localhost:3000/auth/steam/return',
  realm:'http://localhost:3000/',
  apiKey:process.env.STEAM_API_KEY
},function(identifier,profile,done){
  profile.identifier=identifier;
  return done(null,profile);
}));

app.get('/auth/steam', passport.authenticate('steam', { failureRedirect: '/' }));
app.get('/auth/steam/return', passport.authenticate('steam',{ failureRedirect:'/' }), (req,res)=>{
  req.session.steamID=req.user.id;
  res.redirect('/cases.html');
});

app.get('/api/user/:steamid/inventory', async(req,res)=>{
  const steamid=req.params.steamid;
  try{
    const url=`https://api.steampowered.com/IEconItems_730/GetPlayerItems/v0001/?key=${process.env.STEAM_API_KEY}&SteamID=${steamid}`;
    const response=await fetch(url);
    const data=await response.json();
    res.json(data.result?.items || []);
  }catch(e){ res.status(500).json({error:e.message}); }
});

app.use(express.static('.'));
app.listen(3000,()=>console.log('Server running on http://localhost:3000'));
