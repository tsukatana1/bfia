const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
    password: 'archencrypted',
    database: 'bakfamily',
    port: 5432,
    host: '127.0.0.1',
    user: 'postgres',
    max: 20,
})

const USER = {
    ADMIN: 'admin',
    BASIC: 'basic',
}

async function authDonor(req, res, next) {
    if(res.cookies === undefined) {
        return res.status(401).redirect('/login')
    }

    const check_donor = await pool.query("SELECT * FROM donors WHERE username = $1", [req.cookies['username']])
    if(req.cookies['username'] && req.cookies['password'] && req.cookies['display_name']) {
        const check_donor = await pool.query("SELECT * FROM donors WHERE username = $1", [req.cookies['username']])
        if(check_donor.rows.length <= 0) {
            res.redirect('/')
        } else {
            next()
        }
    } else {
        res.redirect('/')
    } 
}

async function authAdmin(req, res, next) {
    if(req.cookies === undefined) {
        return res.status(403).redirect('/login')
    }

    const result = await pool.query("SELECT perms FROM accounts WHERE username = $1 AND user_id = $2", clean_xss(req.cookies['username']), req.cookies['user_id'])

    if(result.rowCount === 0) {
        return res.status(403).redirect('/login')
    } else {
        if(result.rows.perms === 'ADMIN') {
            next()
        }
        return res.status(403).redirect('/login')
    }
}

function authUrl(req, res, next) {
    const available_ref = ['http://testdev.com:3000/sucess', 'http://testdev.com:3000/login', 'http://testdev.com:3000/register']
    if(!req.headers['host'] && req.headers['origin']) {
        res.status(403).json({ message: "Not allowed." })
    } else if(req.headers['host'] !== 'http://testdev.com:3000' && req.headers['origin'] !== 'http://testdev.com:3000') {
        res.status(403).json({ message: "Not allowed." })
    } else if(!req.headers['referer'] in available_ref) {
        res.status(403).json({ message: "Not allowed." })
    } else {
        next()
    }
}

async function getAll() {
    const people = await pool.query("SELECT display_name, account_creation, email, username, user_id, description FROM accounts WHERE public = true")
    return people.rows
}

function genId() {
    return Math.floor(Math.random() * (1000 * 1000000) + 1000)
}

async function getUser(id) {
    const profile = await pool.query("SELECT * FROM accounts WHERE user_id = $1 AND public = true", [id])

    return profile.rows
}

async function getUserRe(id) {
    const profile = await pool.query("SELECT * FROM accounts WHERE user_id = $1", [id])
    const reports = await pool.query("SELECT * FROM reports WHERE reporteeid = $1", [id])
    const reports_made = await pool.query("SELECT * FROM reports WHERE user_id = $1", [id])

    return { results: profile.rows, reports: reports.rowCount, reports_made: reports_made.rowCount }
}

async function getUserChildren(id) {
    const children = await pool.query("SELECT children_info FROM donors WHERE user_id = $1", [id])

    return children.rows
}

async function getUsers(query) {
    var record;
    if(!isNaN(query)) {
        record = await pool.query("SELECT display_name, account_creation, email, username, user_id, description FROM accounts WHERE public = true AND user_id = $1 OR display_name = $2", [parseInt(query), query])
    } else {
        record = await pool.query("SELECT display_name, account_creation, email, username, user_id, description FROM accounts WHERE display_name = $1 AND public = true", [query])
    }

    return record.rows
}

async function verifyUser(req, res, next) {
    if(req.cookies === undefined) {
        return res.status(401).redirect(`/login?redirectURL=${req.route.path}`)
    }

    const { username, password, display_name, user_id } = req.cookies
    
    const account = await pool.query("SELECT * FROM accounts WHERE display_name = $1 AND username = $2 AND user_id = $3", [display_name, username, user_id])
    if(account.rows[0] === undefined) {
        return res.status(401).redirect('/login')
    } else {
        bcrypt.compare(password, account.rows[0]['password'], (err, data) => {
            if(data) {
                next()
            } else {
                return res.status(401).redirect(`/login?redirectURL=${req.route.path}`)
            }
        })
    }
}

async function getReviews() {
    var items = []
    const reviews = await pool.query("SELECT * FROM reviews LIMIT 20")
    for(i = 0; i < reviews.rows.length; i++) {
        const result = await pool.query("SELECT display_name FROM accounts WHERE user_id = $1", [reviews.rows[i]['user_id']])

        if(result.rows.length === 0) {
            continue
        } else {
            items.push({
                name: result.rows[0]['display_name'],
                description: reviews.rows[i]['content'],
                stars: reviews.rows[i]['stars'],
                creation_date: reviews.rows[i]['creation_time']
            })
        }
    }

    return items
}

async function getPrivSettings() {
    const private = await pool.query("SELECT * FROM accounts WHERE public = false")
    const public = await pool.query("SELECT * FROM accounts WHERE public = true")

    return { private: private.rows.length, public: public.rows.length }
}

async function userPermitted(req, res, next) {
    if(req.cookies === undefined) {
        return res.redirect('/login')
    }
    const { username, user_id } = sanitize(req.cookies)

    try {
        const result = await pool.query("SELECT * FROM accounts WHERE username = $1 AND user_id = $2", [username, user_id])
        const auth = await pool.query("SELECT * FROM accounts WHERE user_id = $1", [parseInt(req.params.id)])

        if(result.rows[0] === undefined || auth.rows[0] === undefined) return res.redirect('/')
        else {
            if(result.rows[0].user_id === auth.rows[0].user_id) {
                next()
            } else {
                return res.redirect('/')
            }
        }
    } catch(e) {
        console.log(e)
    }
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

module.exports = {
    authDonor,
    USER,
    pool,
    authUrl,
    authAdmin,
    genId,
    getAll,
    getUser,
    getUserChildren,
    getUsers,
    getReviews,
    verifyUser,
    getPrivSettings,
    getUserRe,
    userPermitted
}