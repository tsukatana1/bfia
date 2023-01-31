const express = require('express')
const bodyParser = require('body-parser')
const { authAdmin,  userPermitted, authDonor, getUserRe, pool, authUrl, genId, getAll, getUser, getUserChildren, getUsers, getReviews, verifyUser, getPrivSettings } = require('./tools.js')
const ejs = require('ejs')
const bcrypt = require('bcryptjs')
const mailer = require('nodemailer')
const cookieParser = require('cookie-parser');
const server = express()
const Redis = require('ioredis')
const { RateLimiterRedis } = require('rate-limiter-flexible')
const cors = require('cors')
const fetch = require('node-fetch')
var userCount = []
//Module configs

/* fetch('https://api.paypal.com/v1/billing/plans', {
    method: "POST",
    headers: { "Accept": 'application/json', "Authorization": "Bearer <>", "Prefer": "return=representation", "Content-Type": 'application/json' },
    body: JSON.stringify({
        product_id: "id",
        name: "BFIA Donation Plan",
        description: "The monthly plan to donate for the Bakersfield Island Family.",
        billing_cycles: [
            {
                frequency: {
                    interval_unit: "MONTH",
                    interval_count: 1
                },
                tenure_type: "REGULAR",
                sequence: 1,
                total_cycles: 24,
                pricing_scheme: {
                    fixed_price: {
                        value: 25,
                        currency_code: "USD"
                    }
                }
            }
        ],
        payment_preferences: {
            service_type: "PREPAID",
            auto_bill_outstanding: true,
            setup_fee_failure_action: "CONTINUE",
            payment_failure_threshold: 1
        },
        quantity_supported: false,
    })
})
.then(res => res.json())
.then(json => console.log(json)) */

const redisClient = new Redis({
    options: {
      enableOfflineQueue: false
    },
})
const mailConfig = mailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'something@gmail.com',
        pass: 'passwrd'
    }
})

const corsOptions = {
    origin: 'http://testdev.com:3000',
    optionsSucessStatus: 200
}

const opts = {
    redis: redisClient,
    points: 5,
    duration: 15 * 60,
    blockDuration: 15 * 60
}

const rateLimiter = new RateLimiterRedis(opts)

//Module events

redisClient.on('error', (error) => {
    console.log(error)
})


//Server configuration
server.use(express.static(__dirname + '/public'))
//server.use(expressIp().getIpInfoMiddleware)
server.set('view engine', 'ejs')
server.use(express.json())
server.use(cookieParser())
server.use(bodyParser.urlencoded({ extended: true })); 
//Route[s] configuration

server.get(["/", "/home"], async(req, res) => {
    const visitInt = await redisClient.get("home-route")
    await redisClient.set("home-route", parseInt(visitInt) + 1)
    res.render('index', { people: 20, money: 2000})
})

server.get('/dashboard', async(req, res) => {
    res.redirect(`/dashboard/${req.cookies['user_id']}`)
})

server.get("/dashboard/:id", verifyUser, async(req, res) => {
    var err;
    if(req.query['err'] === 'true') { err = { error: "Make sure all fields are not just whitespace, and the hCaptcha is complete. Else, something from our part is wrong. " } }
    else if(req.query['err'] === 'false') { err = { sucess: "Success. Saved all changes applied." }}
    else { err = null }
    const id = parseInt(req.params.id)
    const { results, reports, reports_made } = await getUserRe(id)
    const successAccess = await redisClient.get(`user:${parseInt(clean_xss(req.cookies['user_id']))}`)
    res.render('dashboard', { result: results, reports: reports, err: err, reports_made: reports_made, successAccess: successAccess })
})

server.get("/profile/:id", verifyUser,  async(req, res) => {
    const id = parseInt(req.params.id)
    const result = await getUser(id)
    const children = await getUserChildren(id)
    const isReported = await pool.query("SELECT * FROM reports WHERE user_id = $1 AND reporteeid = $2", [result[0]['user_id'], req.cookies['user_id']])
    res.render('profile', { prof: result, children: children[0], isReported: isReported.rows[0] })
})

server.get('/profile', async(req, res) => {
    const people = await getAll()
    const reviews = await getReviews()
    const routeInt = await redisClient.get("profile-route")
    await redisClient.set("profile-route", parseInt(routeInt) + 1)
    
    res.render('profile_search', { profiles: people, reviews: reviews })
})

server.get('/payment-failure', (req, res) => {
    res.render('failure')
})

server.get('/success', verifySucessAccess, (req, res) => {
    res.render('success')
})

server.get('/register', (req, res) => {
    res.render('register')
})

server.get('/login', (req, res) => {
    res.render('login', { error: req.query.error })
})

server.get('/admin', authAdmin, async(req, res) => {
    const userLength = await pool.query("SELECT * FROM accounts")
    const results = await getPrivSettings()
    const routeInfo = await routeStats()
    res.render('admin', { users: userLength.rows.length, userCount: userCount, priv_count: results['private'], pub_count: results['public'], routeInfo: routeInfo })
})

