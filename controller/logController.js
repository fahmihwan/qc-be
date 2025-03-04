const logger = require("../config/logging")

const logFe = async (req, res) => {

    // logger.error(req.body.error)
    res.status(200).send({
        data: req.body?.error
    })

}

module.exports = { logFe }