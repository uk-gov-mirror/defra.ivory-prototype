const express = require('express')
const router = express.Router()
const path = require('path')
const multer = require('multer')
const fs = require('fs')
const rootAppDirectory = require('../../config').rootAppDirectory // Used when a full path is required, e.g. '/Users/dave/Documents/NODE/projects/DEFRA/ivory-prototype/app' or '/app/app' on Heroku
const viewsFolder = path.join(__dirname, '/../views/public/') // Set the views with a relative path (haven't yet found a better way of doing this yet)
const version = __dirname.match(/app\/(.[^\/]*?)\/routes/)[1]// Gets the version, e.g. v10 (ensure this handles Heroku's __direname being /app/app/vXX/routes)

const exemptionTypeText1 = 'Item with less than 10% ivory made before 1947'
const exemptionTypeText2 = 'Musical instrument with less than 20% ivory and made before 1975'
const exemptionTypeText3 = 'Portrait miniature made before 1918'
const exemptionTypeText4 = 'Item to be acquired by an accredited museum'
const exemptionTypeText5 = 'An item of outstandingly high artistic, cultural or historical value made before 1918'



/// ///////////////////////////////////////////////////////////////////////////
// LOGGER (not great, but may help)
function logger (req, msg) {
  if (!msg) {
    msg = ''
  }
  console.log('DEBUG.routes ' + req.method + req.route.path + ': ' + msg)
}







/// ////////////////////////////////////////////
// WELCOME
router.get('/index-welcome', function (req, res) {
  res.render(viewsFolder + 'index-welcome')
})



/// ////////////////////////////////////////////
// Gumtree sell
router.get('/gumtree-sell', function (req, res) {
  res.render(viewsFolder + 'gumtree-sell')
})



/// ////////////////////////////////////////////
// Gumtree buy
router.get('/gumtree-buy', function (req, res) {
  res.render(viewsFolder + 'gumtree-buy')
})




/// ////////////////////////////////////////////
// DETAILED GUIDANCE
router.get('/guidance', function (req, res) {
  res.render(viewsFolder + 'a-guide-to-selling-hiring-and-buying-items-containing-ivory')
})




/// ////////////////////////////////////////////
// SELLING, HIRING, BUYING IVORY
router.get('/a-guide-to-selling-hiring-and-buying-items-containing-ivory', function (req, res) {
  res.render(viewsFolder + 'a-guide-to-selling-hiring-and-buying-items-containing-ivory')
})

router.get('/apply-to-sell-or-hire-an-ivory-item', function (req, res) {
  res.render(viewsFolder + 'apply-to-sell-or-hire-an-ivory-item')
})





/// ////////////////////////////////////////////

// Removed 'Check if service is suitable' type questions - see V9

/// ////////////////////////////////////////////






/// ////////////////////////////////////////////
// BUYING IVORY
router.get('/check-before-you-buy-an-ivory-item', function (req, res) {
  res.render(viewsFolder + 'check-before-you-buy-an-ivory-item')
})

/// ////////////////////////////////////////////
// START (old)

router.get('/start', function (req, res) {
  res.render(viewsFolder + 'apply-to-sell-or-hire-an-ivory-item')
})

router.get('/start-a', function (req, res) {
  res.render(viewsFolder + 'start-a')
})

router.get('/start-b', function (req, res) {
  res.render(viewsFolder + 'start-b')
})

router.get('/start-c', function (req, res) {
  res.render(viewsFolder + 'start-c')
})

/// ///////////////////////////////////////////
// START-PROTOTYPE_1
router.get('/start-prototype', function (req, res) {

  // Remove the previous photo (no need to store it for the prototype.  Heroku will remove them everytime it restarts anyway, but might as well be tidy)
  // This isn't perfect, but removes most of the images floating about unnecessarily.
  if (req.session.data['imageName']) {
    const imagePath = path.join(__dirname, './uploads/', req.session.data['imageName'])
    fs.unlink(imagePath, err => {
      if (err) logger(req, err)
      else logger(req, 'Image removed = ' + imagePath)
    })
  }

  req.session.destroy(function (err) {
    if (err) logger(req, err)
    else logger(req, 'Previous session destroyed')
  })

  res.redirect('choose-exemption')
  // res.redirect('is-it-a-musical-instrument')
})

