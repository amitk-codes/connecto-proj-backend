const auth = require("../middleware/auth")
const { Reactions } = require("../models/reaction")


module.exports = (app) => {
  app.get('/get-reactions', auth, async(req, res)=>{
    const {postId} = req.query
    const reactions = await Reactions.find({postId}).populate('reactedBy.userId').sort('-createdAt')
    res.status(200).send({responseData: reactions})
})

app.post('/postreaction', auth, async (req, res) => {
    const userId = req.user._id
    const { postId, reactionType } = req.body
    const searched = await Reactions.findOne({ postId })
    if (!searched) {
        const added = new Reactions({
            postId, reactedBy: [{ userId, reactionType }]
        })
        await added.save()
    } else {
        const userReaction = searched.reactedBy.find((elem) => String(elem.userId) == String(userId))
        if (userReaction) userReaction.reactionType = reactionType
        else searched.reactedBy.push({ userId, reactionType })
        await searched.save()
    }
    res.status(200).send({ message: 'reaction sent' })

})

app.get('/checkreaction', auth, async (req, res) => {
    const userId = req.user._id
    const { postId } = req.body
    const searchedReaction = await Reactions.findOne({ postId })
    if (!searchedReaction) return res.status(200).send({ icon: -1 })
    const searchedReactedBy = searchedReaction.reactedBy.find((elem) => String(elem.userId) == String(userId))
    if (!searchedReactedBy) return res.status(200).send({ icon: -1 })
    return res.status(200).send({ icon: searchedReactedBy.reactionType })
})

app.delete('/removereaction', auth, async (req, res) => {
    const { postId } = req.body
    const userId = req.user._id
    let searchedReaction = await Reactions.findOne({ postId })
    if (!searchedReaction) return res.status(400).send({ message: 'Post Not Found !' })
    // console.log('arrayyy-->', searchedReaction.reactedBy)
    searchedReaction.reactedBy = searchedReaction.reactedBy.filter((elem) => String(elem.userId) != String(userId))
    // console.log(searchedReaction.reactedBy)
    await searchedReaction.save()
    return res.status(200).send({ message: 'reaction removed successfully' })
})
}