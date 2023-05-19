const auth = require("../middleware/auth")
const { Comments } = require("../models/comment")
const Connections = require("../models/connection")
const { Posts } = require("../models/post")
const { Reactions } = require("../models/reaction")
const { upload } = require("../storeImg")

async function postProcess(posts, userId) {

  const postIds = posts.map((post) => post._id)
  const reactions = await Reactions.find({ postId: { $in: postIds } }).populate('reactedBy.userId')
  const comments = await Comments.find({ postId: { $in: postIds } })


  const reactionMap = {}
  reactions.forEach((elem) => {
    reactionMap[elem.postId.toString()] = elem
  })

  const commentMap = {}
  comments.forEach((elem) => {
    const prop = elem.postId.toString()
    if (commentMap.hasOwnProperty(prop)) commentMap[prop] += 1
    else commentMap[prop] = 1
  })

  posts.forEach((post) => {
    const reaction = reactionMap[post._id.toString()]
    const commentsNum = commentMap[post._id.toString()]
    // console.log('commentNum---->', commentsNum)
    if (!reaction) {
      post.reaction = -1
      post.reactionCounter = []
    } else {
      const findingReactionType = reaction.reactedBy.find((elem) => String(elem.userId._id) == String(userId))
      if (!findingReactionType) {
        post.reaction = -1
      } else {
        post.reaction = findingReactionType.reactionType
      }
      post.reactionCounter = reaction.reactedBy
    }
    post.commentsNum = commentsNum || 0


  })

  return posts
}



module.exports = (app) => {
  app.post('/post/create', [auth, upload.single('postImg')], async (req, res) => {

    const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png']
    const imgMimetype = req.file?.mimetype
    const mimetypeArr = []
    if (imgMimetype) mimetypeArr.push(imgMimetype)
    const checkMimetype = mimetypeArr.every(elem => allowedFileTypes.includes(elem))
    if (!checkMimetype) {
      return res.status(400).send({ message: 'Invalid file type' })
    }


    const user = req.user
    const { postContent, visibility } = req.body
    const postImg = req.file?.filename

    const updates = {}
    if (postContent) updates.postContent = postContent
    if (postImg) updates.postImg = postImg
    updates.visibility = visibility
    updates.postOf = user._id

    const addedPost = new Posts(updates);
    await addedPost.save()
    res.status(201).send({ "message": "post created!", post: addedPost })
  })


  app.get("/post", auth, async (req, res) => {
    const userId = req.user._id;

    const searchedConnection = await Connections
      .find({ $or: [{ userA: userId }, { userB: userId }], connectionStatus: 2 })
      .populate('userA userB')
    const connectionIdArray = searchedConnection.map((elem) => {
      const connection = String(elem.userA._id) === String(userId) ? elem.userB._id : elem.userA._id
      return connection
    })
    connectionIdArray.push(userId)

    let posts = await Posts.find({ $or: [{ visibility: 'public' }, { postOf: { $in: connectionIdArray }, visibility: 'private' }] })
      .lean()
      .populate({ path: 'postOf' })
      .sort('-createdAt')

    posts = await postProcess(posts, userId)


    res.status(200).send({ posts: posts });

  })

  app.get('/post/user', auth, async (req, res) => {
    const userId = req.user._id
    const { otherId } = req.query
    const searchedConnection = await Connections
      .find({ $or: [{ userA: userId }, { userB: userId }], connectionStatus: 2 })

    // console.log(searchedConnection, "checking connectionsssss")

    let queryParameter
    if (searchedConnection.length === 0) {
      // console.log('1st inside')
      queryParameter = { postOf: otherId, visibility: 'public' }
    } else {
      // console.log('2nd inside')
      queryParameter = { postOf: otherId }
    }
    let posts = await Posts.find(queryParameter)
      .lean()
      .populate({ path: 'postOf' })
      .sort('-createdAt')


    posts = await postProcess(posts, userId)

    res.status(200).send({ posts: posts });

  })

  app.get('/post/me', auth, async (req, res) => {
    const userId = req.user._id
    let posts = await Posts.find({postOf: userId})
      .lean()
      .populate({ path: 'postOf' })
      .sort('-createdAt')

    posts = await postProcess(posts, userId)

    res.status(200).send({ posts: posts });
  })


}