//* ****************************************************
// CHOOSE-EXEMPTION
router.get('/choose-exemption', function (req, res) {

  var exemptionType1Checked
  var exemptionType2Checked
  var exemptionType3Checked
  var exemptionType4Checked
  var exemptionType5Checked

  switch (req.session.data['exemptionChoice']) {
    case 'type1':
      exemptionType1Checked = 'checked'
      break
    case 'type2':
      exemptionType2Checked = 'checked'
      break
    case 'type3':
      exemptionType3Checked = 'checked'
      break
    case 'type4':
      exemptionType4Checked = 'checked'
      break
    case 'type5':
      exemptionType5Checked = 'checked'
      break
    default:
      exemptionType1Checked = ''
      exemptionType2Checked = ''
      exemptionType3Checked = ''
      exemptionType4Checked = ''
      exemptionType5Checked = ''
  }
  res.render(viewsFolder + 'choose-exemption', {
    exemptionType1Checked: exemptionType1Checked,
    exemptionType2Checked: exemptionType2Checked,
    exemptionType3Checked: exemptionType3Checked,
    exemptionType4Checked: exemptionType4Checked,
    exemptionType5Checked: exemptionType5Checked
  })
})



router.post('/choose-exemption', function (req, res) {

  if (req.session.data['exemptionChoice'] == 'type4') {
    logger(req, "It's a museum piece.")
    res.redirect('apply-to-register-to-sell-an-item-to-a-museum')
  } else if (req.session.data['exemptionChoice'] == 'type5') {
      logger(req, "It's rare and most important.")
      res.redirect('apply-for-an-rmi-certificate')
    } else {
    logger(req, "It's a standard section 10 non-museum.")
    logger(req, 'Exemption type=' + req.session.data['exemptionChoice'])
    res.redirect('add-photo')
  }
})






//* ****************************************************
// REGISTER MUSEUM ITEM
router.get('/apply-to-register-to-sell-an-item-to-a-museum', function (req, res) {

  res.render(viewsFolder + 'apply-to-register-to-sell-an-item-to-a-museum', {
    backUrl: 'choose-exemption',
  })
})



//* ****************************************************
// APPLY FOR AN RMI CERTIFICATE
router.get('/apply-for-an-rmi-certificate', function (req, res) {

  res.render(viewsFolder + 'apply-for-an-rmi-certificate', {
    backUrl: 'choose-exemption',
  })
})








/// ///////////////////////////////////////////////////////////////////////////
// ADD PHOTGRAPH
router.get('/add-photo', function (req, res) {

  // If returning to this page, remove previously uploaded photo (saves them sitting around unused)
  if (req.session.data['imageName']) {
    const imagePath = path.join(rootAppDirectory, version, '/photos/', req.session.data['imageName'])
    console.log('Found a previously uploaded photo to remove at image path: ' + imagePath)
    fs.unlink(imagePath, err => {
      if (err) logger(req, err)
      else logger(req, 'Image removed = ' + imagePath)
    })
  }

  res.render(viewsFolder + 'add-photo', {
    backUrl: 'choose-exemption'
  })
})