server.get('/password-recover', async(req, res) => {
    res.render('recover')
})

server.post('/getuser', cors(corsOptions), async(req, res) => {
    const user = await getUsers(req.body.query)
    return res.status(200).json({ body: user })
})

server.post('/newuser', cors(corsOptions), async(req, res) => {
    if(!req.body['h-captcha-response']) return res.redirect('/register?error=captchaFailed')

    const cap = req.body['h-captcha-response']

    fetch(`https://hcaptcha.com/siteverify?secret=${ENV.secret}&response=${cap}`, {
        method: "POST",
        headers: { "Content-Type": "application/xxx-form-urlencoded" },
    }).then(res => res.json())
    .then(json => {
        if(json.sucess === false) {
            return res.redirect('/register?error=captchaFailed')
        }
    })

    var personObject = sanitize(req.body)

    const userExists = await pool.query("SELECT * FROM accounts WHERE username = $1", [personObject.username])

    if(userExists.rowCount >= 1) {
        console.log('e')
        return res.redirect('/register?error=usernameTaken')
    }

    const user_id = genId()

    const hashedPswrd = await bcrypt.hash(personObject.password, 10)

    try {
        await pool.query("INSERT INTO accounts(username, actual_name, display_name, password, account_creation, email, user_id, public, description, acc_gender, permiss, donor) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'basic', false)", [personObject.username, personObject.name, personObject.display_name, hashedPswrd, Date.now(), personObject.email, user_id, personObject.privacy === 'private' ? false: true, personObject.description, personObject.gender])
        res.cookie('username', `${personObject.username}`, { path: '/', maxAge: new Date(253402300000000)})
        res.cookie('display_name', `${personObject.display_name}`, { path: '/', maxAge: new Date(253402300000000)})
        res.cookie('password', `${personObject.password}`, { path: '/', maxAge: new Date(253402300000000) })
        res.cookie('user_id', `${user_id}`, { path: '/', maxAge: new Date(253402300000000) })

        const mailOptions = {
            from: 'someemail@gmail.com',
            to: `${personObject.email}`,
            subject: 'Welcome',
            html: `<h2>Welcome ${personObject.username} to the ______ Family Island Foundation!</h2>
                    <br>
                    <p>You are now part of the family! Thanks for creating your account with us.</p>
                    <p>For further questions, please contact us, via email or telephone, which you can find <a>http://testdev.com:3000/</a> here.</p>`
        }

        mailConfig.sendMail(mailOptions, (error, info) => {})
        res.redirect('/')
    }
    catch(error) {
        res.json({ error: true, message: "Either that email is already registered, or the servers are down." })
        console.log(error)
    }
})

server.post('/newdonor', cors(corsOptions), async(req, res) => {
    try { 
        await redisClient.set(`user:${req.cookies['user_id']}`, 'ACCESS', "EX", 604800)
        await pool.query("UPDATE accounts SET donor = true WHERE user_id = $1 AND username = $2", [parseInt(clean_xss(req.cookies['user_id'])), clean_xss(req.cookies['username'])])
        await pool.query("INSERT INTO donors(user_id, subscriptionID) VALUES ($1, $2)", [parseInt(clean_xss(req.cookies['user_id'])), req.body.alertID])
    } catch {
        return res.json({ fatal_error: "A fatal error has occured. Please report this to a staff using the report feature, on the profile dashboard." })
    }
})

server.post('/donor', cors(corsOptions), async(req, res) => {
    const childrenJSON = []
    const entry = sanitize(req.body)

    entry.values.forEach(e => {
        const sanitized_JSON = sanitize(e)
        childrenJSON.push(JSON.stringify(sanitized_JSON))
    })
    try {
        await pool.query("UPDATE donors SET children_info = $1::jsonb[] WHERE user_id = $1 AND username = $2", [childrenJSON, clean_xss(req.cookies['user_id']), clean_xss(req.cookies['username'])])
        return res.status(200).json({ message: "Successful entry!" })
    } catch(e) {
        console.log(e)
        return res.json({ message: "An error occured. Please report this." })
    }
})

