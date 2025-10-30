const express = require('express')
const admin = require('firebase-admin')
const app = express()

app.use(express.json())

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://year-book-project.firebaseio.com"
})

app.get('/', (req, res) => {
  res.send('Server is running!')
})

app.post('/login', async (req, res) => {
  const { email, password, ip, deviceid } = req.body
  if (!email || !password) return res.status(400).send('Missing fields')

  try {
    const user = await admin.auth().getUserByEmail(email)
    const signInResponse = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBM562z0x1ppwpGt8O99-OYdxaIc7Y-KRM', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    })
    const data = await signInResponse.json()
    if (data.error) return res.status(401).json({ error: 'Invalid credentials' })

    const customToken = await admin.auth().createCustomToken(user.uid, { ip, deviceid })
    res.json({ token: customToken })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.listen(10000, () => console.log('Server started'))