router.post('/add-photo', function (req, res) {

  // Set back button URL
  req.session.data['backUrl'] = 'add-photo'

  // Prepare for the photo upload code
  const upload = multer({
    dest: path.join(rootAppDirectory, version, '/photos'),
    limits: {
      fileSize: 8 * 1024 * 1024 // 8 MB (max file size in bytes)
    }
  }).single('fileToUpload') /* name attribute of <file> element in the html form */

  // Upload the chosen file to the multer 'dest'
  upload(req, res, function (err) {

    // Handle errors
    if (err) {
      logger(req, 'Multer threw an error' + err)
    }

    // Handle no file chosen
    if (!req.file) {
      logger(req, 'No file was chosen/uploaded')
      res.redirect('check-photo') // We're not enforcing uploads
    }

    // Handle a wrong file type
    const multerDestPath = req.file.path
    var fileExt = path.extname(req.file.originalname).toLowerCase()
    if (fileExt !== '.png' && fileExt !== '.jpg' && fileExt !== '.jpeg') {
      logger(req, 'Wrong file type')
      fs.unlink(multerDestPath, err => {
        if (err) console.log(err)
      })
      res.render(viewsFolder + 'add-photo', {
        errorNoFile: 'The selected file must be a JPG or PNG'
      })
    }

    // Passes all validation, so move/rename it to the persistent location
    // (We need to initially save it somewhere to get the file extension otherwise we'd need an additional module to handle the multipart upload)
    var imageName = new Date().getTime().toString() + fileExt // getTime() gives the milliseconds since 1970...
    req.session.data['imageName'] = imageName // New session variable imageName
    const targetPath = path.join(rootAppDirectory, version, '/photos/', imageName)

    fs.rename(multerDestPath, targetPath, function (err) {
      if (err) {
        console.log('err = ' + err)
      } else {
        logger(req, 'File successfully uploaded')
        res.redirect('check-photo')
      }
    })
  })
})

/// ///////////////////////////////////////////////////////////////////////////
// CHECK PHOTO
router.get('/check-photo', function (req, res) {
  res.render(viewsFolder + 'check-photo', {
    backUrl: 'add-photo'
  })
})

router.post('/check-photo', function (req, res) {
  // Set back button URL
  req.session.data['backUrl'] = 'check-photo'
  res.redirect('your-photos')
})



/// ///////////////////////////////////////////////////////////////////////////
// YOUR PHOTOS
router.get('/your-photos', function (req, res) {
  res.render(viewsFolder + 'your-photos', {
    backUrl: 'check-photo'
  })
})

router.post('/your-photos', function (req, res) {
  // Set back button URL
  req.session.data['backUrl'] = 'your-photos'

  if (req.session.data['photos-what-next'] == 'Add another photo') {
    logger(req, "Add another photo")
    res.redirect('add-photo')
  } else {
    logger(req, "I'm done with photos... for now thanks")
    res.redirect('description')
  }

})










//* ****************************************************
// DESCRIPTION
router.get('/description', function (req, res) {

  // Temp fudge while we don't have validation on (and you can skip uploading a photo)
  var backUrl
  if (req.session.data['imageName']) {
    backUrl = 'your-photos'
  } else {
    backUrl = 'add-photo'
  }

  res.render(viewsFolder + 'description', {
    backUrl: backUrl
  })
})

router.post('/description', function (req, res) {
  logger(req, 'Description=' + req.session.data['description'])
  res.redirect('ivory-age')
})

//* ****************************************************
// IVORY AGE
router.get('/ivory-age', function (req, res) {

  var ivoryYear

  switch (req.session.data['exemptionChoice']) {
    case 'type1':
      ivoryYear = '1947'
      break
    case 'type2':
      ivoryYear = '1975'
      break
    case 'type3':
      ivoryYear = '1918'
      break
    case 'type4':
      ivoryYear = ''
      break
    case 'type5':
      ivoryYear = '1918'
      break
    default:
      ivoryYear = 'xxxx'
  }


  res.render(viewsFolder + 'ivory-age', {
    'ivoryYear': ivoryYear,
    backUrl: 'description'
  })
})

router.post('/ivory-age', function (req, res) {
  res.redirect('ivory-volume')
})