server.post('/loginuser', cors(corsOptions), async(req, res) => {
    const hcaptcha = req.body['h-captcha-response']

    if(req.body.username.replace(/\s/g, '') === '' || req.body.password.replace(/\s/g, '') === '') {
        return res.redirect('/login?error=invalidBody')
    }
    
    fetch(`https://hcaptcha.com/siteverify?secret=${ENV.secret}&response=${hcaptcha}`, {
        method: "POST",
        headers: { "Content-Type": "application/xxx-form-urlencoded" },
    })
    .then(res => res.json())
    .then(json => {
        if(json.sucess === false) {
            return res.redirect('/login?error=captchaFailed')
        }
    })

    var redirectURL = req.header("referrer").split("?")[1]
    if(!redirectURL) { redirectURL = 'redirectURL=/' }
    else { redirectURL = redirectURL.split("&").find(i => i.startsWith("redirectURL")) }
    const body = sanitize(req.body)
    const acc = await pool.query("SELECT * FROM accounts WHERE username = $1", [body.username])
    if(acc.rows.length === 0) {
        return res.status(401).json({ error: true, message: "No account exists with that username" })
    } else {
        bcrypt.compare(body.password, acc.rows[0]['password'], (err, data) => {
            if(data) {
                res.cookie('username', `${acc.rows[0].username}`, { path: '/', maxAge: new Date(253402300000000)})
                res.cookie('display_name', `${acc.rows[0].display_name}`, { path: '/', maxAge: new Date(253402300000000)})
                res.cookie('password', `${body.password}`, { path: '/', maxAge: new Date(253402300000000) })
                res.cookie('user_id', `${acc.rows[0].user_id}`, { path: '/', maxAge: new Date(253402300000000) })
                return res.redirect('/dashboard')
            } else {
                rateLimiter.consume(req.connection.remoteAddress)
                .then((point) => {
                    res.status(401).json({ error: true, message: `${point.remainingPoints} tries left` })
                })
                .catch((rejRes) => {
                    const secBeforeNext = Math.ceil(rejRes.msBeforeNext / 1000) || 1;
                    res.set('Retry-After', String(secBeforeNext));
                    console.log(secBeforeNext / 60)
                    res.status(429).json({ error: true, message: "Too many trials." });
                })
            }
        })
    }
})

server.post('/report', cors(corsOptions), async(req, res) => {
    const { userId, reason, reportSelection } = sanitize(req.body)

    try {
        await pool.query("INSERT INTO reports(user_id, descr, reason, reporteeid) VALUES ($1, $2, $3, $4)", [userId, reason, reportSelection, req.cookies['user_id']])
        return res.status(200).json({ error: false, message: "Sucessful entry." })
    } catch(e) {
        console.log(e)
        return res.status(401).json({ error: true, message: "Something went wrong from our part."} )
    }
})

server.post('/patchuser', cors(corsOptions), async(req, res) => {
    if(req.body.display_name.replace(/\s/g,'') === '' || req.body.description.replace(/\s/g,'') === '') {
        return res.redirect(`/dashboard/${req.body.user_id}?err=true`)
    }

    const cap = req.body['h-captcha-response']
    if(!cap) return res.redirect(`/dashboard/${req.body.user_id}?err=true`)

    fetch(`https://hcaptcha.com/siteverify?secret=${ENV.secret}&response=${cap}`, {
        method: "POST",
        headers: { "Content-Type": "application/xxx-form-urlencoded" },
    }).then(res => res.json())
    .then(json => {
        if(json.sucess === false) {
            return res.redirect(`/dashboard/${req.body.user_id}?err=true`)
        }
    })

    const personObject = sanitize(req.body)
    try {
        await pool.query("UPDATE accounts SET description = $1, display_name = $2, public = $3 WHERE user_id = $4", [personObject.description, personObject.display_name, personObject.privacy === 'private' ? false: true, personObject.user_id])
        return res.redirect(`/dashboard/${req.body.user_id}?err=false`)
    } catch(e) {
        console.log()
        return res.redirect(`/dashboard/${req.body.user_id}?err=true`)
    }
})


/* server.post('/recover', authUrl, cors(corsOptions), csrfProtection, async(req, res) => {
    const mailOptions = {
        from: 'somethingemail@gmail.com',
        to: 'daviddlon4949@gmail.com',
        subject: 'Welcome',
        text: 'Welcome to the ))) Island'
    }

    mailConfig.sendMail(mailOptions, (error, info) => {
        if(error) {
            console.log(error)
        } else {
            console.log('Email sent:' + info.response)
        }
    })
}) */

server.listen(3000, () => {
    console.log(`Ready at localhost:3000`)
})


//Miscellaneous functions 
async function routeStats() {
    return [ { route: '/HOME', visits: await redisClient.get("home-route")}, { route: '/DONATE', visits: await redisClient.get("donate-route")}, { route: '/PROFILE', visits: await redisClient.get("profile-route")} ]
}

function clean_xss(content) {
    content = content.replace('&', '&amp;')
    content = content.replace('<', '&lt;')
    content = content.replace('>', '&gt;')
    content = content.replace('/', '&#x2F')
    content = content.replace('"', '&quot;')
    content = content.replace("'", '&#x27;')

    return content
}


function sanitize(data) {
    const returnDict = {}

    for(var i in data) {
        if(typeof data[i] === 'string') {
            const l = clean_xss(data[i])
            returnDict[i] = l
        } else {
            returnDict[i] = data[i]
        }
    }

    return returnDict
}

async function verifySucessAccess(req, res, next) {
    const verification = await redisClient.get(`user:${req.cookies['user_id']}`)
    
    verification === null ? res.redirect("/") : next()
}

//Intervals for stats
setInterval(async() => { 
    const st = await pool.query("SELECT * FROM accounts")
    const index = userCount.length 
    userCount.push({ week: `Week ${index}`, number: st.rows.length })
}, 6.048e+8)

setInterval(() => {
    userCount.length = 0
}, 2.628e+9)