//* ****************************************************
// IVORY VOLUME
router.get('/ivory-volume', function (req, res) {


  var volumeType1Checked
  var volumeType2Checked
  var volumeType3Checked


  switch (req.session.data['volumeExplanation']) {
    case 'type1':
      volumeType1Checked = 'checked'
      break
    case 'type2':
      volumeType2Checked = 'checked'
      break
    case 'type3':
      volumeType3Checked = 'checked'
      break
    default:
      volumeType1Checked = ''
      volumeType2Checked = ''
      volumeType3Checked = ''
  }



  var ivoryVolume

  switch (req.session.data['exemptionChoice']) {
    case 'type1':
      ivoryVolume = '10%'
      break
    case 'type2':
      ivoryVolume = '20%'
      break
    case 'type3':
      ivoryVolume = '320 square centimetres'
      break
    case 'type4':
      ivoryVolume = ''
      break
    case 'type5':
      ivoryVolume = ''
      break
    default:
      ivoryVolume = 'x%'
  }

  res.render(viewsFolder + 'ivory-volume', {
    volumeType1Checked: volumeType1Checked,
    volumeType2Checked: volumeType2Checked,
    volumeType3Checked: volumeType3Checked,
    'ivoryVolume': ivoryVolume,
    backUrl: 'ivory-age'
  })
})

router.post('/ivory-volume', function (req, res) {
  res.redirect('who-owns-item')
})

//* ****************************************************
// ARE YOU THE OWNER
router.get('/who-owns-item', function (req, res) {
  var ownerChecked = ''
  var agentChecked = ''
  if (req.session.data['ownerAgent'] == 'owner') {
    ownerChecked = 'checked'
  } else if (req.session.data['ownerAgent'] == 'agent') {
    agentChecked = 'checked'
  }

  res.render(viewsFolder + 'who-owns-item', {
    backUrl: 'ivory-volume',
    ownerChecked: ownerChecked,
    agentChecked: agentChecked
  })
})

router.post('/who-owns-item', function (req, res) {

  if (req.session.data['ownerAgent'] == 'owner') {
    logger(req, "It's the owner, so go down the owner route.")
    res.redirect('owner-name')
  } else {
    logger(req, "It's the agent, so go down the agent route.")
    // res.redirect('agent')
    res.redirect('agent-name')
  }
})

//* ****************************************************
// AGENT
router.get('/agent', function (req, res) {

  var agentIs1Checked
  var agentIs2Checked
  var agentIs3Checked
  var agentIs4Checked

  switch (req.session.data['agentIs']) {
    case 'Professional advisor':
      agentIs1Checked = 'checked'
      break
    case 'Executor':
      agentIs2Checked = 'checked'
      break
    case 'Trustee':
      agentIs3Checked = 'checked'
      break
    case 'Friend or relative':
      agentIs4Checked = 'checked'
      break
    default:
      agentIs1Checked = ''
      agentIs2Checked = ''
      agentIs3Checked = ''
      agentIs4Checked = ''
  }
  res.render(viewsFolder + 'agent', {
    backUrl: 'who-owns-item',
    agentIs1Checked: agentIs1Checked,
    agentIs2Checked: agentIs2Checked,
    agentIs3Checked: agentIs3Checked,
    agentIs4Checked: agentIs4Checked
  })
})

router.post('/agent', function (req, res) {
  logger(req, 'Agent is = ' + req.session.data['agentIs'])
  res.redirect('agent-name')
})

//* ****************************************************
// AGENT-NAME
router.get('/agent-name', function (req, res) {
  res.render(viewsFolder + 'agent-name', {
    // backUrl: 'agent'
    backUrl: 'who-owns-item'
  })
})

router.post('/agent-name', function (req, res) {
  res.redirect('agent-address')
})

//* ****************************************************
// AGENT-ADDRESS
router.get('/agent-address', function (req, res) {
  res.render(viewsFolder + 'agent-address', {
    backUrl: 'agent-name'
  })
})

router.post('/agent-address', function (req, res) {
  res.redirect('agent-contact')
})

//* ****************************************************
// AGENT-CONTACT
router.get('/agent-contact', function (req, res) {
  res.render(viewsFolder + 'agent-contact', {
    backUrl: 'agent-address'
  })
})

router.post('/agent-contact', function (req, res) {
  res.redirect('agent-owner-name')
})

//* ****************************************************
// AGENT-OWNER-NAME
router.get('/agent-owner-name', function (req, res) {
  res.render(viewsFolder + 'agent-owner-name', {
    backUrl: 'agent-address'
  })
})

router.post('/agent-owner-name', function (req, res) {
  res.redirect('agent-owner-address')
})

//* ****************************************************
// AGENT-OWNER-ADDRESS
router.get('/agent-owner-address', function (req, res) {
  res.render(viewsFolder + 'agent-owner-address', {
    backUrl: 'agent-owner-name'
  })
})

router.post('/agent-owner-address', function (req, res) {
  res.redirect('dealing-intent')
})

//* ****************************************************
// add-photo
router.get('/add-photo-1', function (req, res) {
  res.render(viewsFolder + 'add-photo-1')
})

router.post('/add-photo-1', function (req, res) {
  console.log('DEBUG.routes.add-photo-1.post: ' + req.session.data['photograph'])
  res.redirect('add-description')
})

//* ****************************************************
// ADD-DESCRIPTION
router.get('/add-description', function (req, res) {
  res.render(viewsFolder + 'add-description')
})

router.post('/add-description', function (req, res) {
  console.log('DEBUG.routes.add-description.post: ' + req.session.data['description'])
  res.redirect('owner-name-1')
})

//* ****************************************************
// OWNER-NAME
router.get('/owner-name', function (req, res) {
  res.render(viewsFolder + 'owner-name', {
    backUrl: 'who-owns-item'
  })
})

router.post('/owner-name', function (req, res) {
  res.redirect('owner-address')
})

//* ****************************************************
// OWNER-ADDRESS
router.get('/owner-address', function (req, res) {
  res.render(viewsFolder + 'owner-address', {
    backUrl: 'owner-name'
  })
})

router.post('/owner-address', function (req, res) {
  res.redirect('owner-contact')
})

//* ****************************************************
// OWNER-CONTACT
router.get('/owner-contact', function (req, res) {
  res.render(viewsFolder + 'owner-contact', {
    backUrl: 'owner-address'
  })
})

router.post('/owner-contact', function (req, res) {
  res.redirect('dealing-intent')
})

//* ****************************************************
// DEALING-INTENT
router.get('/dealing-intent', function (req, res) {

  var backUrl
  if (req.session.data['ownerAgent'] == 'owner') {
    backUrl = 'owner-contact'
  } else if (req.session.data['ownerAgent'] == 'agent') {
    backUrl = 'agent-owner-address'
  }

  var intentSellChecked
  var intentHireOutChecked

  switch (req.session.data['dealingIntent']) {
    case 'Sell it':
      intentSellChecked = 'checked'
      break
    case 'Hire it out':
      intentHireOutChecked = 'checked'
      break
    default:
      intentSellChecked = ''
      intentHireOutChecked = ''
  }
  res.render(viewsFolder + 'dealing-intent', {
    backUrl: backUrl,
    intentSellChecked: intentSellChecked,
    intentHireOutChecked: intentHireOutChecked
  })
})

router.post('/dealing-intent', function (req, res) {
  logger(req, 'Dealing intent = ' + req.session.data['dealingIntent'])
  res.redirect('check-your-answers')
})


//* ****************************************************
// CYA nunjucks
router.get('/cya', function (req, res) {
  res.render(viewsFolder + 'cya', {
    backUrl: ''
  })
})



//* ****************************************************
// CHECK YOUR ANSWERS
router.get('/check-your-answers', function (req, res) {

  var backUrl
  if (req.session.data['ownerAgent'] == 'owner') {
    backUrl = 'dealing-intent'
  } else if (req.session.data['ownerAgent'] == 'agent') {
    backUrl = 'dealing-intent'
  }

  var exemptionTypeChosen

  switch (req.session.data['exemptionChoice']) {
    case 'type1':
      exemptionTypeChosen = exemptionTypeText1
      break
    case 'type2':
      exemptionTypeChosen = exemptionTypeText2
      break
    case 'type3':
      exemptionTypeChosen = exemptionTypeText3
      break
    case 'type4':
      exemptionTypeChosen = exemptionTypeText4
      break
    case 'type5':
      exemptionTypeChosen = exemptionTypeText5
      break
    default:
      exemptionTypeChosen = 'Not available'
  }

  req.session.data['exemptionTypeText'] = exemptionTypeChosen

  switch (req.session.data['exemptionChoice']) {
    case 'type1':
      ivoryYear = '1947'
      ivoryVolume = '10%'
      break
    case 'type2':
      ivoryYear = '1975'
      ivoryVolume = '20%'
      break
    case 'type3':
      ivoryYear = '1918'
      ivoryVolume = '320 square centimetres'
      break
    case 'type4':
      ivoryYear = ''
      ivoryVolume = ''
      break
    case 'type5':
      ivoryYear = '1918'
      ivoryVolume = ''
      break
    default:
      ivoryYear = 'xxxx'
      ivoryVolume = 'xxxx'
  }


  var ageDetail
  ageDetail = req.session.data['ageDetail']

  var ivoryAge

  ivoryAge = (req.session.data['ivoryAge'])
  console.log( ivoryAge )

  var ageDetail
  ageDetail = req.session.data['ageDetail']




  switch (req.session.data['dealingIntent']) {
    case 'Sell it':
      dealingIntent = 'Sale'
      break
    case 'Hire it out':
    dealingIntent = 'Hire'
      break
      default:
    dealingIntent = 'Not available'
  }

  res.render(viewsFolder + 'check-your-answers', {
    exemptionTypeChosen: exemptionTypeChosen,
    ivoryYear: ivoryYear,
    ivoryAge: ivoryAge,
    ageDetail: ageDetail,
    ivoryVolume: ivoryVolume,
    dealingIntent: dealingIntent,
    backUrl: backUrl,
    agentOwner: req.session.data['ownerAgent']
  })
})

router.post('/check-your-answers', function (req, res) {
  // res.redirect('declaration');
  res.redirect('govpay-lookalike-1')
})














// * Check your answers pre-filled *********************


//* ****************************************************
// CHECK YOUR ANSWERS FILLED
router.get('/check-your-answers-filled', function (req, res) {

  // * let's pre-fill all the data - this is super-clunky but'll do for now...

  /* type1 = De minimis */
  // req.session.data['exemptionChoice'] = 'type1'

  /* type2 = Musical instrument */
  req.session.data['exemptionChoice'] = 'type2'
  req.session.data['imageName'] = '7BFR12QA.jpg'
  req.session.data['description'] = 'An antique violin bow made with tabebuia wood and horsehair with an ivory tip'


  req.session.data['age-declaration'] = 'Declared'
  req.session.data['ivoryAge'] = ['Date mark on the item', 'It\'s been in the family since 1974 or before']
  req.session.data['ageDetail'] = 'Hallmark on the wooden handle dates the bow to 1894.'

  req.session.data['volume-declaration'] = 'Declared'
  req.session.data['volumeDetail'] = 'I can see that the bow contains less than 20% ivory.'
  req.session.data['ivoryVolume'] = ['Estimate of ivory content by eye']


  /* type3 = Portrait miniature */
  // req.session.data['exemptionChoice'] = 'type3'
  // req.session.data['imageName'] = '3UJS18CV.jpg'

  // need to add the checkbox answers to each of these age and volume


  req.session.data['ownerAgent'] = 'agent'

  req.session.data['agentName'] = 'Stella Rimmington'
  req.session.data['agentAddressBusiness'] = 'Acme Auctioneers Ltd'
  req.session.data['agentAddressLine1'] = '65 Primrose Avenue'
  req.session.data['agentAddressLine2'] = ''
  req.session.data['agentAddressTown'] = 'Hoddingbridge'
  req.session.data['agentAddressCounty'] = ''
  req.session.data['agentAddressPostcode'] = 'WE11 2DO'
  req.session.data['agentEmail'] = 's.rimmington@boltsandratchets.co.uk'

  req.session.data['ownerName'] = 'Jim Bowen'
  req.session.data['addressBusiness'] = 'On the Oche'
  req.session.data['addressLine1'] = '29 Bull End'
  req.session.data['addressLine2'] = 'Heswall'
  req.session.data['addressTown'] = 'Wirral'
  req.session.data['addressCounty'] = 'Merseyside'
  req.session.data['addressPostcode'] = 'CH60 1PL'
  req.session.data['ownerEmail'] = 'jim.bowen@gmole.com'

  req.session.data['dealingIntent'] = 'Sell it'




  var backUrl
  if (req.session.data['ownerAgent'] == 'owner') {
    backUrl = 'dealing-intent'
  } else if (req.session.data['ownerAgent'] == 'agent') {
    backUrl = 'dealing-intent'
  }

  var exemptionTypeChosen

  switch (req.session.data['exemptionChoice']) {
    case 'type1':
      exemptionTypeChosen = exemptionTypeText1
      break
    case 'type2':
      exemptionTypeChosen = exemptionTypeText2
      break
    case 'type3':
      exemptionTypeChosen = exemptionTypeText3
      break
    case 'type4':
      exemptionTypeChosen = exemptionTypeText4
      break
    case 'type5':
      exemptionTypeChosen = exemptionTypeText5
      break
    default:
      exemptionTypeChosen = 'Not available'
  }

  req.session.data['exemptionTypeText'] = exemptionTypeChosen


  switch (req.session.data['exemptionChoice']) {
    case 'type1':
      ivoryYear = '1947'
      ivoryVolume = '10%'
      break
    case 'type2':
      ivoryYear = '1975'
      ivoryVolume = '20%'
      break
    case 'type3':
      ivoryYear = '1918'
      ivoryVolume = '320 square centimetres'
      break
    case 'type4':
      ivoryYear = ''
      ivoryVolume = ''
      break
    case 'type5':
      ivoryYear = '1918'
      ivoryVolume = ''
      break
    default:
      ivoryYear = 'xxxx'
      ivoryVolume = 'xxxx'
  }

  var ageDetail
  ageDetail = req.session.data['ageDetail']

  var ivoryAge

  ivoryAge = (req.session.data['ivoryAge'])
  console.log( ivoryAge )

  var ageDetail
  ageDetail = req.session.data['ageDetail']

  switch (req.session.data['dealingIntent']) {
    case 'Sell it':
      dealingIntent = 'Sale'
      break
    case 'Hire it out':
      dealingIntent = 'Hire'
      break
    default:
      dealingIntent = 'Not available'
  }

  res.render(viewsFolder + 'check-your-answers-filled', {
    exemptionTypeChosen: exemptionTypeChosen,
    ivoryYear: ivoryYear,
    ivoryAge: ivoryAge,
    ageDetail: ageDetail,
    ivoryVolume: ivoryVolume,
    dealingIntent: dealingIntent,
    backUrl: backUrl,
    agentOwner: req.session.data['ownerAgent']
  })
})

router.post('/check-your-answers-filled', function (req, res) {
  res.redirect('confirmation')
})

//* ****************************************************
// CONFIRMATION
router.get('/confirmation', function (req, res) {

  var contactEmail

  if (req.session.data['ownerAgent'] == 'owner') {
    contactEmail = req.session.data['ownerEmail']
    contactName = req.session.data['ownerName']
  } else if (req.session.data['ownerAgent'] == 'agent') {
    contactEmail = req.session.data['agentEmail']
    contactName = req.session.data['agentName']
  }
  logger(req, 'ownerAgent=' + req.session.data['ownerAgent'] + ', therefore contact email=' + contactEmail)

  res.render(viewsFolder + 'confirmation', {
    contactEmail: contactEmail
  })
})

//* ****************************************************
// CONFIRMATION EMAIL
router.get('/confirmation-email', function (req, res){

  var exemption = req.query.e
  var contactEmail = "jacky.turner@boltsandratchets.co.uk"
  var contactName
  var contactBusiness

  if (req.session.data['ownerAgent'] == 'owner') {
    contactEmail = req.session.data['ownerEmail']
    contactName = req.session.data['ownerName']
    contactBusiness = req.session.data['addressBusiness']
  } else if (req.session.data['ownerAgent'] == 'agent') {
    contactEmail = req.session.data['agentEmail']
    contactName = req.session.data['agentName']
    contactBusiness = req.session.data['agentAddressBusiness']
  }
  logger(req, 'ownerAgent=' + req.session.data['ownerAgent'] + ', therefore contact email=' + contactEmail)

  const date = new Date()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const dayLong = date.toLocaleString('default', { weekday: 'long' })
  const day = date.toLocaleString('default', { day: 'numeric' })
  const month = date.toLocaleString('default', { month: 'long' })
  const year = date.getFullYear()
  const timeOfRegistration = `${hours}:${minutes}`
  const dateOfRegistration = `${dayLong} ${day} ${month} ${year}`

  res.render(viewsFolder + 'confirmation-email', {
    exemption: exemption,
    contactEmail: contactEmail,
    contactName: contactName,
    contactBusiness: contactBusiness,
    dateOfRegistration: dateOfRegistration,
    timeOfRegistration: timeOfRegistration
  })
})

//* ****************************************************
// REGISTRATION
router.get('/registration', function (req, res) {

  var exemption = req.query.e

  const date = new Date()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const dayLong = date.toLocaleString('default', { weekday: 'long' })
  const day = date.toLocaleString('default', { day: 'numeric' })
  const month = date.toLocaleString('default', { month: 'long' })
  const year = date.getFullYear()
  const timeOfRegistration = `${hours}:${minutes}`
  const dateOfRegistration = `${dayLong} ${day} ${month} ${year}`

  res.render(viewsFolder + 'registration', {
    exemption: exemption,
    dateOfRegistration: dateOfRegistration
  })
})

//* ****************************************************
// GOVPAY LOOKALIKE 1
router.get('/govpay-lookalike-1', function (req, res) {
  res.render(viewsFolder + 'govpay-lookalike-1')
})

router.post('/govpay-lookalike-1', function (req, res) {
  res.redirect('govpay-lookalike-2')
})

//* ****************************************************
// GOVPAY LOOKALIKE 2
router.get('/govpay-lookalike-2', function (req, res) {
  res.render(viewsFolder + 'govpay-lookalike-2')
})

router.post('/govpay-lookalike-2', function (req, res) {
  res.redirect('confirmation')
})

/// ///////////////////////////////////////////////////////////////////////////
// PAY
router.get('/pay', function (req, res) {
  console.log('DEBUG.routes.pay')

  res.redirect(process.env.GOVUK_PAY_PROTOTYPE_LINK)
})

//* ****************************************************
// CHECK REGISTRATION SEARCH
router.get('/check-registration-search', function (req, res) {
  res.render(viewsFolder + 'check-registration-search')
})

router.post('/check-registration-search', function (req, res) {
  res.redirect('check-registration-result')

  // res.redirect('check-registration-result', {
  //   sessionDataExists: sessionDataExists
  // });
})

//* ****************************************************
// CHECK REGISTRATION RESULT
router.get('/check-registration-result', function (req, res) {

  // If there's no session data set some
  // let sessionDataExists;
  // if (req.session.data['exemptionChoice']) {
  //   logger(req, 'Exemption choice exists, so stick with session variables')
  //   sessionDataExists = true;
  //
  // } else {
  //   logger(req, 'Exemption choice does NOT exist, so create some static example session variables')
  //   req.session.data['exemptionTypeText'] = 'Musical instrument with less than 20% ivory and made before 1975'
  //   req.session.data['title'] = 'Piano'
  //   req.session.data['description'] = 'An upright piano with ivory keys'
  //   req.session.data['ivoryAge'] = 'Manufacture dated on 1902'
  //   req.session.data['ivoryVolume'] = 'Expert assessed the volume about 5%'
  //   sessionDataExists = false;
  // }

  // res.render(viewsFolder + 'check-registration-result', {
  //   sessionDataExists: sessionDataExists
  // })

  res.render(viewsFolder + 'check-registration-result')
})

/// ///////////////////////////////////////////////////////////////////////////
// END OF ROUTES

module.exports = router
